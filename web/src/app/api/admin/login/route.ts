import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body?.password || "");
    // Prefer a server-only ADMIN_PASS, but fall back to NEXT_PUBLIC_ADMIN_PASS
    // which is commonly used in local dev (documented in README).
    const ADMIN_PASS = process.env.ADMIN_PASS || process.env.NEXT_PUBLIC_ADMIN_PASS;
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Password received:", password);
    console.log("ADMIN_PASS env var:", ADMIN_PASS);
    
    if (!ADMIN_PASS) {
      console.log("ERROR: Admin not configured");
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    // Support multiple passwords separated by commas
    const validPasswords = ADMIN_PASS.split(",").map(p => p.trim());
    console.log("Valid passwords list:", validPasswords);
    console.log("Password matches:", validPasswords.includes(password));
    
    if (!validPasswords.includes(password)) {
      console.log("LOGIN FAILED - Invalid password");
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    console.log("LOGIN SUCCESSFUL");

    const res = NextResponse.json({ ok: true });
    // Set HttpOnly cookie for admin session; expires in 7 days
    // Use a simple auth token instead of storing passwords
    res.cookies.set("admin_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
