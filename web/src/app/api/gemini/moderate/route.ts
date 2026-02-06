import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText } from "@/lib/gemini";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const system =
    "You are a safety moderator for community e-waste education content. Return JSON only.";
  const prompt = `Assess the following content for safety, harassment, or harmful guidance. Respond with JSON exactly in this shape:
{
  "allowed": boolean,
  "severity": "none"|"low"|"medium"|"high",
  "reasons": string[],
  "summary": string
}
Content:\n${text}`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0 });
    const parsed = parseJsonFromText<{
      allowed: boolean;
      severity: "none" | "low" | "medium" | "high";
      reasons: string[];
      summary: string;
    }>(result.text);

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Moderation failed" },
      { status: 500 }
    );
  }
}
