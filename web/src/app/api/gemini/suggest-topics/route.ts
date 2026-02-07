import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText } from "@/lib/gemini";
import fs from "fs/promises";
import path from "path";

const CHATS_FILE = path.join(process.cwd(), "data", "chats.json");

interface TopicSuggestion {
  topic: string;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedTitle: string;
  keyPoints: string[];
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  try {
    // Read chat data to analyze community conversations
    let chatContext = "";
    try {
      const chatsRaw = await fs.readFile(CHATS_FILE, "utf-8");
      const chats = JSON.parse(chatsRaw);
      const allMessages = Object.values(chats).flat() as any[];
      const recentMessages = allMessages
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 50)
        .map((msg) => msg.message)
        .join("\n");
      chatContext = recentMessages || "No recent conversations";
    } catch {
      chatContext = "No chat data available";
    }

    const system =
      "You are an AI assistant helping e-waste education initiatives identify trending topics and content gaps. Analyze community conversations to suggest relevant story topics.";

    const prompt = `Based on recent community discussions below, suggest 3 story topics that would be most valuable for the E-MADE community. Focus on e-waste safety, recycling practices, DIY projects, or success stories.

Recent community messages:
${chatContext}

Return JSON in this exact format:
{
  "suggestions": [
    {
      "topic": string,
      "reason": string,
      "priority": "high"|"medium"|"low",
      "suggestedTitle": string,
      "keyPoints": [string, string, string]
    }
  ]
}`;

    const result = await geminiGenerateJson({
      apiKey,
      system,
      prompt,
      temperature: 0.7,
    });

    const parsed = parseJsonFromText<{ suggestions: TopicSuggestion[] }>(result.text);

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
