import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { handleError } from "@/lib/errorHandler";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const pdfDir = path.join(process.cwd(), "public", "pdfs");
    await fs.mkdir(pdfDir, { recursive: true });
    const targetPath = path.join(pdfDir, safeName);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ url: `/pdfs/${safeName}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
