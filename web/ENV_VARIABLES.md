# 🔐 Environment Variables Reference

Quick reference for all environment variables needed for production deployment.

## Required for Production

### 1. DATABASE_URL
**Purpose**: Connects to Neon Postgres database for persistent data storage

**Get it from**: [neon.tech](https://neon.tech)
1. Create account and new project
2. Copy connection string from dashboard

**Format**:
```
postgresql://username:password@hostname/database?sslmode=require
```

**Add to Vercel**:
```bash
# Via Vercel Dashboard
Settings → Environment Variables → Add New
Name: DATABASE_URL
Value: your-connection-string
Environments: Production, Preview, Development

# Or via CLI
vercel env add DATABASE_URL
```

**Test locally**:
```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://username:password@hostname/database"
npm run dev

# Windows CMD
set DATABASE_URL=postgresql://username:password@hostname/database
npm run dev
```

---

### 2. BLOB_READ_WRITE_TOKEN
**Purpose**: Enables Vercel Blob storage for image/PDF uploads

**Get it from**: Vercel Dashboard
1. Go to your project
2. Click **Storage** tab
3. Click **Create Database** → **Blob**
4. Name it (e.g., "e-made-uploads")
5. Token is **automatically added** to your environment variables

**No manual configuration needed** - Vercel handles this automatically!

**Verify it's set**:
```bash
# In Vercel Dashboard
Settings → Environment Variables
# Should see: BLOB_READ_WRITE_TOKEN = blob_***************
```

---

### 3. GEMINI_API_KEY
**Purpose**: Powers AI features (story generation, chat moderation, content suggestions)

**Get it from**: [Google AI Studio](https://makersuite.google.com/app/apikey)
1. Sign in with Google account
2. Click "Create API Key"
3. Copy the key

**Add to Vercel**:
```bash
# Via Dashboard
Settings → Environment Variables → Add New
Name: GEMINI_API_KEY
Value: your-gemini-api-key

# Or via CLI
vercel env add GEMINI_API_KEY
```

**Test locally** (create `.env.local` file):
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## Optional for Production

### 4. ADMIN_SECRET
**Purpose**: Secures admin panel access (currently using cookie-based auth)

**Default**: Not currently used (TODO: implement proper auth)

**Future implementation**:
```env
ADMIN_SECRET=your-strong-random-string
```

---

## Development Only

### 5. NODE_ENV
**Purpose**: Indicates development vs production environment

**Set automatically** by Next.js:
- `development` when running `npm run dev`
- `production` when running `npm run build` or deployed to Vercel

**Do not set manually** unless you know what you're doing.

---

### 6. VERCEL
**Purpose**: Indicates if running on Vercel platform

**Set automatically** by Vercel (value: `"1"`)

**Used in code** to detect production environment:
```typescript
const isProduction = process.env.VERCEL === "1";
```

---

## Environment Variables Summary Table

| Variable | Required | Source | Auto-Set | Purpose |
|----------|----------|--------|----------|---------|
| `DATABASE_URL` | ✅ Yes | Neon Dashboard | ❌ No | Database connection |
| `BLOB_READ_WRITE_TOKEN` | ✅ Yes | Vercel Blob | ✅ Yes | File uploads |
| `GEMINI_API_KEY` | ⚠️ Optional | Google AI Studio | ❌ No | AI features |
| `ADMIN_SECRET` | ❌ No | You create | ❌ No | Future admin auth |
| `NODE_ENV` | ✅ Yes | Next.js | ✅ Yes | Environment mode |
| `VERCEL` | ✅ Yes | Vercel | ✅ Yes | Platform detection |

---

## Quick Setup Commands

### Create .env.local for Local Development
```bash
# In web/ directory
echo "GEMINI_API_KEY=your-key-here" > .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local
```

### Add All to Vercel (One Command)
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link your project
vercel link

# Add environment variables interactively
vercel env add DATABASE_URL
# Paste your Neon connection string

vercel env add GEMINI_API_KEY
# Paste your Gemini API key

# BLOB_READ_WRITE_TOKEN is added automatically when you create Blob storage
```

---

## Validation Checklist

After setting environment variables, verify:

### Vercel Dashboard
1. Go to Settings → Environment Variables
2. Should see:
   - ✅ `DATABASE_URL` (set by you)
   - ✅ `BLOB_READ_WRITE_TOKEN` (auto-set by Vercel Blob)
   - ✅ `GEMINI_API_KEY` (optional, set by you)

### Local Development
1. Create `.env.local`
2. Add variables
3. Run `npm run dev`
4. Check terminal - should not see "DATABASE_URL not set" warnings

### Production Deployment
1. Deploy: `git push`
2. Visit admin panel
3. Should NOT see "Production filesystem is read-only" warning
4. Make a change and save
5. Refresh page - change should persist

---

## Troubleshooting

### "DATABASE_URL is not defined"
- **Cause**: Environment variable not set
- **Fix**: Add to Vercel → Settings → Environment Variables
- **Verify**: `echo $env:DATABASE_URL` (PowerShell) or `echo %DATABASE_URL%` (CMD)

### "BLOB_READ_WRITE_TOKEN is not defined"
- **Cause**: Vercel Blob storage not created
- **Fix**: Vercel Dashboard → Storage → Create Blob
- **Verify**: Should auto-add the token

### "API key not valid"
- **Cause**: Invalid GEMINI_API_KEY
- **Fix**: Generate new key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Verify**: Test with `curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY`

### Changes still don't persist in production
- **Cause**: DATABASE_URL not in production environment
- **Fix**: Make sure you selected "Production" when adding the variable
- **Verify**: Vercel → Settings → Environment Variables → Check "Production" column

---

## Security Best Practices

1. **Never commit `.env.local`** to git
   - Added to `.gitignore` automatically
   
2. **Rotate keys regularly**
   - Database credentials: Every 90 days
   - API keys: Yearly or if compromised
   
3. **Use different keys for preview/production**
   - Vercel allows environment-specific variables
   
4. **Monitor usage**
   - Neon dashboard shows database activity
   - Vercel Blob shows storage usage
   - Google AI Studio shows API quota

---

**Quick Start**: See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for complete step-by-step guide.
