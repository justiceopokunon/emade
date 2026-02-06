import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import {
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
} from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "site.json");

const defaultSite = {
  siteName: "E-MADE",
  siteTagline: "Reduce. Reuse. Recycle",
  heroMessage: "E-MADE transforms electronic waste through collection, repair, recycling, and community education — creating safer environments and green opportunities.",
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
};

async function readData() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultSite;
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const current = await readData();
  const next = { ...current, ...body };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
  return NextResponse.json({ ok: true });
}
