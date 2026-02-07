import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { geminiGenerateJson, parseJsonFromText, slugify, isGeminiQuotaError } from "@/lib/gemini";
import { stories as fallbackStories } from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "stories.json");

async function readStories() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackStories;
  } catch {
    return fallbackStories;
  }
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });
  }
  const auth = request.headers.get("x-cron-secret");
  if (auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}`;

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

    const stories = await readStories();
    const next = [story, ...stories];
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");

    return NextResponse.json({ ok: true, story });
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      const sample = fallbackStories[0];
      const story = {
        ...sample,
        status: "draft" as const,
        slug: `${slugify(sample?.title || "story")}-${Date.now()}`,
        imageUrl: sample?.imageUrl || "",
        pdfUrl: "",
      };
      const stories = await readStories();
      const next = [story, ...stories];
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
      return NextResponse.json({ ok: true, story, source: "fallback", warning: "Gemini quota exceeded" });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
