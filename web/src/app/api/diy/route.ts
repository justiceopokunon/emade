import { NextResponse } from "next/server";
import { loadDiyProjects, saveDiyProjects, DiyPersistenceError } from "@/lib/diyData";

export async function GET() {
  const data = await loadDiyProjects();
  const response = NextResponse.json(data);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storage = await saveDiyProjects(body);
    return NextResponse.json({ ok: true, storage });
  } catch (error) {
    console.error("Save error:", error);
    if (error instanceof DiyPersistenceError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    return NextResponse.json(
      {
        error: "Failed to save DIY data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
