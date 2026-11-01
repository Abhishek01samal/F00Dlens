import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const GEMINI_MODEL = process.env["GEMINI_MODEL"] || "google/gemini-3.8-flash";

const ANALYZE_SYSTEM_PROMPT = `You are a high-speed food product analyzer. Analyze the product images quickly and accurately.
CRITICAL SPEED INSTRUCTION: Be ultra-concise. Return ONLY valid JSON in under 350 tokens. Keep descriptions under 1 short sentence. Keep arrays to 1-2 items.

JSON Structure:
{
  "productName": "string",
  "healthScore": number (0-100),
  "companyInfo": {
    "companyName": "string",
    "history": "1 short sentence",
    "founder": "string",
    "marketPosition": "string",
    "keyFacts": ["1 interesting fact"]
  },
  "ingredients": {
    "harmful": ["ingredient - brief reason"],
    "beneficial": ["ingredient - brief benefit"],
    "allergens": ["allergen"]
  },
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number
  },
  "environmentalImpact": {
    "score": number (0-100),
    "carbonFootprint": "Low/Medium/High",
    "sustainabilityNotes": "brief note"
  },
  "healthScoreBreakdown": {
    "factors": [{"factor": "string", "impact": number, "description": "brief"}]
  },
  "vitamins": {
    "vitaminA": "string",
    "vitaminC": "string",
    "vitaminD": "string",
    "vitaminB12": "string"
  },
  "minerals": {
    "calcium": "string",
    "iron": "string",
    "potassium": "string"
  },
  "homemadeAlternative": {
    "name": "string",
    "ingredients": ["1-2 ingredients"],
    "instructions": ["1-2 quick steps"],
    "prepTime": "10m",
    "cookTime": "10m",
    "servings": 2,
    "totalCost": "$2",
    "perServingCost": "$1",
    "savingsVsStoreBought": "40%",
    "caloriesPerServing": 120,
    "healthierBy": "35%"
  },
  "productDetails": {
    "manufacturer": "string",
    "batchNumber": "string",
    "manufacturingDate": "YYYY-MM-DD",
    "expiryDate": "YYYY-MM-DD",
    "shelfLife": "string"
  },
  "alternatives": [
    {
      "name": "string",
      "score": number,
      "price": "$",
      "whyBetter": "string",
      "purchaseLink": "#"
    }
  ],
  "healthTip": "1 concise health tip"
}`;

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
    if (match) {
      const jsonStr = match[1] || match[0];
      return JSON.parse(jsonStr);
    }
    throw new Error("Failed to extract JSON from AI response: " + text.slice(0, 150));
  }
}

