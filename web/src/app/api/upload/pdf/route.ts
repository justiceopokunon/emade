import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const isBlobConfigured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

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

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const extension = path.extname(safeName) || ".pdf";
    const baseName = path.basename(safeName, extension);
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const uniqueName = `${baseName}-${uniqueSuffix}${extension}`;
    const storageKey = `pdfs/${uniqueName}`;

    // Try Vercel Blob first if configured
    if (isBlobConfigured()) {
      try {
        const blob = await put(storageKey, file, {
          access: "public",
          contentType: "application/pdf",
        });
        return NextResponse.json({ url: blob.url, storage: 'blob' });
      } catch (blobError) {
        console.error('Blob upload failed, falling back to filesystem:', blobError);
        // Fall through to filesystem
      }
    }

    // Filesystem fallback
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction && !isBlobConfigured()) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "PDF uploads require Vercel Blob Storage (BLOB_READ_WRITE_TOKEN environment variable).",
          suggestion: "Set up Vercel Blob Storage or upload files locally"
        },
        { status: 403 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfDir = path.join(process.cwd(), "public", "pdfs");
    await fs.mkdir(pdfDir, { recursive: true });
    const targetPath = path.join(pdfDir, uniqueName);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ url: `/pdfs/${uniqueName}`, storage: 'filesystem' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
