import { NextResponse } from "next/server";
import { loadSiteData, saveSiteData } from "@/lib/siteData";

export async function GET() {
  const data = await loadSiteData();
  const response = NextResponse.json(data);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storage = await saveSiteData(body);
    return NextResponse.json({ ok: true, storage });
  } catch (error) {
    console.error("Failed to persist site data", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to save data",
        details: message,
      },
      { status: message.includes("read-only") ? 403 : 500 }
    );
  }
}
