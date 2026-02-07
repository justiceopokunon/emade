import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isDatabaseConfigured, getDb, ensureCoreTables } from "@/lib/db";
import {
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
} from "@/lib/data";

// Use /tmp in serverless, data/ locally
const isProduction = process.env.VERCEL === '1';
const dataDir = isProduction ? '/tmp/data' : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "site.json");

const defaultSite = {
  siteName: "E-MADE",
  siteTagline: "Reduce. Reuse. Recycle",
  heroMessage: "E-MADE transforms electronic waste through collection, repair, recycling, and community education — creating safer environments and green opportunities.",
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
};

async function readDataFromFile() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return defaultSite;
  }
}

async function readDataFromDatabase() {
  await ensureCoreTables();
  const sql = getDb();
  
  // Fetch all site data rows
  const rows = await sql`SELECT key, value FROM site_data`;
  
  // Reconstruct the site data object from database rows
  const data: any = { ...defaultSite };
  
  rows.forEach((row: any) => {
    const rawValue = row.value;
    let parsedValue = rawValue;
    if (typeof rawValue === "string") {
      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        parsedValue = rawValue;
      }
    }
    data[row.key] = parsedValue;
  });
  
  return data;
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
  const response = NextResponse.json(data);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Try database first if configured
    if (isDatabaseConfigured()) {
      try {
        await ensureCoreTables();
        const sql = getDb();
        
        // Update each key separately in the database
        for (const [key, value] of Object.entries(body)) {
          await sql`
            INSERT INTO site_data (key, value)
            VALUES (${key}, ${JSON.stringify(value)})
            ON CONFLICT (key) DO UPDATE SET
              value = EXCLUDED.value,
              updated_at = CURRENT_TIMESTAMP
          `;
        }
        
        return NextResponse.json({ ok: true, storage: 'database' });
      } catch (dbError) {
        console.error('Database write failed, attempting file system:', dbError);
        if (isProduction) {
          return NextResponse.json(
            { error: 'Database write failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
            { status: 500 }
          );
        }
        // Fall through to file system in development
      }
    }
    
    // File system fallback
    if (isProduction && !isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: "Production filesystem is read-only",
          message: "Changes cannot be saved on Vercel without database integration. Please set up Neon Postgres (DATABASE_URL environment variable).",
          suggestion: "Run locally or configure DATABASE_URL in Vercel environment variables"
        },
        { status: 403 }
      );
    }

    const current = await readDataFromFile();
    const next = { ...current, ...body };
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
    return NextResponse.json({ ok: true, storage: 'filesystem' });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
