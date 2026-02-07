# ✅ Production Deployment Checklist

Complete this checklist before deploying to emade.social

---

## Phase 1: Pre-Deployment (Local Development)

### Code Quality
- [ ] Build succeeds: `npm run build` ✅
- [ ] No TypeScript errors
- [ ] No console warnings (F12)
- [ ] All images load correctly
- [ ] Links work (internal and external)

### Feature Testing (Local)
- [ ] Admin panel accessible at `/admin`
- [ ] Can create/edit/delete stories
- [ ] Images upload to local filesystem
- [ ] Chat messages post and display
- [ ] Reactions work (👍 ❤️ ✅)
- [ ] Mobile layout responsive
- [ ] Forms validate input
- [ ] Error messages display clearly

### Content Preparation
- [ ] At least 3 sample stories created
- [ ] At least 2 DIY guides created
- [ ] Team members added (name, role, bio, photo)
- [ ] Site configuration filled in (name, tagline, contact info)
- [ ] Navigation menu items configured
- [ ] Hero message customized

### Documentation
- [ ] [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md) reviewed
- [ ] [ADMIN_PANEL_GUIDE.md](ADMIN_PANEL_GUIDE.md) bookmarked
- [ ] [ENV_VARIABLES.md](ENV_VARIABLES.md) reviewed
- [ ] Have Neon connection string ready
- [ ] Know your domain name (emade.social)

---

## Phase 2: External Services Setup

