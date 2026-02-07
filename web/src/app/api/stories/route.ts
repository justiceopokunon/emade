import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isDatabaseConfigured, getDb } from "@/lib/db";
import { stories as defaultStories } from "@/lib/data";
import { handleError } from "@/lib/errorHandler";

// Use /tmp in serverless, data/ locally
const isProduction = process.env.VERCEL === '1';
const dataDir = isProduction ? '/tmp/data' : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "stories.json");

async function readDataFromFile() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultStories;
  }
}

async function readDataFromDatabase() {
  const sql = getDb();
  const rows = await sql`SELECT slug, title, excerpt, body, author, category, time, status, image_url, tags FROM stories ORDER BY time DESC`;
  return rows.map((r: any) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    author: r.author,
    category: r.category,
    time: r.time,
    status: r.status,
    imageUrl: r.image_url,
    tags: r.tags
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
  try {
    const data = await readData();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
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
        
        // Delete all existing stories and reinsert (full replace)
        await sql`DELETE FROM stories`;
        
        for (const story of body) {
          await sql`
            INSERT INTO stories (slug, title, excerpt, body, author, category, time, status, image_url, tags)
            VALUES (${story.slug}, ${story.title}, ${story.excerpt || ''}, ${story.body || ''}, ${story.author || 'Anonymous'}, ${story.category || 'General'}, ${story.time}, ${story.status || 'published'}, ${story.imageUrl || ''}, ${story.tags || []})
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
          message: "Story changes cannot be saved on Vercel without database. Use localhost or set up Neon Postgres (DATABASE_URL)."
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
      { error: 'Failed to save stories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
