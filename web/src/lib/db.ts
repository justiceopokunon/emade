import { neon } from '@neondatabase/serverless';

// Get database URL from environment variable
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }
  return url;
};

// Create database client
export const getDb = () => {
  try {
    const sql = neon(getDatabaseUrl());
    return sql;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

let coreTablesEnsured: Promise<void> | null = null;

export const ensureCoreTables = async () => {
  if (!coreTablesEnsured) {
    coreTablesEnsured = (async () => {
      const sql = getDb();

      await sql`
        CREATE TABLE IF NOT EXISTS site_data (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS stories (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title TEXT NOT NULL,
          excerpt TEXT,
          body TEXT NOT NULL,
          author VARCHAR(255),
          category VARCHAR(100),
          time VARCHAR(50),
          status VARCHAR(50) DEFAULT 'published',
          image_url TEXT,
          pdf_url TEXT,
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        ALTER TABLE stories
        ADD COLUMN IF NOT EXISTS pdf_url TEXT
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS diy_projects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          difficulty VARCHAR(50),
          time VARCHAR(100),
          outcome TEXT,
          materials TEXT[] DEFAULT '{}',
          steps JSONB DEFAULT '[]',
          safety_tips TEXT[] DEFAULT '{}',
          image_url TEXT,
          pdf_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          message_id VARCHAR(255) UNIQUE NOT NULL,
          story_slug VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          reply_to VARCHAR(255),
          reactions JSONB DEFAULT '{}'::jsonb,
          status VARCHAR(50) DEFAULT 'approved',
          moderated BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    })();
  }

  await coreTablesEnsured;
};

// Check if database is available
export const isDatabaseConfigured = () => {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
};

// Utility to handle database operations with fallback to file system
export const withDatabaseFallback = async <T>(
  dbOperation: () => Promise<T>,
  fileSystemFallback: () => Promise<T>
): Promise<T> => {
  if (isDatabaseConfigured()) {
    try {
      return await dbOperation();
    } catch (error) {
      console.error('Database operation failed, using filesystem fallback:', error);
      return await fileSystemFallback();
    }
  }
  return await fileSystemFallback();
};