### Neon Database
- [ ] Account created at [neon.tech](https://neon.tech)
- [ ] Project created (name: e-made)
- [ ] Connection string copied
- [ ] Connection string format verified
  - Should look like: `postgresql://user:pass@host/db?sslmode=require`

### Vercel Project
- [ ] Project created or existing project selected
- [ ] GitHub repository connected
- [ ] Project settings reviewed

### Custom Domain
- [ ] Domain `emade.social` purchased ✅
- [ ] Domain registrar access available
- [ ] Admin login to registrar available
- [ ] DNS currently points to current host (if migrating) or ready to point to Vercel

---

## Phase 3: Environment Variables (Vercel)

In Vercel Dashboard → Settings → Environment Variables:

### Required Variables
- [ ] **DATABASE_URL**
  - Value: Your Neon connection string
  - Environments: Production + Preview + Development
  - Status: ✅ Saved

- [ ] **BLOB_READ_WRITE_TOKEN**
  - Setup: Vercel → Storage → Create Blob
  - Status: Auto-added ✅

- [ ] **GEMINI_API_KEY** (Optional, for AI features)
  - Value: Your Google AI Studio key
  - Environments: Production + Preview + Development
  - Status: ✅ (Optional)

### Verification
- [ ] All 3+ environment variables visible
- [ ] All have checkmark (✅ Saved)
- [ ] Production environment includes all variables
- [ ] No typos in variable names

---

## Phase 4: Database Migration

### Prerequisites
- [ ] DATABASE_URL configured in Vercel ✅
- [ ] Local environment has access to Neon
- [ ] Data files exist locally (`data/*.json`)

### Migration Steps
- [ ] Run migration script: `npx tsx database/migrate.ts`
- [ ] See success message with ✅ checkmarks
- [ ] Check Neon dashboard shows new tables
- [ ] Verify data migrated (row counts match)

### Verification
- [ ] Stories table has data
- [ ] DIY projects table has data
- [ ] Site config synced
- [ ] No errors in migration log

---

## Phase 5: Domain Configuration

### DNS Setup
- [ ] Log in to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Find DNS/nameserver settings
- [ ] Add/update nameservers to Vercel's nameservers:
  - [ ] `ns1.vercel-dns.com`
  - [ ] `ns2.vercel-dns.com`
  - OR: Add CNAME and A records if not using nameservers

### Vercel Domain Setup
- [ ] Go to Vercel Dashboard → Settings → Domains
- [ ] Add domain: `emade.social`
- [ ] Add subdomain: `www.emade.social` (optional)
- [ ] SSL certificate auto-provisioning (wait 5-30 sec)
- [ ] Domain shows green checkmark (✅ Active)

### DNS Propagation
- [ ] Wait 5-30 minutes for DNS to propagate
- [ ] Test: `ping emade.social` should resolve
- [ ] Test: `https://emade.social` loads site
- [ ] Browser shows lock icon (🔒 HTTPS working)

---

## Phase 6: Initial Deployment

### Git Commit
- [ ] All changes staged: `git add .`
- [ ] Meaningful commit message: `"Production deployment: Database and Blob setup"`
- [ ] Commit created: `git commit`

### Push to GitHub
- [ ] `git push origin main`
- [ ] Wait for GitHub Actions (if configured)

### Vercel Deployment
- [ ] Go to Vercel Dashboard
- [ ] New deployment appears (usually within 30 sec)
- [ ] Build log shows "✓ Built successfully"
- [ ] Build output: 33/33 routes compiled
- [ ] No errors in build (red text)
- [ ] Deployment shows green checkmark (✅ Ready)

---

## Phase 7: Production Testing

### DNS & Routing
- [ ] `https://emade.social` resolves
- [ ] HTTPS certificate is valid (no warnings)
- [ ] `www.emade.social` redirects to `emade.social` (or both work)
- [ ] Site loads within 2 seconds

### Core Functionality
- [ ] Homepage loads with all sections
- [ ] Slideshow animates (3 rotating images)
- [ ] Navigation menu works
- [ ] All pages accessible

### Admin Panel
- [ ] `/admin` accessible and loads
- [ ] **NO** "Production filesystem is read-only" warning
- [ ] Can create test story
- [ ] Test story appears on `/stories`
- [ ] Can delete test story
- [ ] Changes persist after page refresh

### Content Pages
- [ ] `/stories` shows published stories
- [ ] `/diy` shows DIY projects
- [ ] `/team` shows team members with photos
- [ ] `/gallery` displays gallery with tiles
- [ ] `/contact` page loads
- [ ] Footer has correct contact info

### Chat/Forum
- [ ] Click on a story → `/stories/[slug]` loads
- [ ] Chat section visible
- [ ] Can post message (appears immediately)
- [ ] Refresh page → message still there ✅
- [ ] Can add reaction (👍 ❤️ ✅)
- [ ] Reaction count increments
- [ ] Refresh → reaction count persists

### File Uploads
- [ ] Go to admin panel
- [ ] Try to upload an image
- [ ] Upload succeeds (shows in gallery or page)
- [ ] Image loads on page
- [ ] Re-check image after refresh (still there)

### Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle responsive design (Ctrl+Shift+M)
- [ ] Test on iPhone X / Galaxy S10 sizes
- [ ] All text readable
- [ ] Footer in grid layout (not cramped) ✅
- [ ] Buttons clickable (hit targets 44x44px+)
- [ ] Forms work on mobile

### Performance
- [ ] Lighthouse score ≥ 90 on desktop (Vercel Analytics)
- [ ] Lighthouse score ≥ 80 on mobile
- [ ] Images load in <2 seconds
- [ ] No 404 errors (DevTools Network tab)
- [ ] No JavaScript errors (Console tab)

### Error Handling
- [ ] Click non-existent story url → "Story not found"
- [ ] Try invalid form input → error message
- [ ] Unplug internet → graceful degradation (no crash)
- [ ] Network errors shown to user (F12 Network tab)

---

## Phase 8: Security Review

### Environment Security
- [ ] DATABASE_URL not visible in public code
- [ ] BLOB_READ_WRITE_TOKEN not visible in public code
- [ ] .env files in .gitignore
- [ ] No secrets in git history

### API Security
- [ ] Production APIs return 403 for unauthorized writes
- [ ] Helpful error messages shown to users
- [ ] Chat moderation enabled
- [ ] Input validation on all forms
- [ ] SQL injection protection (via query params)

### HTTPS
- [ ] Site only loads over HTTPS
- [ ] Mixed content warnings in console? No ✅
- [ ] All images/resources use HTTPS

### Admin Panel
- [ ] Consider adding authentication layer
- [ ] Document admin panel access procedures
- [ ] Share credentials securely (not in code)

---

## Phase 9: Monitoring & Backups

### Neon Database
- [ ] Backup created (manual or automatic)
- [ ] Can access Neon dashboard
- [ ] Database connection status: ✅ Active
- [ ] Know how to export data if needed

### Vercel Monitoring
- [ ] Set up Vercel alerts (optional)
- [ ] Review deployment logs
- [ ] Monitor function duration (should be <1s)

### Analytics
- [ ] Understand how to view analytics
- [ ] Know where deployment logs are
- [ ] Can access Vercel dashboard anytime

---

## Phase 10: Documentation & Handoff

### Deployment Records
- [ ] Note current deployment URL
- [ ] Record current domain: `emade.social`
- [ ] Document Neon project ID
- [ ] Note Vercel project URL
- [ ] Keep DATABASE_URL safe (encrypted)

### Team Documentation
- [ ] Share [ADMIN_PANEL_GUIDE.md](ADMIN_PANEL_GUIDE.md) with team
- [ ] Share [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md) for reference
- [ ] Document process for adding team members
- [ ] Document process for posting stories

### Recovery Documentation
- [ ] How to rollback to previous deployment
- [ ] How to restore from database backup
- [ ] Who to contact if something breaks
- [ ] Emergency contact procedures

---

## Phase 11: Go-Live

### Final Verification
- [ ] All testing complete ✅
- [ ] No outstanding issues
- [ ] Stakeholders notified
- [ ] Team ready to support

### Announcement
- [ ] Update social media with new site URL
- [ ] Update email signature with new domain
- [ ] Update resume/portfolio with new domain
- [ ] Share with Slingshot Challenge judges

### Post-Launch Monitoring (First 24 Hours)
- [ ] Check Vercel dashboard hourly
- [ ] Monitor for error spikes
- [ ] Check admin panel works
- [ ] Review chat moderation logs
- [ ] Watch for user feedback

---

## Phase 12: Ongoing Maintenance

### Daily
- [ ] Review new chat messages
- [ ] Moderate flagged content
- [ ] Respond to comments

### Weekly
- [ ] Add new content (stories, DIY guides)
- [ ] Review analytics/engagement
- [ ] Check for any errors
- [ ] Backup databases (if manual)

### Monthly
- [ ] Security review
- [ ] Performance audit
- [ ] Database optimization
- [ ] Team communications

### Quarterly
- [ ] Major feature planning
- [ ] Infrastructure review
- [ ] Budget/costs review
- [ ] Strategic alignment

---

## 🎉 Success Criteria

Your production deployment is successful when:

✅ `emade.social` resolves and loads  
✅ All pages are accessible  
✅ Admin panel works without "read-only" errors  
✅ Chat messages persist across refreshes  
✅ Images upload and display  
✅ Mobile layout is responsive  
✅ Lighthouse scores ≥ 80  
✅ No console errors  
✅ Team can manage content  
✅ Domain has valid SSL certificate  

---

## 📊 Quick Reference

| Item | Value | Status |
|------|-------|--------|
| Domain | emade.social | |
| Project Type | Next.js 14 + TypeScript | ✅ |
| Database | Neon Postgres | ⏳ |
| File Storage | Vercel Blob | ⏳ |
| Hosting | Vercel | ⏳ |
| Build Command | `npm run build` | ✅ |
| Start Command | `npm run dev` | ✅ |
| Analytics | Vercel | ⏳ |
| Monitoring | Vercel + Neon | ⏳ |

---

## 🚨 Emergency Contacts

- **Deployment Failed**: Check Vercel build logs
- **Database Down**: Check Neon status page
- **Domain Issues**: Check DNS propagation
- **Blob Storage Issues**: Check Vercel Blob status
- **Site Unresponsive**: Rollback to previous deployment

---

**Deployment Target**: 🎯 emade.social  
**Go-Live Date**: [Insert date]  
**Estimated Time**: 30-45 minutes  
**Prepared By**: Developer  
**Approved By**: Project Lead  

---

Print this checklist and mark off each item as you complete it. Keep it for future reference!
