#!/bin/bash

# E-MADE Production Deployment
# Prerequisites: Neon database created, Vercel Blob storage created

set -e

echo "================================"
echo "E-MADE Production Deployment"
echo "================================"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    echo "Set it with: export DATABASE_URL='your-connection-string'"
    exit 1
fi

echo "✓ DATABASE_URL configured"
echo ""

# Run migration
echo "Running database migration..."
npx tsx database/migrate.ts

echo ""
echo "✓ Migration complete"
echo ""

# Build
echo "Building for production..."
npm run build

echo ""
echo "✓ Build successful"
echo ""
echo "Ready to deploy:"
echo "  git add ."
echo "  git commit -m 'Production deployment'"
echo "  git push origin master"
