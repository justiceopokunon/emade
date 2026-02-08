import path from "path";
import { promises as fs } from "fs";
import { stories as defaultStories } from "@/lib/data";
import { ensureCoreTables, getDb, isDatabaseConfigured } from "@/lib/db";

const isProduction = process.env.VERCEL === "1";
const dataDir = isProduction ? "/tmp/data" : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "stories.json");

export type StoryRecord = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  time: string;
  status: string;
  imageUrl: string;
  pdfUrl: string;
  tags: string[];
};

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function sanitizeStory(entry: Record<string, unknown>, fallbackIndex: number): StoryRecord {
  const fallback = defaultStories[fallbackIndex % defaultStories.length] ?? defaultStories[0];
  const title = typeof entry.title === "string" && entry.title.trim().length > 0
    ? entry.title.trim()
    : fallback?.title ?? "Untitled story";
  const slugSource = typeof entry.slug === "string" && entry.slug.trim().length > 0
    ? entry.slug.trim()
    : title;
  const normalizedSlug = normalizeSlug(slugSource);

  return {
    slug: normalizedSlug || normalizeSlug(fallback?.slug ?? title),
    title,
    excerpt: typeof entry.excerpt === "string" ? entry.excerpt : fallback?.excerpt ?? "",
    body: typeof entry.body === "string" ? entry.body : fallback?.body ?? "",
    author: typeof entry.author === "string" && entry.author.trim().length > 0
      ? entry.author.trim()
      : fallback?.author ?? "Community member",
    category: typeof entry.category === "string" && entry.category.trim().length > 0
      ? entry.category.trim()
      : fallback?.category ?? "Story",
    time: typeof entry.time === "string" && entry.time.trim().length > 0
      ? entry.time.trim()
      : fallback?.time ?? "",
    status: typeof entry.status === "string" && entry.status.trim().length > 0
      ? entry.status.trim()
      : fallback?.status ?? "published",
    imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : fallback?.imageUrl ?? "",
    pdfUrl: typeof entry.pdfUrl === "string" ? entry.pdfUrl : fallback?.pdfUrl ?? "",
    tags: Array.isArray(entry.tags)
      ? entry.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : Array.isArray(fallback?.tags)
        ? fallback.tags
        : [],
  };
}

async function readFromFile(): Promise<StoryRecord[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return defaultStories.map((story, idx) => sanitizeStory(story as any, idx));
    }
    return parsed.map((entry, idx) => sanitizeStory(entry as Record<string, unknown>, idx));
  } catch {
    return defaultStories.map((story, idx) => sanitizeStory(story as any, idx));
  }
}

async function readFromDatabase(): Promise<StoryRecord[]> {
  await ensureCoreTables();
  const sql = getDb();
  const rows = await sql`
    SELECT slug, title, excerpt, body, author, category, time, status, image_url, pdf_url, tags
    FROM stories
    ORDER BY created_at DESC NULLS LAST, title ASC
  `;

  if (!Array.isArray(rows) || rows.length === 0) {
    return defaultStories.map((story, idx) => sanitizeStory(story as any, idx));
  }

  return rows.map((row: any, idx: number) => sanitizeStory(
    {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      author: row.author,
      category: row.category,
      time: row.time,
      status: row.status,
      imageUrl: row.image_url,
      pdfUrl: row.pdf_url,
      tags: row.tags,
    },
    idx,
  ));
}

export async function loadStories(): Promise<StoryRecord[]> {
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

export async function loadStoryBySlug(slug: string): Promise<StoryRecord | undefined> {
  const normalized = normalizeSlug(slug);
  const stories = await loadStories();
  return stories.find((story) => normalizeSlug(story.slug || story.title) === normalized);
}

export async function saveStories(storiesPayload: unknown[]): Promise<"database" | "filesystem"> {
  if (isDatabaseConfigured()) {
    try {
      await ensureCoreTables();
      const sql = getDb();
      await sql`DELETE FROM stories`;
      for (const story of storiesPayload) {
        const sanitized = sanitizeStory((story ?? {}) as Record<string, unknown>, 0);
        await sql`
          INSERT INTO stories (slug, title, excerpt, body, author, category, time, status, image_url, pdf_url, tags)
          VALUES (
            ${sanitized.slug},
            ${sanitized.title},
            ${sanitized.excerpt},
            ${sanitized.body},
            ${sanitized.author},
            ${sanitized.category},
            ${sanitized.time},
            ${sanitized.status},
            ${sanitized.imageUrl},
            ${sanitized.pdfUrl},
            ${sanitized.tags}
          )
        `;
      }
      return "database";
    } catch (error) {
      console.error("Database write failed, attempting filesystem fallback", error);
      if (isProduction) {
        throw error;
      }
      // fall through when running locally
    }
  }

  if (isProduction) {
    throw new Error("Production filesystem is read-only without a configured database");
  }

  const sanitizedStories = storiesPayload.map((entry, idx) => sanitizeStory((entry ?? {}) as Record<string, unknown>, idx));
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(sanitizedStories, null, 2), "utf8");
  return "filesystem";
}
