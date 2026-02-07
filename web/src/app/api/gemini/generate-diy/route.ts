import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText, isGeminiQuotaError } from "@/lib/gemini";
import { diyProjects as fallbackProjects } from "@/lib/data";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const system =
    "You write safety-first DIY guides for community e-waste handling. Return JSON only.";
  const prompt = `Return JSON in this exact shape:
{
  "project": {
    "name": string,
    "difficulty": "Starter"|"Builder"|"Advanced",
    "time": string,
    "outcome": string,
    "status": "draft",
    "steps": string[],
    "impact": string
  }
}
Keep steps short, safe, and suitable for community workshops.`;

  try {
    const result = await geminiGenerateJson({ apiKey, system, prompt, temperature: 0.7 });
    const parsed = parseJsonFromText<{ project: {
      name: string;
      difficulty: "Starter" | "Builder" | "Advanced";
      time: string;
      outcome: string;
      status: "draft";
      steps: string[];
      impact: string;
    } }>(result.text);

    if (!parsed.project?.name) throw new Error("No project returned");

    const project = {
      ...parsed.project,
      imageUrl: "",
      pdfUrl: "",
    };

    return NextResponse.json({ project });
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      const sample = fallbackProjects[0];
      const project = {
        ...sample,
        name: `${sample?.name ?? "DIY Guide"} (${new Date().toLocaleDateString()})`,
        status: "draft" as const,
        pdfUrl: sample?.pdfUrl || "",
        imageUrl: sample?.imageUrl || "",
      };
      return NextResponse.json({ project, source: "fallback", warning: "Gemini quota exceeded" });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
