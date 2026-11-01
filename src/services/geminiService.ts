export interface AIChatParams {
  mode: string;
  message: string;
  images?: string[];
  conversationHistory?: Array<Record<string, unknown>>;
  productA?: string;
  productB?: string;
  infoType?: string;
}

export type ChatWithAIArgs = { data: AIChatParams } | AIChatParams;

export async function chatWithAI(args: ChatWithAIArgs): Promise<Record<string, any>> {
  const payload = "data" in args ? args.data : args;
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Chat failed");
  }
  return res.json();
}

export type AnalyzeProductArgs = { data: string[] } | string[];

export async function analyzeProduct(args: AnalyzeProductArgs): Promise<Record<string, any>> {
  const images = Array.isArray(args) ? args : args.data;
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(images),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Analysis failed");
  }
  return res.json();
}
