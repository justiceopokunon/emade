import path from "path";
import { promises as fs } from "fs";
import { diyProjects as defaultProjects } from "@/lib/data";
import { getDb, ensureCoreTables, isDatabaseConfigured } from "@/lib/db";

const isProduction = process.env.VERCEL === "1";
const dataDir = isProduction ? "/tmp/data" : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "diy.json");

export type DiyProject = {
  name: string;
  difficulty?: string;
  time?: string;
  outcome?: string;
  status?: string;
  imageUrl?: string;
  steps?: string[];
  materials?: string[];
  safetyTips?: string[];
  impact?: string;
  pdfUrl?: string;
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value === "string" && value.trim().length) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

const readFromFile = async (): Promise<DiyProject[]> => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : defaultProjects;
  } catch {
    return defaultProjects;
  }
};

const readFromDatabase = async (): Promise<DiyProject[]> => {
  await ensureCoreTables();
  const sql = getDb();
  const rows = await sql`
    SELECT
      name,
      difficulty,
      time,
      outcome,
      materials,
      steps,
      safety_tips,
      image_url,
      pdf_url
    FROM diy_projects
    ORDER BY name
  `;

  return rows.map((row: any) => ({
    name: row.name,
    difficulty: row.difficulty ?? "",
    time: row.time ?? "",
    outcome: row.outcome ?? "",
    imageUrl: row.image_url ?? "",
    pdfUrl: row.pdf_url ?? "",
    materials: normalizeArray(row.materials),
    steps: normalizeArray(row.steps),
    safetyTips: normalizeArray(row.safety_tips),
  }));
};

export async function loadDiyProjects(): Promise<DiyProject[]> {
  if (isDatabaseConfigured()) {
    try {
      return await readFromDatabase();
    } catch (error) {
      console.error("Failed to read DIY projects from database, falling back to file system.", error);
      return await readFromFile();
    }
  }
  return await readFromFile();
}

export class DiyPersistenceError extends Error {
  status: number;
  payload: Record<string, unknown>;

  constructor(status: number, payload: Record<string, unknown>) {
    super(typeof payload.error === "string" ? payload.error : "DIY persistence error");
    this.status = status;
    this.payload = payload;
  }
}

export async function saveDiyProjects(projects: DiyProject[]): Promise<"database" | "filesystem"> {
  if (!Array.isArray(projects)) {
    throw new DiyPersistenceError(400, { error: "Invalid payload" });
  }

  if (isDatabaseConfigured()) {
    try {
      await ensureCoreTables();
      const sql = getDb();
      await sql`DELETE FROM diy_projects`;

      for (const project of projects) {
        await sql`
          INSERT INTO diy_projects (
            name,
            difficulty,
            time,
            outcome,
            materials,
            steps,
            safety_tips,
            image_url,
            pdf_url
          ) VALUES (
            ${project.name},
            ${project.difficulty ?? ""},
            ${project.time ?? ""},
            ${project.outcome ?? ""},
            ${project.materials ?? []},
            ${JSON.stringify(project.steps ?? [])},
            ${project.safetyTips ?? []},
            ${project.imageUrl ?? ""},
            ${project.pdfUrl ?? ""}
          )
        `;
      }

      return "database";
    } catch (error) {
      console.error("Failed to persist DIY projects to database.", error);
      if (isProduction) {
        throw new DiyPersistenceError(500, {
          error: "Database write failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
      // Continue to filesystem fallback when not in production
    }
  }

  if (isProduction && !isDatabaseConfigured()) {
    throw new DiyPersistenceError(403, {
      error: "Production filesystem is read-only",
      message: "DIY project changes cannot be saved on Vercel without database. Use localhost or set up Neon Postgres (DATABASE_URL).",
    });
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(projects, null, 2), "utf8");
  return "filesystem";
}
