import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText } from "@/lib/gemini";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const { message, name } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const system =
    "You are a helpful AI moderator for an e-waste education community. Assess messages for safety, provide helpful responses, and identify spam or harmful content. Always be supportive and educational.";

  const prompt = `Assess this community forum message and provide a helpful response if appropriate. Return JSON in this exact format:
{
  "allowed": boolean,
  "severity": "none"|"low"|"medium"|"high",
  "reason": string,
  "suggestedResponse": string or null,
  "category": "question"|"experience"|"spam"|"harmful"|"general",
  "sentiment": "positive"|"neutral"|"negative",
  "helpfulTags": string[]
}

Author: ${name || "Anonymous"}
Message: ${message}`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0.3 });
    const parsed = parseJsonFromText<{
      allowed: boolean;
      severity: "none" | "low" | "medium" | "high";
      reason: string;
      suggestedResponse: string | null;
      category: "question" | "experience" | "spam" | "harmful" | "general";
      sentiment: "positive" | "neutral" | "negative";
      helpfulTags: string[];
    }>(result.text);

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Moderation failed" },
      { status: 500 }
    );
  }
}
