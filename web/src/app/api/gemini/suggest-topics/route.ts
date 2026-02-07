import { NextResponse } from "next/server";
import { geminiGenerateJson, parseJsonFromText, isGeminiQuotaError } from "@/lib/gemini";
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
    if (isGeminiQuotaError(error)) {
      const fallback: TopicSuggestion[] = [
        {
          topic: "Setting up neighborhood battery safety kits",
          reason: "Recurring questions about handling swollen or leaking cells appeared in recent chats.",
          priority: "high",
          suggestedTitle: "Build a Neighborhood Battery Safety Drop-Off",
          keyPoints: [
            "Identify safe containment materials and labeling",
            "Coordinate weekly handoff to certified recyclers",
            "Share incident response steps with volunteers",
          ],
        },
        {
          topic: "Running community data-wipe workshops",
          reason: "Families continue to ask how to prepare devices before donation.",
          priority: "medium",
          suggestedTitle: "Host a Pop-Up Device Wipe Clinic",
          keyPoints: [
            "Checklist for secure erase across common devices",
            "Volunteer roles and privacy talking points",
            "How to vet donation partners",
          ],
        },
        {
          topic: "Repair skills for youth e-waste labs",
          reason: "Community stories emphasize youth interest in hands-on repair and reuse.",
          priority: "medium",
          suggestedTitle: "Kickstart a Youth Electronics Repair Lab",
          keyPoints: [
            "Starter toolkit and safety practices",
            "Curriculum ideas for short sessions",
            "Partnerships with schools and libraries",
          ],
        },
      ];
      return NextResponse.json({ suggestions: fallback, source: "fallback", warning: "Gemini quota exceeded" });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