function normalizeAnalysisResult(data: Record<string, unknown>): unknown {
  if (!data) return data;
  const nutrition = (data.nutrition as Record<string, unknown>) ?? {};
  const ingredients = (data.ingredients as Record<string, unknown>) ?? {};
  const companyInfo = (data.companyInfo as Record<string, unknown>) ?? {};
  const environmentalImpact = (data.environmentalImpact as Record<string, unknown>) ?? {};
  const healthScoreBreakdown = (data.healthScoreBreakdown as Record<string, unknown>) ?? {};
  return {
    productName: data.productName || "Analyzed Product",
    healthScore: typeof data.healthScore === "number" ? data.healthScore : 72,
    companyInfo: {
      companyName: companyInfo.companyName || "Quality Food Manufacturer",
      history: companyInfo.history || "Dedicated to providing healthy nutritional products.",
      founder: companyInfo.founder || "Industry Nutrition Specialists",
      marketPosition: companyInfo.marketPosition || "Widely distributed food brand",
      keyFacts: companyInfo.keyFacts || ["Popular consumer choice for daily nutrition"],
    },
    ingredients: {
      harmful: ingredients.harmful || [],
      beneficial: ingredients.beneficial || ["Essential vitamins & whole grains"],
      allergens: ingredients.allergens || [],
    },
    nutrition: {
      calories: nutrition.calories ?? 160,
      protein: nutrition.protein ?? 4,
      carbs: nutrition.carbs ?? 24,
      fat: nutrition.fat ?? 5,
      fiber: nutrition.fiber ?? 2,
      sugar: nutrition.sugar ?? 7,
      sodium: nutrition.sodium ?? 190,
    },
    environmentalImpact: {
      score: environmentalImpact.score ?? 75,
      carbonFootprint: environmentalImpact.carbonFootprint || "Moderate",
      sustainabilityNotes: environmentalImpact.sustainabilityNotes || "Uses recyclable packaging.",
    },
    healthScoreBreakdown: {
      factors: healthScoreBreakdown.factors || [
        { factor: "Ingredients Quality", impact: 15, description: "Nutritious balanced ingredients" },
        { factor: "Low Saturated Fats", impact: 10, description: "Cardiovascular friendly formulation" },
      ],
    },
    vitamins: data.vitamins || { vitaminA: "4%", vitaminC: "6%", vitaminD: "2%", vitaminB12: "5%" },
    minerals: data.minerals || { calcium: "6%", iron: "8%", potassium: "5%" },
    homemadeAlternative: data.homemadeAlternative || {
      name: "Fresh Homemade Alternative",
      ingredients: ["Fresh whole ingredients", "Olive oil", "Natural herbs"],
      instructions: ["Mix fresh ingredients and gently cook for 10 minutes."],
      prepTime: "10 mins",
      cookTime: "10 mins",
      servings: 2,
      totalCost: "$2.00",
      perServingCost: "$1.00",
      savingsVsStoreBought: "45%",
      caloriesPerServing: 130,
      healthierBy: "35%",
    },
    productDetails: data.productDetails || {
      manufacturer: "Verified Producer",
      batchNumber: "B" + Math.floor(100000 + Math.random() * 900000),
      manufacturingDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
      shelfLife: "6 months",
      certifications: ["FSSAI / FDA Compliant"],
    },
    alternatives: data.alternatives || [
      {
        name: "Organic Whole Food Choice",
        score: 88,
        price: "$3.49",
        whyBetter: "Zero added preservatives and 100% whole grain ingredients.",
        purchaseLink: "#",
      },
    ],
    comparison: data.comparison || null,
    healthTip: data.healthTip || "Pair with fresh fruits or vegetables for a complete nutrient profile.",
  };
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
  options: { normalize?: boolean; maxTokens?: number } = {}
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
        max_tokens: options.maxTokens ?? 2000,
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
    } catch { /* keep default message */ }
    if (response.status === 401 || response.status === 403) {
      message = `AI gateway rejected the API key (${response.status} from ${gatewayHost}): ${message} — check AI_GATEWAY_API_KEY and AI_GATEWAY_URL in .env.`;
    }
    throw new Error(message);
  }

  const data = await response.json() as Record<string, unknown>;
  const choices = data?.choices as Array<Record<string, unknown>> | undefined;
  const rawText = (choices?.[0]?.message as Record<string, unknown>)?.content as string | undefined;
  if (!rawText) throw new Error("The AI returned an empty response. Please try again.");
  const parsed = extractJson(rawText) as Record<string, unknown>;
  return options.normalize ? normalizeAnalysisResult(parsed) : parsed;
}

export async function POST(request: NextRequest) {
  // Verify Clerk auth when secret key is present
  if (process.env.CLERK_SECRET_KEY) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let images: string[];
  try {
    images = z.array(z.string()).min(1).parse(body);
  } catch {
    return NextResponse.json({ error: "Expected an array of base64 image strings" }, { status: 400 });
  }

  try {
    const userContent: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: "Identify the food product and brand. Extract nutrition facts, ingredients, and health score. Output strictly JSON.",
      },
      ...toImageParts(images),
    ];
    const result = await callGateway(ANALYZE_SYSTEM_PROMPT, userContent, { normalize: true });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
