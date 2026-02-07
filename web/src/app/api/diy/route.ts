import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isDatabaseConfigured, getDb } from "@/lib/db";
import { diyProjects as defaultProjects } from "@/lib/data";

// Use /tmp in serverless, data/ locally
const isProduction = process.env.VERCEL === '1';
const dataDir = isProduction ? '/tmp/data' : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "diy.json");

async function readDataFromFile() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultProjects;
  }
}

async function readDataFromDatabase() {
  const sql = getDb();
  const rows = await sql`SELECT name, description, difficulty, time, category, image_url, steps, materials FROM diy_projects ORDER BY name`;
  return rows.map((r: any) => ({
    name: r.name,
    description: r.description,
    difficulty: r.difficulty,
    time: r.time,
    category: r.category,
    imageUrl: r.image_url,
    steps: r.steps,
    materials: r.materials
  }));
}

async function readData() {
  if (isDatabaseConfigured()) {
    try {
      return await readDataFromDatabase();
    } catch (error) {
      console.error('Database read failed, falling back to file system:', error);
      return await readDataFromFile();
    }
  }
  return await readDataFromFile();
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Try database first if configured
    if (isDatabaseConfigured()) {
      try {
        const sql = getDb();
        
        // Delete all existing DIY projects and reinsert (full replace)
        await sql`DELETE FROM diy_projects`;
        
        for (const project of body) {
          await sql`
            INSERT INTO diy_projects (name, description, difficulty, time, category, image_url, steps, materials)
            VALUES (${project.name}, ${project.description || ''}, ${project.difficulty || 'Beginner'}, ${project.time || ''}, ${project.category || 'General'}, ${project.imageUrl || ''}, ${JSON.stringify(project.steps || [])}, ${JSON.stringify(project.materials || [])})
          `;
        }
        
        return NextResponse.json({ ok: true, storage: 'database' });
      } catch (dbError) {
        console.error('Database write failed, attempting file system:', dbError);
        // Fall through to file system
      }
    }
    
    // File system fallback
    const isProduction = process.env.VERCEL === "1";
    
    if (isProduction && !isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "DIY project changes cannot be saved on Vercel without database. Use localhost or set up Neon Postgres (DATABASE_URL)."
        },
        { status: 403 }
      );
    }

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true, storage: 'filesystem' });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save DIY data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
