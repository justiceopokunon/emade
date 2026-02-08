import { NextResponse } from "next/server";
import { loadStories, saveStories } from "@/lib/storyData";

export async function GET() {
  try {
    const data = await loadStories();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
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

    const storage = await saveStories(body);
    return NextResponse.json({ ok: true, storage });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: 'Failed to save stories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: error instanceof Error && error.message.includes('read-only') ? 403 : 500 }
    );
  }
}
