import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const GEMINI_MODEL = process.env["GEMINI_MODEL"] || "google/gemini-3.8-flash";

const chatInputSchema = z.object({
  mode: z.string(),
  message: z.string(),
  images: z.array(z.string()).optional(),
  conversationHistory: z.array(z.unknown()).optional(),
  productA: z.string().optional(),
  productB: z.string().optional(),
  infoType: z.string().optional(),
});

function detectMimeAndData(raw: string): { mimeType: string; data: string } {
  if (raw.startsWith("data:")) {
    const [header = "", data = ""] = raw.split(",");
    const match = header.match(/data:([^;]+);base64/);
    return { mimeType: match?.[1] ?? "image/jpeg", data: data || raw };
  }
  let mimeType = "image/jpeg";
  if (raw.startsWith("iVBOR")) mimeType = "image/png";
  else if (raw.startsWith("UklGR")) mimeType = "image/webp";
  return { mimeType, data: raw };
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[1] || match[0]);
    throw new Error("Failed to extract JSON from AI response: " + text.slice(0, 150));
  }
}

function toImageParts(images: string[] | undefined) {
  if (!images || images.length === 0) return [];
  return images.map((img) => {
    const { mimeType, data } = detectMimeAndData(img);
    return { type: "image_url" as const, image_url: { url: `data:${mimeType};base64,${data}` } };
  });
}

async function callGateway(
  systemPrompt: string,
  userContent: Array<Record<string, unknown>>,
  maxTokens = 2000
): Promise<unknown> {
  const apiKey = process.env["AI_GATEWAY_API_KEY"] || process.env["GEMINI_API_KEY"] || process.env["API_KEY"];
  if (!apiKey) throw new Error("AI is not configured: set AI_GATEWAY_API_KEY (or GEMINI_API_KEY) in .env, then restart the dev server.");

  const gatewayUrl = process.env["AI_GATEWAY_URL"] || "https://ai.gateway.dev/v1/chat/completions";
  const gatewayHost = (() => { try { return new URL(gatewayUrl).host; } catch { return gatewayUrl; } })();

  let response: Response | undefined;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    response = await fetch(gatewayUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });
    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      continue;
    }
    break;
  }
  if (!response) throw new Error("AI request failed: no response from gateway.");

  if (!response.ok) {
    let message = `AI request failed (${response.status} from ${gatewayHost}).`;
    try {
      const body = await response.json() as Record<string, unknown>;
      const error = body?.error as Record<string, unknown> | undefined;
      if (error?.message) message = String(error.message);
      else if (typeof body?.message === "string") message = body.message as string;
    } catch { /* keep default */ }
    if (response.status === 401 || response.status === 403) {
      message = `AI gateway rejected the API key (${response.status} from ${gatewayHost}): ${message} — check AI_GATEWAY_API_KEY and AI_GATEWAY_URL in .env.`;
    }
    throw new Error(message);
  }

  const data = await response.json() as Record<string, unknown>;
  const choices = data?.choices as Array<Record<string, unknown>> | undefined;
  const rawText = (choices?.[0]?.message as Record<string, unknown>)?.content as string | undefined;
  if (!rawText) throw new Error("The AI returned an empty response. Please try again.");
  return extractJson(rawText);
}

export async function POST(request: NextRequest) {
  if (process.env.CLERK_SECRET_KEY) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let params: z.infer<typeof chatInputSchema>;
  try {
    params = chatInputSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { mode, message, images, productA, productB } = params;

  let systemPrompt = "";
  let userPrompt = message;
  let maxTokens = 2000;

  if (mode === "autocomplete") {
    systemPrompt = `Suggest 5 real, popular food products or dishes matching the partial name. Return ONLY valid JSON: {"suggestions": ["item1", "item2", "item3", "item4", "item5"]}`;
    userPrompt = `Suggest for: "${message}"`;
    maxTokens = 1200;
  } else if (mode === "product-info") {
    systemPrompt = `You are FoodLens AI, a food science and nutrition expert. Given a packaged food product name, produce a complete nutrition analysis report. Return ONLY valid JSON in exactly this structure:
{
  "productName": "string",
  "healthScore": 0-100 number,
  "scoreCategory": "string (e.g. Good, Average, Poor)",
  "ingredients": { "all": ["string"], "natural": ["string"], "artificial": ["string"], "harmful": ["string"], "preservatives": ["string"], "allergens": ["string"] },
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number, "sodium": number, "cholesterol": number },
  "ingredientExplainer": [{ "name": "string", "purpose": "string", "healthImpact": "good" | "bad" | "neutral", "details": "string" }],
  "redFlags": ["string"],
  "dietCompatibility": { "weightLoss": "string", "diabetic": "string", "keto": "string", "highProtein": "string", "lowFat": "string", "glutenFree": "string" },
  "processingLevel": "string (e.g. Minimally processed, Ultra-processed)",
  "environmentalScore": 0-100 number,
  "portionAdvice": "string",
  "tastePrediction": "string",
  "texturePrediction": "string"
}
Use realistic per-serving nutrition values and real-world ingredient knowledge for the product. Diet compatibility values should be "Suitable", "Not suitable", or "In moderation".`;
    maxTokens = 3000;
  } else if (mode === "food-history") {
    systemPrompt = `You are FoodLens AI, a culinary historian. Given a dish name, produce its complete origin and history profile. Return ONLY valid JSON in exactly this structure:
{
  "dishName": "string",
  "origin": { "country": "string", "region": "string", "century": "string" },
  "creator": { "who": "string", "why": "string" },
  "story": "string (2-3 sentences)",
  "authenticIngredients": ["string"],
  "popularCities": ["string"],
  "culturalSignificance": "string",
  "variations": ["string"],
  "funFacts": ["string"]
}
Use accurate historical and cultural knowledge for the dish.`;
  } else if (mode === "comparison") {
    systemPrompt = `Quickly compare two food products. Return valid JSON with comparison structure: {"comparison": {"productA": "...", "productB": "...", "healthScoreA": 80, "healthScoreB": 65, "winner": "Product A", "categories": [{"name": "Calories", "productA": "100", "productB": "150", "winner": "A", "explanation": "Lower calories"}]}}`;
    userPrompt = `Compare "${productA}" vs "${productB}".`;
  } else if (mode === "diet") {
    systemPrompt = `Create a fast personalized diet plan. Return valid JSON: {"type": "diet_plan", "calculations": {"bmr": 1600, "tdee": 2100, "targetCalories": 1800, "protein": 120, "carbs": 180, "fats": 50}, "meals": {"breakfast": ["Oats with almond milk"], "lunch": ["Brown rice with dal & salad"], "dinner": ["Grilled paneer/chicken with veggies"], "snacks": ["Roasted chana & almonds"]}, "gymAddons": {"preWorkout": "Banana", "postWorkout": "Protein shake"}, "advice": {"portionControl": "Use small plates", "hydration": "3 liters daily", "alternatives": ["Swap sugar for stevia"], "cheatMeal": "Once per week"}}`;
  } else {
    systemPrompt = `You are FoodLens AI. Return concise, helpful nutritional insights in valid JSON format.`;
  }

  try {
    const userContent: Array<Record<string, unknown>> = [
      { type: "text", text: userPrompt },
      ...toImageParts(images),
    ];
    const result = await callGateway(systemPrompt, userContent, maxTokens);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
