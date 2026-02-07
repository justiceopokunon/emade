// Utility to check if running in production (Vercel)
export const isProduction = () => {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
};

// Check if filesystem writes are supported
export const hasFileSystemAccess = () => {
  return !isProduction();
};

// Get appropriate storage message for admin
export const getStorageWarning = () => {
  if (isProduction()) {
    return "⚠️ Production Mode: File changes require database setup. Contact admin for Vercel KV/Postgres integration.";
  }
  return null;
};

// Check if feature is available in current environment
export const isFeatureAvailable = (feature: "fileWrite" | "upload" | "pdfGeneration") => {
  if (!isProduction()) return true;
  
  // In production, only reads are available without database
  if (feature === "fileWrite") return false;
  if (feature === "upload") return !!process.env.BLOB_READ_WRITE_TOKEN; // Vercel Blob
  if (feature === "pdfGeneration") return !!process.env.BLOB_READ_WRITE_TOKEN;
  
  return false;
};
