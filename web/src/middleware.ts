import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware without authentication logic.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
