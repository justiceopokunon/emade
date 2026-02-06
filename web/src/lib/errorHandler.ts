import { NextResponse } from "next/server";

export function handleError(error: unknown, status = 500) {
  console.error(error);
  return NextResponse.json({ error: "An unexpected error occurred." }, { status });
}
