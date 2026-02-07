import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { put } from '@vercel/blob';
import { handleError } from "@/lib/errorHandler";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const isBlobConfigured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, AVIF allowed" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

    // Try Vercel Blob first if configured
    if (isBlobConfigured()) {
      try {
        const blob = await put(`uploads/${safeName}`, file, {
          access: 'public',
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
          message: "Image uploads require Vercel Blob Storage (BLOB_READ_WRITE_TOKEN environment variable).",
          suggestion: "Set up Vercel Blob Storage or upload files locally"
        },
        { status: 403 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, safeName);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ url: `/uploads/${safeName}`, storage: 'filesystem' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
