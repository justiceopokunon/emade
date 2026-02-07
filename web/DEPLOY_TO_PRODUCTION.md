# 🚀 Complete Production Deployment Guide for emade.social

This guide walks you through every step to deploy your E-MADE site to **emade.social** with full functionality.

## ⏱️ Total Time: ~30 minutes

---

## PART 1: Database Setup (5-10 minutes)

### Step 1.1: Create Neon Postgres Database

1. Open [neon.tech/sign-up](https://neon.tech/sign-up)
2. Sign up with email or GitHub
3. Create a new project:
   - **Project name**: `e-made` (or your choice)
   - **Region**: Select closest to your users (US-East recommended)
   - **Postgres version**: Latest
4. Click **Create project**
5. You'll see the **Connection String** page
6. Copy the full connection string (looks like `postgresql://username:password@hostname/database?sslmode=require`)
7. **Keep this tab open** - you'll use it in Step 2

### Step 1.2: Verify Neon Database

The connection string should look like:
```
postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
```

---

## PART 2: Vercel Environment Setup (5 minutes)

### Step 2.1: Add Database URL to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **e-made** project
3. Click **Settings** tab
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. **Environment Variable**:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string from Step 1.6
   - **Environments**: Check ✅ **Production**, ✅ **Preview**, ✅ **Development**
7. Click **Save**

### Step 2.2: Create Vercel Blob Storage

1. In Vercel dashboard, go to **Storage** tab
2. Click **Create** → **Blob**
3. **Name**: `e-made-uploads`
4. **Region**: Same as your project
5. Click **Create**
6. ✅ Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to environment variables

### Step 2.3: Verify Environment Variables

Go back to **Settings** → **Environment Variables** and confirm:
- ✅ `DATABASE_URL` is set (shows in all 3 environments)
- ✅ `BLOB_READ_WRITE_TOKEN` is set (auto-added)

---

## PART 3: Database Migration (5 minutes)

### Step 3.1: Run Migration Script Locally

In your terminal (PowerShell/CMD), navigate to the project:

```powershell
# Navigate to web directory
cd "C:\Users\kingo\OneDrive\Desktop\action\web"

# Set DATABASE_URL for this session
$env:DATABASE_URL="postgresql://paste-your-connection-string-here"

# Install migration tool if needed
npm install tsx --save-dev

# Run migration
npx tsx database/migrate.ts
```

Wait for output like:
```
📚 Starting migration...
✅ Connected to database
✅ Schema created successfully
✅ Migrated 5 stories
✅ Migrated 3 DIY projects
✅ Site config synced
✅ Migration complete!
```

**If migration fails**, try:
```powershell
# Clear and reinstall dependencies
rm node_modules -Recurse -Force
npm install
npx tsx database/migrate.ts
```

---

## PART 4: Setup Custom Domain (3-5 minutes)

### Step 4.1: Point Domain to Vercel

**If you already own emade.social:**

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find **DNS Settings**
3. Add CNAME record:
   - **Name**: `www`
   - **Value**: `cname.vercel.sh`
4. Add A record:
   - **Name**: `@` (or bare domain)
   - **Value**: `76.76.19.19`
5. Save changes (may take 5-30 minutes to propagate)

**Alternative: Let Vercel manage DNS**
1. In Vercel dashboard → **Settings** → **Domains**
2. Click **Add domain**
3. Enter `emade.social`
4. Vercel shows nameservers to add at your registrar
5. Update at your domain registrar
6. Wait for DNS propagation

### Step 4.2: Add Domain to Vercel Project

1. Vercel dashboard → **Settings** → **Domains**
2. Click **Add domain**
3. Enter `emade.social`
4. Enter `www.emade.social` (for www subdomain)
5. Click **Add**
6. Follow DNS setup instructions
7. Vercel auto-configures SSL/HTTPS (wait 5-30 sec)

---

## PART 5: Deploy to Production (2 minutes)

### Step 5.1: Commit and Push

```powershell
# In web directory
cd web

# Stage all changes
git add .

# Commit
git commit -m "Production deployment: Neon DB, Vercel Blob, emade.social domain"

# Push to GitHub
git push origin main
```

Vercel auto-deploys when you push. Monitor at [vercel.com/dashboard](https://vercel.com/dashboard).

### Step 5.2: Monitor Deployment

1. Go to Vercel dashboard
2. Watch the deployment progress
3. When green checkmark appears, your site is live
4. Your site is automatically assigned a Vercel URL like `e-made.vercel.app`
5. Once DNS propagates, `emade.social` will also work

---

## PART 6: Verify Everything Works (5 minutes)

### ✅ Test 1: Admin Panel Works

1. Visit `https://emade.social/admin` (or `https://e-made.vercel.app/admin`)
2. You should **NOT** see any "Production filesystem is read-only" warning
3. Make a test change (edit hero message)
4. Click Save
5. Refresh the page
6. ✅ Change should persist

### ✅ Test 2: Create a Story

1. Go to `/admin`
2. Scroll to "Stories" section
3. Fill in form:
   - **Title**: "Test Story from Production"
   - **Author**: Your name
   - **Message**: Test message
4. Click **Add Story**
5. Go to `/stories`
6. ✅ Story should appear

### ✅ Test 3: Forum Messages

1. Visit any story page
2. Scroll to forum section
3. Enter name and message
4. Click **Submit**
5. Message appears instantly
6. Refresh page
7. ✅ Message still there

### ✅ Test 4: Image Upload

1. Go to Admin → Gallery Tools section
2. Upload an image
3. ✅ Should upload to Vercel Blob
4. Image displays correctly

### ✅ Test 5: Mobile Responsive

1. On your site, press `F12` to open DevTools
2. Click responsive design icon
3. Test on phone sizes
4. ✅ Footer should be grid layout on mobile
5. ✅ All text readable

---

## PART 7: What Happened Behind the Scenes

### How Data Now Works in Production:

```
You type → Admin Panel
  ↓
API Route (e.g., /api/stories POST)
  ↓
Is DATABASE_URL set?
  ├─ YES → Connect to Neon Database
  │         ✅ Data persists across deployments
  └─ NO → Use filesystem (local dev only)
         ❌ Lost on Vercel (read-only after deployment)
```

### File Storage Now Works:

```
You upload image → Form submission
  ↓
/api/upload/image route
  ↓
Is BLOB_READ_WRITE_TOKEN set?
  ├─ YES → Upload to Vercel Blob
  │         ✅ URL is permanent, survives redeployments
  └─ NO → Save to public/uploads/ (local only)
         ❌ Lost on Vercel
```

---

## PART 8: Database Schema Overview

When migration runs, it creates these tables:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `stories` | Community e-waste experiences | slug, title, author, body, category, status |
| `diy_projects` | DIY repair guides | name, description, difficulty, steps (JSON) |
| `chat_messages` | Forum discussions | id, story_slug, message, reactions (JSON) |
| `site_data` | Site configuration | key, value (as JSON) |
| `team_members` | Team page info | name, role, bio, image_url |
| `gallery_tiles` | Gallery page layout | title, description, image_url, size |
| `contact_channels` | Contact methods | type, value |

All tables have indexed columns for fast queries and auto-updating timestamps.

---

## PART 9: Troubleshooting

### Problem: "DATABASE_URL is not available"
- **Cause**: Environment variable not added to Vercel
- **Fix**: Vercel → Settings → Environment Variables → Verify `DATABASE_URL` exists

### Problem: Changes still don't persist
- **Cause**: Deployment using old environment
- **Fix**: After adding environment variables, redeploy in Vercel Dashboard → "Redeploy"

### Problem: Custom domain not working
- **Cause**: DNS propagation delay or misconfiguration
- **Fix**: 
  1. Wait 5-30 minutes for DNS to propagate
  2. Check nameservers at registrar match Vercel's nameservers
  3. Verify CNAME and A records are correct

### Problem: Migration script fails
- **Cause**: Missing data files or incorrect connection string
- **Fix**:
  ```powershell
  # Check connection string is correct (copy from Neon.tech again)
  # Check data files exist:
  Get-ChildItem .\data\
  
  # Should show: stories.json, diy.json, site.json
  ```

### Problem: Images upload but don't display
- **Cause**: Blob storage not configured
- **Fix**: Vercel → Storage → Verify Blob is created and token is set

---

## PART 10: Going Live Checklist

Before declaring success, verify:

- ✅ Clone your repo to test fresh
- ✅ Run `npm install && npm run build` - builds successfully  
- ✅ Admin panel accessible at `/admin`
- ✅ Can create stories/DIY/team members
- ✅ Forum messages persist across refreshes
- ✅ Images upload and display
- ✅ Mobile layout works properly
- ✅ Custom domain `emade.social` resolves
- ✅ HTTPS shows secure lock icon
- ✅ Performance: PageSpeed shows green scores

---

## PART 11: Ongoing Maintenance

### Monitoring

```bash
# View live logs from Vercel
vercel logs --follow

# See build deployment status
vercel deployments
```

### Making Changes

```bash
# Development: Changes sync in real-time with npm run dev
npm run dev

# Production: 
git add .
git commit -m "Update description"
git push
# Vercel auto-deploys within 1-2 minutes
```

### Database Backups

Neon automatically backs up your database. To export:
1. Neon Dashboard → Project → Backups
2. Create manual backup before major changes

---

## 🎉 Success!

Once all tests pass, you're live! Your E-MADE site is now:
- ✅ Fully persistent (database-backed)
- ✅ Scalable (Neon handles growth)
- ✅ Secure (HTTPS, encrypted credentials)
- ✅ Deployed on custom domain (emade.social)
- ✅ Production-ready for Slingshot Challenge

**Next**: Update your submission links to point to `https://emade.social`

---

## Quick Reference Commands

```powershell
# Set DATABASE_URL locally
$env:DATABASE_URL="postgresql://..."

# Run migration
npx tsx database/migrate.ts

# Deploy
git push origin main

# View logs
vercel logs --follow

# Redeploy (if needed)
vercel --prod
```

---

Need help? Check [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for more details.
