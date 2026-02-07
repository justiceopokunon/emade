import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';

// This script migrates data from JSON files to Neon database
// Run with: tsx database/migrate.ts

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

interface Story {
  slug?: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  time: string;
  status?: string;
  imageUrl?: string;
  tags: string[];
}

interface DIYProject {
  name: string;
  difficulty: string;
  time: string;
  outcome: string;
  materials: string[];
  steps: Array<{ title: string; description: string }>;
  safetyTips: string[];
  imageUrl?: string;
  pdfUrl?: string;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return null;
  }
}

async function migrateStories() {
  console.log('📚 Migrating stories...');
  const stories = await readJsonFile<Story[]>(path.join(process.cwd(), 'data', 'stories.json'));
  
  if (!stories || !Array.isArray(stories)) {
    console.log('  ⚠️  No stories found, skipping...');
    return;
  }

  for (const story of stories) {
    try {
      await sql`
        INSERT INTO stories (slug, title, excerpt, body, author, category, time, status, image_url, tags)
        VALUES (
          ${story.slug || story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')},
          ${story.title},
          ${story.excerpt},
          ${story.body},
          ${story.author},
          ${story.category},
          ${story.time},
          ${story.status || 'published'},
          ${story.imageUrl || null},
          ${story.tags}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          author = EXCLUDED.author,
          category = EXCLUDED.category,
          time = EXCLUDED.time,
          status = EXCLUDED.status,
          image_url = EXCLUDED.image_url,
          tags = EXCLUDED.tags
      `;
      console.log(`  ✅ Migrated story: ${story.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate story "${story.title}":`, error);
    }
  }
}

async function migrateDIY() {
  console.log('🔧 Migrating DIY projects...');
  const data = await readJsonFile<{ projects: DIYProject[] }>(path.join(process.cwd(), 'data', 'diy.json'));
  const projects = data?.projects;
  
  if (!projects || !Array.isArray(projects)) {
    console.log('  ⚠️  No DIY projects found, skipping...');
    return;
  }

  for (const project of projects) {
    try {
      await sql`
        INSERT INTO diy_projects (name, difficulty, time, outcome, materials, steps, safety_tips, image_url, pdf_url)
        VALUES (
          ${project.name},
          ${project.difficulty},
          ${project.time},
          ${project.outcome},
          ${project.materials},
          ${JSON.stringify(project.steps)},
          ${project.safetyTips},
          ${project.imageUrl || null},
          ${project.pdfUrl || null}
        )
        ON CONFLICT (name) DO UPDATE SET
          difficulty = EXCLUDED.difficulty,
          time = EXCLUDED.time,
          outcome = EXCLUDED.outcome,
          materials = EXCLUDED.materials,
          steps = EXCLUDED.steps,
          safety_tips = EXCLUDED.safety_tips,
          image_url = EXCLUDED.image_url,
          pdf_url = EXCLUDED.pdf_url
      `;
      console.log(`  ✅ Migrated DIY project: ${project.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate DIY project "${project.name}":`, error);
    }
  }
}

async function migrateSiteData() {
  console.log('⚙️  Migrating site configuration...');
  const siteData = await readJsonFile<any>(path.join(process.cwd(), 'data', 'site.json'));
  
  if (!siteData) {
    console.log('  ⚠️  No site data found, skipping...');
    return;
  }

  // Store each top-level key as a separate row
  for (const [key, value] of Object.entries(siteData)) {
    try {
      await sql`
        INSERT INTO site_data (key, value)
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `;
      console.log(`  ✅ Migrated site data: ${key}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate site data "${key}":`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    await migrateSiteData();
    await migrateStories();
    await migrateDIY();
    
    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();
