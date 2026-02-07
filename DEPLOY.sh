#!/bin/bash

# E-MADE Deployment Script for emade.social
# This script sets up all required environment variables for production deployment

echo "🚀 E-MADE Production Deployment Setup"
echo "======================================"
echo ""

# Check if we have the required values
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    echo "   Get from: https://neon.tech/"
    echo "   Format: postgresql://user:password@region.neon.tech/emade?sslmode=require"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not set"
    echo "   Get from: https://ai.google.dev/"
    exit 1
fi

if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
    echo "⚠️  BLOB_READ_WRITE_TOKEN not set (optional - file uploads disabled)"
fi

if [ -z "$ADMIN_PASS" ]; then
    echo "❌ ADMIN_PASS not set"
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""
echo "Setting up Vercel environment variables..."

# Add environment variables to Vercel project
vercel env add DATABASE_URL production "$DATABASE_URL"
vercel env add GEMINI_API_KEY production "$GEMINI_API_KEY"
vercel env add ADMIN_PASS production "$ADMIN_PASS"

if [ -n "$BLOB_READ_WRITE_TOKEN" ]; then
    vercel env add BLOB_READ_WRITE_TOKEN production "$BLOB_READ_WRITE_TOKEN"
fi

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "🌐 Configuring domain..."
vercel domains add emade.social

echo ""
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "   Your site is now live at: https://emade.social"
