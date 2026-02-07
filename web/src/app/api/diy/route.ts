import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { diyProjects as defaultProjects } from "@/lib/data";

// Use /tmp in serverless, data/ locally
const isProduction = process.env.VERCEL === '1';
const dataDir = isProduction ? '/tmp/data' : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "diy.json");

async function readData() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultProjects;
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "DIY project changes cannot be saved on Vercel without database. Use localhost or set up Vercel Postgres."
        },
        { status: 403 }
      );
    }

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
      { error: 'Failed to save DIY data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
