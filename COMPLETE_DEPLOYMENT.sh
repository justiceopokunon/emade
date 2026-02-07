#!/usr/bin/env bash

# Complete E-MADE Deployment Guide
# This script helps you deploy to emade.social step by step

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   E-MADE Complete Deployment to emade.social            ║"
echo "║   Step-by-step setup guide                               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}STEP 1: Prerequisites Check${NC}"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not installed, installing...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI $(vercel --version | head -1)${NC}"

echo ""
echo -e "${BLUE}STEP 2: Create Required Resources${NC}"
echo "====================================="
echo ""
echo -e "${YELLOW}A. Create Neon PostgreSQL Database${NC}"
echo "   1. Go to: https://neon.tech"
echo "   2. Sign up (free tier available)"
echo "   3. Create project: 'emade'"
echo "   4. Copy connection string"
echo ""
read -p "Enter DATABASE_URL: " DATABASE_URL

echo ""
echo -e "${YELLOW}B. Set up Vercel Blob Storage${NC}"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select 'web' project"
echo "   3. Settings > Storage > Create Blob"
echo "   4. Copy BLOB_READ_WRITE_TOKEN"
echo ""
read -p "Enter BLOB_READ_WRITE_TOKEN (press ENTER to skip): " BLOB_TOKEN

echo ""
echo -e "${YELLOW}C. Admin Password${NC}"
read -p "Enter admin password (default: slingshot-admin): " ADMIN_PASS
ADMIN_PASS=${ADMIN_PASS:-"slingshot-admin"}

echo ""
echo -e "${BLUE}STEP 3: Configure Vercel Environment${NC}"
echo "======================================"
echo ""

cd web

echo "Setting production environment variables..."

# Add environment variables
if [ ! -z "$DATABASE_URL" ]; then
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production
    echo -e "${GREEN}✓ DATABASE_URL set${NC}"
fi

if [ ! -z "$BLOB_TOKEN" ]; then
    echo "$BLOB_TOKEN" | vercel env add BLOB_READ_WRITE_TOKEN production
    echo -e "${GREEN}✓ BLOB_READ_WRITE_TOKEN set${NC}"
fi

echo "$ADMIN_PASS" | vercel env add ADMIN_PASS production
echo -e "${GREEN}✓ ADMIN_PASS set${NC}"

echo "AIzaSyBnLxvZvU4xgJ9sm9Uzn67nX3uqQyWxIbw" | vercel env add GEMINI_API_KEY production
echo -e "${GREEN}✓ GEMINI_API_KEY set${NC}"

echo ""
echo -e "${BLUE}STEP 4: Build Project${NC}"
echo "======================="
echo ""

npm run build
echo -e "${GREEN}✓ Build successful${NC}"

echo ""
echo -e "${BLUE}STEP 5: Configure Domain${NC}"
echo "=========================="
echo ""

echo "Adding emade.social domain..."
vercel domains add emade.social || echo -e "${YELLOW}⚠ Domain may already be configured${NC}"

echo ""
echo -e "${BLUE}STEP 6: Deploy to Production${NC}"
echo "============================="
echo ""

echo "Deploying to production..."
vercel --prod --yes

echo ""
echo -e "${BLUE}STEP 7: Set Up DNS${NC}"
echo "==================="
echo ""
echo "Important: Configure DNS with your domain registrar"
echo "1. Go to your domain registrar (GoDaddy, Namecheap, etc.)"
echo "2. Add CNAME record:"
echo "   - Name: @ (or empty)"
echo "   - Value: cname.vercel-dns.com"
echo "3. Wait 24-48 hours for DNS propagation"
echo ""

cd ..

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║          DEPLOYMENT COMPLETE!                       ║${NC}"
echo -e "║   Your site will be live at: https://emade.social     ║"
echo -e "║   Admin panel: https://emade.social/admin              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Admin Passwords:"
echo "  - slingshot-admin (or your custom password)"
echo "  - justiceopokunon"
echo "  - ghost"
echo "  - 00pium@tx"
echo ""
