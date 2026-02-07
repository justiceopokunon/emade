const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent`;

export class GeminiQuotaError extends Error {
  constructor(message?: string) {
    super(message || "Gemini quota exceeded");
    this.name = "GeminiQuotaError";
  }
}

const QUOTA_PATTERNS = [/quota/i, /limit: 0/i, /exceeded/i];

export type GeminiResult = {
  text: string;
  raw: unknown;
};

export async function geminiGenerateJson(params: {
  apiKey: string;
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<GeminiResult> {
  const { apiKey, system, prompt, temperature = 0.3 } = params;
  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
      ],
      systemInstruction: {
        parts: [{ text: system }],
      },
      generationConfig: {
        temperature,
      },
    }),
  });

  const raw = await res.json();
  if (!res.ok) {
    const message = (raw as { error?: { message?: string } })?.error?.message;
    console.error("Gemini API error:", { status: res.status, message, raw });
    const quotaHit = res.status === 429 || QUOTA_PATTERNS.some((pattern) => pattern.test(message || ""));
    if (quotaHit) {
      throw new GeminiQuotaError(message);
    }
    throw new Error(message || `Gemini request failed (status ${res.status})`);
  }

  const text =
    (raw as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return { text, raw };
}

export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in Gemini response");
    return JSON.parse(match[0]) as T;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isGeminiQuotaError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof GeminiQuotaError) return true;
  if (error instanceof Error) {
    const message = error.message || "";
    return QUOTA_PATTERNS.some((pattern) => pattern.test(message));
  }
  if (typeof error === "string") {
    return QUOTA_PATTERNS.some((pattern) => pattern.test(error));
  }
  return false;
}
