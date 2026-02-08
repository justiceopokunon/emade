import path from "path";
import { promises as fs } from "fs";
import {
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
  galleryContent,
  galleryTiles,
} from "@/lib/data";
import { ensureCoreTables, getDb, isDatabaseConfigured } from "@/lib/db";

const isProduction = process.env.VERCEL === "1";
const dataDir = isProduction ? "/tmp/data" : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "site.json");

export type SiteData = {
  siteName: string;
  siteTagline: string;
  heroMessage: string;
  stats: typeof stats;
  teamMembers: typeof teamMembers;
  contactChannels: typeof contactChannels;
  ewasteImages: typeof ewasteImages;
  storyImages: typeof storyImages;
  navItems: typeof navItems;
  submitCta: typeof submitCta;
  galleryTiles?: typeof galleryTiles;
  galleryContent?: typeof galleryContent;
  [key: string]: unknown;
};

export const defaultSiteData: SiteData = {
  siteName: "E-MADE",
  siteTagline: "Repair. Reuse. Recycle.",
  heroMessage:
    "E-MADE keeps electronics out of landfills by collecting, sorting, and repairing gear with neighbors. We share what works so anyone can set up safe drop-offs and clinics without guesswork.",
  stats,
  teamMembers,
  contactChannels,
  ewasteImages,
  storyImages,
  navItems,
  submitCta,
  galleryTiles,
  galleryContent,
};

async function readFromFile(): Promise<SiteData> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultSiteData, ...(parsed as Record<string, unknown>) } as SiteData;
  } catch {
    return defaultSiteData;
  }
}

async function readFromDatabase(): Promise<SiteData> {
  await ensureCoreTables();
  const sql = getDb();
  const rows = await sql`
    SELECT key, value
    FROM site_data
  `;

  const result: Record<string, unknown> = { ...defaultSiteData };

  rows.forEach((row: Record<string, any>) => {
    const rawValue = row.value;
    if (typeof rawValue === "string") {
      try {
        result[row.key] = JSON.parse(rawValue);
        return;
      } catch {
        // fallback to raw string
      }
    }
    result[row.key] = rawValue;
  });

  return result as SiteData;
}

export async function loadSiteData(): Promise<SiteData> {
  if (isDatabaseConfigured()) {
    try {
      return await readFromDatabase();
    } catch (error) {
      console.error("Database read failed, falling back to file system", error);
      return await readFromFile();
    }
  }
  return await readFromFile();
}

export async function saveSiteData(update: Partial<SiteData>): Promise<"database" | "filesystem"> {
  if (isDatabaseConfigured()) {
    try {
      await ensureCoreTables();
      const sql = getDb();
      for (const [key, value] of Object.entries(update)) {
        await sql`
          INSERT INTO site_data (key, value)
          VALUES (${key}, ${JSON.stringify(value)})
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
      return "database";
    } catch (error) {
      console.error("Database write failed, attempting filesystem fallback", error);
      if (isProduction) {
        throw error;
      }
      // fall through to filesystem when not on Vercel
    }
  }

  if (isProduction) {
    throw new Error("Production filesystem is read-only without a configured database");
  }

  const current = await readFromFile();
  const next = { ...current, ...update };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2), "utf8");
  return "filesystem";
}