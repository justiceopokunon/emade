import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { stories as defaultStories } from "@/lib/data";
import { handleError } from "@/lib/errorHandler";

const dataDir = path.join(process.cwd(), "data");
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
  const body = await request.json();
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
  return NextResponse.json({ ok: true });
}
