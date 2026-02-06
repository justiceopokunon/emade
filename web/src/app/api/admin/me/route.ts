import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("admin_auth")?.value;
    // Check if admin_auth cookie exists and has the correct value
    if (cookie === "authenticated") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
