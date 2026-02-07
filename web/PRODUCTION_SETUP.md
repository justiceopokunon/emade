# Production Setup Guide

This guide will help you deploy your E-MADE site to production with full admin panel functionality.

## ✅ What's Already Done

- ✅ Database integration with Neon Postgres
- ✅ File upload integration with Vercel Blob
- ✅ All API routes updated with fallback support
- ✅ Mobile footer layout fixed
- ✅ Slideshow animations working
- ✅ Migration script ready
- ✅ Production environment detection

## 🎯 What You Need to Do

### 1. Create Neon Database (5 minutes)

1. Visit [neon.tech](https://neon.tech) and sign up
2. Create a new project (name it "e-made" or similar)
3. Copy the **Connection String** (starts with `postgresql://`)
4. Keep this for the next step

### 2. Add Database to Vercel (2 minutes)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string (paste from step 1)
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**

### 3. Create Vercel Blob Storage (3 minutes)

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database** → **Blob**
3. Name it "e-made-uploads" (or similar)
4. Click **Create**
5. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

### 4. Run Database Migration (5 minutes)

This one-time script migrates your existing JSON data to the database.

```bash
# Make sure you're in the web/ directory
cd web

# Set the DATABASE_URL temporarily in your terminal
# Windows PowerShell:
$env:DATABASE_URL="your-neon-connection-string-here"

# Or Windows CMD:
set DATABASE_URL=your-neon-connection-string-here

# Run the migration script
npm install tsx
npx tsx database/migrate.ts
```

The script will:
- Create all tables from the schema
- Migrate stories from `data/stories.json`
- Migrate DIY projects from `data/diy.json`
- Migrate site config from `data/site.json`
- Show progress with ✅ success indicators

### 5. Deploy to Production (1 minute)

```bash
git add .
git commit -m "Production database setup complete"
git push
```

Vercel will automatically deploy your changes.

## 🧪 Testing Your Deployment

### Test 1: Admin Panel Persistence
1. Visit your production site: `https://your-site.vercel.app/admin`
2. Make a change (edit hero message, add a story, etc.)
3. Save the change
4. Refresh the page
5. ✅ The change should persist

### Test 2: Forum Messages
1. Visit any story page on production
2. Post a chat message
3. Refresh the page
4. ✅ The message should still be there

### Test 3: File Uploads
1. Go to admin panel on production
2. Upload an image
3. ✅ Image should upload and display correctly

### Test 4: Reactions
1. Visit a story with chat messages
2. Click a reaction button (👍 helpful, ❤️ supportive, ✅ verified)
3. Refresh the page
4. ✅ Reaction count should persist

## 🔍 How It Works

### Smart Fallback System

All your API routes now use a fallback pattern:

```
1. Try Database First (production)
   ↓ (if DATABASE_URL is set)
   ✅ Success → Return with { storage: 'database' }
   ❌ Fail → Log error and try filesystem

2. Try Filesystem (local development)
   ↓ (if running locally)
   ✅ Success → Return with { storage: 'filesystem' }
   ❌ Fail in production → Return 403 error
```

This means:
- **Production (Vercel)**: Uses database + blob storage automatically
- **Local Development**: Uses filesystem (no database setup needed)
- **Graceful Degradation**: If database fails, falls back to files

### What Gets Stored Where

| Data Type | Local Dev | Production |
|-----------|-----------|------------|
| Stories | `data/stories.json` | Neon Database (`stories` table) |
| DIY Projects | `data/diy.json` | Neon Database (`diy_projects` table) |
| Site Config | `data/site.json` | Neon Database (`site_data` table) |
| Chat Messages | `data/chats.json` | Neon Database (`chat_messages` table) |
| Images | `public/uploads/` | Vercel Blob Storage |
| PDFs | `public/pdfs/` | Vercel Blob Storage |

## 📊 Database Schema

The migration creates these tables:

1. **stories** - All community e-waste stories
2. **diy_projects** - DIY repair/recycling guides
3. **chat_messages** - Forum comments with reactions
4. **site_data** - Site configuration (key-value pairs)
5. **team_members** - Team page information
6. **gallery_tiles** - Gallery page tiles
7. **contact_channels** - Contact methods

Plus indexes for fast queries on `slug`, `status`, `created_at`.

## 🆘 Troubleshooting

### "Production filesystem is read-only" Error

**Cause**: DATABASE_URL is not set in Vercel environment variables

**Fix**: 
1. Go to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon connection string
3. Redeploy

### "Failed to connect to database" Error

**Cause**: Invalid connection string or database not accessible

**Fix**:
1. Verify your Neon connection string is correct
2. Make sure the Neon database is active (not paused)
3. Check for typos in the environment variable name

### Migration Script Fails

**Cause**: Missing data files or syntax errors

**Fix**:
```bash
# Check if data files exist
ls data/
# Should show: stories.json, diy.json, site.json, chats.json

# If files are missing, create defaults:
mkdir -p data
echo "[]" > data/stories.json
echo "[]" > data/diy.json
echo "{}" > data/site.json
echo "{}" > data/chats.json

# Re-run migration
npx tsx database/migrate.ts
```

### File Uploads Return 403

**Cause**: BLOB_READ_WRITE_TOKEN is not set

**Fix**:
1. Go to Vercel → Storage → Create Blob Storage
2. Vercel automatically adds the token
3. Redeploy

### Admin Changes Work Locally But Not in Production

**Cause**: Using filesystem instead of database

**Fix**:
1. Ensure DATABASE_URL is set in Vercel
2. Check API response - it should say `{ storage: 'database' }`
3. If it says `{ storage: 'filesystem' }`, the database connection failed

## 🎉 Success Checklist

Once everything is working, you should see:

- ✅ Admin panel shows no production warning banner
- ✅ You can create, edit, and delete stories in production
- ✅ Forum messages persist across refreshes
- ✅ Reactions increment and save properly
- ✅ Image uploads work and display correctly
- ✅ PDF generation creates accessible files
- ✅ Analytics dashboard shows real-time data
- ✅ All changes persist after Vercel redeployments

## 🔐 Security Notes

- Database credentials are stored in Vercel environment variables (encrypted)
- Blob storage tokens are scoped to your project
- Chat messages go through AI moderation for safety
- Admin routes are protected (add proper auth in production!)

## 📞 Need Help?

Check the logs:
```bash
# View Vercel deployment logs
vercel logs --follow

# View local development logs
npm run dev
# Check terminal output for "Database read failed" or "Blob upload failed" messages
```

---

**Estimated Total Setup Time**: ~15 minutes

After completing these steps, your E-MADE site will be fully functional in production with persistent data storage! 🚀
