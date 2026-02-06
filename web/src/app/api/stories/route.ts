import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { stories as defaultStories } from "@/lib/data";
import { handleError } from "@/lib/errorHandler";

// Use /tmp in serverless, data/ locally
const isProduction = process.env.VERCEL === '1';
const dataDir = isProduction ? '/tmp/data' : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "stories.json");

async function readData() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultStories;
  }
}

export async function GET() {
  try {
    const data = await readData();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save stories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
