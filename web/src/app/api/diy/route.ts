import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { diyProjects as defaultProjects } from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
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
  const body = await request.json();
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
  return NextResponse.json({ ok: true });
}
