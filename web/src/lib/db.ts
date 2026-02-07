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
