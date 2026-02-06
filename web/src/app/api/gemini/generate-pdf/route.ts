import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/gemini";

export async function POST(request: Request) {
  const { story } = await request.json();
  if (!story || typeof story !== "object") {
    return NextResponse.json({ error: "Missing story" }, { status: 400 });
  }

  const title = String(story.title || "Story");
  const excerpt = String(story.excerpt || "");
  const body = String(story.body || "");
  const author = String(story.author || "");
  const time = String(story.time || "");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let cursorY = height - margin;

  const drawText = (text: string, size: number, fontRef = font, color = rgb(1, 1, 1)) => {
    const lines = wrapText(text, fontRef, size, width - margin * 2);
    lines.forEach((line) => {
      page.drawText(line, { x: margin, y: cursorY, size, font: fontRef, color });
      cursorY -= size + 6;
    });
    cursorY -= 6;
  };

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.02, 0.03, 0.04) });
  drawText(title, 20, bold, rgb(0.93, 0.95, 1));
  if (excerpt) drawText(excerpt, 12, font, rgb(0.78, 0.82, 0.87));
  if (author || time) {
    drawText([author, time].filter(Boolean).join(" · "), 10, font, rgb(0.6, 0.65, 0.7));
  }

  body
    .split(/\n\s*\n/)
    .map((p: string) => p.trim())
    .filter(Boolean)
    .forEach((paragraph: string) => drawText(paragraph, 12));

  const pdfBytes = await pdfDoc.save();
  const fileName = `story-${slugify(title)}-${Date.now()}.pdf`;
  const pdfDir = path.join(process.cwd(), "public", "pdfs");
  await fs.mkdir(pdfDir, { recursive: true });
  await fs.writeFile(path.join(pdfDir, fileName), pdfBytes);

  return NextResponse.json({ url: `/pdfs/${fileName}` });
}

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
}
