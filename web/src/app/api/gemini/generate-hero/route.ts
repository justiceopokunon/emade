import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText } from "@/lib/gemini";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const system =
    "You write concise, humane hero copy for an e-waste safety and education site. Return JSON only.";
  const prompt = `Return JSON in this exact shape:
{
  "heroMessage": string
}
The message should be 1-2 sentences, safety-first, community-focused, and non-technical.`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0.6 });
    const parsed = parseJsonFromText<{ heroMessage: string }>(result.text);
    if (!parsed.heroMessage) throw new Error("No heroMessage returned");
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
