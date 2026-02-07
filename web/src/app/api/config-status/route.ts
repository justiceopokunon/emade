import { NextResponse } from 'next/server';

// Check environment configuration status
export async function GET() {
  const hasBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;
  const hasDatabase = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  const hasGeminiApi = !!process.env.GEMINI_API_KEY;
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  
  return NextResponse.json({
    hasBlobStorage,
    hasDatabase,
    hasGeminiApi,
    isProduction,
    isFullyConfigured: hasBlobStorage && hasDatabase,
  });
}
