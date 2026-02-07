# 🚀 Deployment & Production Guide

## Current Architecture

E-MADE currently uses **file-based storage** (JSON files in `data/` folder) which works perfectly in **local development** but has limitations in **production (Vercel)**.

## ⚠️ Production Limitations

### Why Changes Don't Persist on Vercel

Vercel uses a **read-only filesystem** for serverless functions. This means:

- ✅ **Reading data** works perfectly
- ❌ **Writing data** (admin changes, uploads, chats) does NOT persist
- ❌ File uploads are lost after deployment
- ❌ Admin panel edits revert on server restart

### Current Workaround

**Use localhost for admin operations:**

```bash
cd web
npm run dev
# Access admin at http://localhost:3000/admin
# Password: slingshot-admin
```

Changes made locally will be committed to the git repository and deployed.

---

## 🔧 Production Solutions

### Option 1: Vercel Postgres (Recommended)

**Setup:**

```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Add to Vercel project
vercel env add POSTGRES_URL
```

**Migration Steps:**

1. Create `lib/db.ts` with Postgres queries
2. Replace file reads/writes with SQL queries  
3. Migrate existing JSON data to database tables
4. Update API routes to use database

**Schema:**

```sql
CREATE TABLE site_data (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title TEXT,
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  story_slug VARCHAR(255),
  name VARCHAR(255),
  message TEXT,
  reactions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Option 2: Vercel KV (Redis)

**Setup:**

```bash
npm install @vercel/kv

# Add KV store to project
vercel kv create
```

**Usage:**

```typescript
import { kv } from '@vercel/kv';

// Save data
await kv.set('stories', JSON.stringify(stories));

// Read data
const stories = await kv.get('stories');
```

### Option 3: Vercel Blob Storage (For Files)

**Setup:**

```bash
npm install @vercel/blob

# Enable Blob storage
vercel blob create
```

**Usage:**

```typescript
import { put } from '@vercel/blob';

// Upload file
const blob = await put('image.jpg', file, {
  access: 'public',
});

console.log(blob.url); // https://blob.vercel-storage.com/...
```

---

## 📋 Implementation Steps

### Phase 1: Data Persistence (Postgres)

1. **Create migration scripts** (`scripts/migrate-to-postgres.ts`)
2. **Update API routes** to use Postgres instead of `fs.readFile/writeFile`
3. **Test locally** with local Postgres
4. **Deploy** to Vercel with Postgres connection

### Phase 2: File Uploads (Blob)

1. **Replace local uploads** with Vercel Blob
2. **Update upload API routes** (`/api/upload/image`, `/api/upload/pdf`)
3. **Handle PDF generation** to store in Blob
4. **Update image references** to use Blob URLs

### Phase 3: Real-Time Chat (KV or Postgres)

1. **Move chat storage** from `data/chats.json` to database
2. **Implement polling** or WebSockets for live updates
3. **Add pagination** for chat history
4. **Index by story slug** for fast queries

---

## 🛠️ Quick Fix for Current Deployment

**Until database migration is complete:**

### 1. Local Admin + Git Workflow

```bash
# Make changes locally
npm run dev
# Edit via http://localhost:3000/admin
# Commit changes
git add data/
git commit -m "Update content via admin"
git push
# Vercel auto-deploys
```

### 2. Environment Detection

The admin panel now shows warnings when in production mode. Users will see:

- ⚠️ Production mode banner
- Helpful error messages on save attempts
- Instructions to use localhost

### 3. Read-Only Production

Production site remains functional for:
- ✅ Viewing all content
- ✅ Browsing stories, DIY guides
- ✅ Contact information
- ❌ Submitting new stories (requires database)
- ❌ Chat functionality (requires database)

---

## 🎯 Recommended Path Forward

### Immediate (Week 1)
- [x] Add production warnings to admin panel
- [x] Update API routes with helpful error messages
- [ ] Document git-based workflow for content updates

### Short-term (Week 2-3)
- [ ] Implement Vercel Postgres for data
- [ ] Migrate existing JSON to database
- [ ] Test database in production

### Medium-term (Month 1)
- [ ] Add Vercel Blob for file uploads
- [ ] Implement real-time chat with KV
- [ ] Add admin UI for database management

### Long-term (Month 2+)
- [ ] Consider Supabase or Prisma for advanced features
- [ ] Add authentication beyond simple password
- [ ] Implement content moderation queue
- [ ] Add analytics dashboard with database

---

## 💡 Alternative: Hybrid Approach

**Keep file-based for static content, use database for dynamic:**

- **JSON files** → Team info, DIY guides, static stats (rarely change)
- **Postgres** → Stories, chats, analytics (frequently updated)
- **Blob Storage** → User uploads, PDFs, images

This minimizes migration effort while solving production issues.

---

## 📞 Support

For production database setup help:
- **Vercel Docs**: https://vercel.com/docs/storage
- **Postgres Quickstart**: https://vercel.com/docs/storage/vercel-postgres/quickstart
- **KV Quickstart**: https://vercel.com/docs/storage/vercel-kv/quickstart

## 🔐 Security Notes

When implementing database:
- Use environment variables for credentials
- Never commit connection strings
- Implement proper input validation
- Add rate limiting for writes
- Sanitize user-generated content
