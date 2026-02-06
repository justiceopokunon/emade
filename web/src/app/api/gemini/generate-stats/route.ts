import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText } from "@/lib/gemini";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const system =
    "You create plausible, non-misleading impact stats for an e-waste education nonprofit. Return JSON only.";
  const prompt = `Return JSON in this exact shape:
{
  "stats": [
    { "label": string, "value": string, "detail": string },
    { "label": string, "value": string, "detail": string },
    { "label": string, "value": string, "detail": string }
  ]
}
Use conservative, realistic values and add context in detail.`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0.4 });
    const parsed = parseJsonFromText<{ stats: { label: string; value: string; detail: string }[] }>(
      result.text
    );
    if (!Array.isArray(parsed.stats)) throw new Error("No stats returned");
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
