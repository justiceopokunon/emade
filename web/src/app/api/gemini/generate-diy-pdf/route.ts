import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/gemini";

interface DiyProject {
  name: string;
  difficulty: string;
  time: string;
  outcome: string;
  steps: string[];
  impact: string;
}

export async function POST(request: Request) {
  const { project } = await request.json();
  if (!project || typeof project !== "object") {
    return NextResponse.json({ error: "Missing project" }, { status: 400 });
  }

  const diy: DiyProject = {
    name: String(project.name || "DIY Guide"),
    difficulty: String(project.difficulty || "Starter"),
    time: String(project.time || ""),
    outcome: String(project.outcome || ""),
    steps: Array.isArray(project.steps) ? project.steps.map(String) : [],
    impact: String(project.impact || ""),
  };

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const lineHeight = 1.5;
  let cursorY = height - margin;

  // Helper to add new page if needed
  const checkNewPage = (neededSpace: number) => {
    if (cursorY - neededSpace < margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      cursorY = height - margin;
    }
  };

  // Draw background
  const drawBackground = () => {
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.02, 0.03, 0.05),
    });
  };

  drawBackground();

  // Helper to wrap and draw text
  const drawText = (
    text: string,
    size: number,
    fontRef = font,
    color = rgb(1, 1, 1),
    indent = 0
  ) => {
    const maxWidth = width - margin * 2 - indent;
    const lines = wrapText(text, fontRef, size, maxWidth);
    lines.forEach((line) => {
      checkNewPage(size + 8);
      if (cursorY === height - margin) drawBackground();
      page.drawText(line, {
        x: margin + indent,
        y: cursorY,
        size,
        font: fontRef,
        color,
      });
      cursorY -= size * lineHeight;
    });
    cursorY -= 4;
  };

  // Header accent bar
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width,
    height: 8,
    color: rgb(0.65, 0.85, 0.18), // Lime accent
  });

  cursorY -= 12;

  // Title
  drawText(diy.name.toUpperCase(), 24, bold, rgb(0.93, 0.96, 1));
  cursorY -= 8;

  // Metadata line
  const metaLine = [
    diy.difficulty && `Difficulty: ${diy.difficulty}`,
    diy.time && `Time: ${diy.time}`,
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (metaLine) {
    drawText(metaLine, 11, font, rgb(0.65, 0.85, 0.18));
  }

  cursorY -= 12;

  // Outcome section
  if (diy.outcome) {
    drawText("WHAT YOU'LL BUILD", 12, bold, rgb(0.7, 0.75, 0.8));
    drawText(diy.outcome, 11, font, rgb(0.85, 0.88, 0.92));
    cursorY -= 16;
  }

  // Steps section
  if (diy.steps.length > 0) {
    drawText("STEP-BY-STEP GUIDE", 12, bold, rgb(0.7, 0.75, 0.8));
    cursorY -= 4;
    diy.steps.forEach((step, index) => {
      const stepNum = `${index + 1}.`;
      checkNewPage(40);
      if (cursorY === height - margin) drawBackground();
      
      // Step number in accent color
      page.drawText(stepNum, {
        x: margin,
        y: cursorY,
        size: 11,
        font: bold,
        color: rgb(0.65, 0.85, 0.18),
      });
      
      // Step text
      const stepLines = wrapText(step, font, 11, width - margin * 2 - 24);
      stepLines.forEach((line, lineIdx) => {
        page.drawText(line, {
          x: margin + 24,
          y: cursorY - lineIdx * 16,
          size: 11,
          font,
          color: rgb(0.9, 0.92, 0.95),
        });
      });
      cursorY -= stepLines.length * 16 + 12;
    });
    cursorY -= 8;
  }

  // Impact section
  if (diy.impact) {
    checkNewPage(60);
    if (cursorY === height - margin) drawBackground();
    
    // Impact box
    const boxHeight = 60;
    page.drawRectangle({
      x: margin,
      y: cursorY - boxHeight + 20,
      width: width - margin * 2,
      height: boxHeight,
      color: rgb(0.08, 0.1, 0.12),
      borderColor: rgb(0.65, 0.85, 0.18),
      borderWidth: 1,
    });
    
    cursorY -= 8;
    page.drawText("COMMUNITY IMPACT", {
      x: margin + 12,
      y: cursorY,
      size: 10,
      font: bold,
      color: rgb(0.65, 0.85, 0.18),
    });
    cursorY -= 18;
    
    const impactLines = wrapText(diy.impact, font, 10, width - margin * 2 - 24);
    impactLines.forEach((line) => {
      page.drawText(line, {
        x: margin + 12,
        y: cursorY,
        size: 10,
        font,
        color: rgb(0.8, 0.83, 0.87),
      });
      cursorY -= 14;
    });
    cursorY -= 20;
  }

  // Footer
  checkNewPage(40);
  if (cursorY === height - margin) drawBackground();
  
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 36,
    color: rgb(0.04, 0.05, 0.07),
  });
  
  page.drawText("E-MADE · Reduce. Reuse. Recycle", {
    x: margin,
    y: 14,
    size: 8,
    font,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const fileName = `diy-${slugify(diy.name)}-${Date.now()}.pdf`;
  const pdfDir = path.join(process.cwd(), "public", "pdfs");
  await fs.mkdir(pdfDir, { recursive: true });
  await fs.writeFile(path.join(pdfDir, fileName), pdfBytes);

  return NextResponse.json({ url: `/pdfs/${fileName}` });
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
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
