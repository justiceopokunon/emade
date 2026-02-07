import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText, slugify, isGeminiQuotaError } from "@/lib/gemini";
import { stories as fallbackStories } from "@/lib/data";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const system =
    "You write humane, safety-first community stories about e-waste harm, repair, and recycling. Output JSON only.";
  const prompt = `Generate one new story as JSON with this exact shape:
{
  "title": string,
  "category": string,
  "excerpt": string,
  "body": string,  // 3 short paragraphs separated by blank lines
  "author": string,
  "time": string,  // like "6 min read"
  "status": "draft",
  "tags": string[]
}
Avoid violence or graphic details. Keep language community-focused.`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0.7 });
    const parsed = parseJsonFromText<{
      title: string;
      category: string;
      excerpt: string;
      body: string;
      author: string;
      time: string;
      status: "draft";
      tags: string[];
    }>(result.text);

    const story = {
      ...parsed,
      slug: slugify(parsed.title || "story"),
      imageUrl: "",
      pdfUrl: "",
    };

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Story generation error:", error);
    if (isGeminiQuotaError(error)) {
      const sample = fallbackStories[0];
      const story = {
        ...sample,
        slug: `${slugify(sample?.title || "story")}-${Date.now()}`,
        status: "draft" as const,
      };
      return NextResponse.json({ story, source: "fallback", warning: "Gemini quota exceeded" });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
