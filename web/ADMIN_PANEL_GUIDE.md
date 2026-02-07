# 🎛️ Admin Panel Complete Reference Guide

This guide explains how to manage every aspect of the E-MADE site from the admin panel.

## 🔐 Accessing the Admin Panel

```
URL: https://emade.social/admin
or: https://your-site.vercel.app/admin
```

Currently an open admin panel - consider adding authentication before production! (See Security section)

---

## 📋 Admin Panel Sections

### 1. **Control Overview** (Dashboard)
- Overview of all site content
- Quick statistics
- Links to each management area
- Status indicators

**What you can do:**
- See total stories, DIY projects, chat messages
- View engagement metrics
- Monitor site health

---

### 2. **Hero Promise** (Homepage Banner)
The main headline and message at the top of your site

**Fields:**
- `Hero Message` - Main headline (text area)
  - Example: "E-MADE transforms electronic waste..."
  - Shows on homepage and pages
  - Keep under 200 characters for mobile
  - HTML supported (use responsibly)

**How to edit:**
1. Scroll to "Hero Promise" section
2. Edit the text
3. Click **Save Site Config**
4. Refreshes immediately on site

---

### 3. **Impact Stats**
Display key numbers showing your organization's impact

**What statistics you can manage:**
- `Number` - The stat value (e.g., "2,500")
- `Label` - What it means (e.g., "Devices Recycled")
- `Category` - Type of impact (e.g., "Environmental")

**How to add a stat:**
1. Scroll to "Impact Stats" section
2. Click **Add Stat**
3. Fill in: Number, Label, Category
4. Click **Save Stat**
5. Stats update on homepage instantly

**Example stats:**
- "2,500 kg
 Electronics Recycled"
- "1,200 Community Members"
- "50 Refurbished Devices"

---

### 4. **Team Members**
Showcase your team

**Fields per team member:**
- `Name` - Team member's full name
- `Role` - Position (e.g., "Founder", "Data Analyst")
- `Bio` - Short description (50-100 words)
- `Image` - Profile picture (upload or URL)
- `Socials` - Links to their profiles
  - Twitter, LinkedIn, GitHub, Website
  - Optional - leave blank if not needed

**How to add team member:**
1. Scroll to "Team" section
2. Click **Add Team Member**
3. Fill in all fields
4. Upload image
5. Click **Save Team Member**
6. Appears on `/team` page instantly

**Display on site:**
- Shows on `/team` page with beautiful cards
- Order is configurable (drag to reorder)

---

### 5. **Gallery Tools**
Customize the gallery page layout

**Types of gallery tiles:**
- `Square` (1x1) - Standard size
- `Landscape` (2x1) - Wide tile
- `Portrait` (1x2) - Tall tile
- `Spotlight` (2x2) - Hero/featured tile

**Sections available:**
- `Hero Section` - Top banner with intro text
- `Devices` - E-waste device category
- `Refurbishing` - Repair/refurbish showcase
- `Recycling` - Recycling process section
- `Community` - Community engagement section
- `Impact` - Results and impact section

**How to customize:**
1. Scroll to "Gallery Tools" section
2. Edit hero title/subtitle
3. Add/edit section titles and descriptions
4. Customize tile layout:
   - Click **Add Gallery Tile**
   - Set title, description, image, size
   - Choose tile size with visual preview
   - Click **Save**
5. Drag tiles to reorder

---

### 6. **Slideshow Images**
Control rotating images on homepage and story pages

**Where they appear:**
- Homepage hero section (3 rotating images)
- Story pages (3 rotating images)
- Animations: 12-second cycle with fade effects

**How to manage:**
1. Scroll to "Slideshows" section
2. **Ewaste Images** (homepage):
   - Add/remove/reorder device/disposal images
   - Currently shows first 3 for rotation
3. **Story Images** (story pages):
   - Add/remove/reorder story hero images
   - Currently shows first 3 for rotation

**Tips:**
- Use high-quality images (minimum 800x600px)
- Keep file size under 2MB for fast loading
- Images auto-resize for different screens

---

### 7. **Stories** (Community Experiences)
Manage e-waste stories community members share

**Story fields:**
- `Title` - Headline (required)
- `Excerpt` - Short summary (50-100 words)
- `Body` - Full story (supports multiple paragraphs)
- `Author` - Author name
- `Category` - Type (Device Recycling, Refurbishing, Community, Other)
- `Status` - Draft/Published
- `Image` - Featured image for story
- `Tags` - Keywords (comma-separated)

**How to create story:**
1. Scroll to "Stories" section
2. Click **Add Story**
3. Fill in all fields:
   - Write compelling title
   - Add excerpt that captures essence
   - Write detailed body
   - Tag appropriately
4. Choose status:
   - **Draft** - Not visible on site
   - **Published** - Visible on `/stories` page
5. Upload featured image
6. Click **Create Story**

**Where stories appear:**
- `/stories` page - list of all published stories
- `/stories/[slug]` - individual story page with comments
- Forum uses story slug for comments

**Current stories system:**
- Real-time updates when published
- Chat/reactions attached to each story
- Auto-comment moderation

---

### 8. **DIY Blueprints** (Repair/Recycling Guides)
How-to guides for repairing or recycling electronics

**DIY fields:**
- `Name` - Guide title
- `Description` - What it covers
- `Difficulty` - Beginner/Intermediate/Advanced
- `Time Required` - Estimated duration
- `Category` - Type of project
- `Image` - Guide cover image
- `Materials` - What you'll need (list)
- `Steps` - How-to instructions (ordered list)

**How to create DIY:**
1. Scroll to "DIY Blueprints" section
2. Click **Add DIY Project**
3. Fill in basics:
   - Clear title and description
   - Set difficulty level
   - Estimate time (e.g., "30 minutes")
4. List materials:
   - Click **Add Material**
   - Enter name
   - Repeat for all materials
5. Add steps:
   - Click **Add Step**
   - Enter instruction
   - Upload photo if helpful
   - Repeat for all steps
6. Upload cover image
7. Click **Create DIY Project**

**Where DIY appears:**
- `/diy` page - featured guides
- Searchable by difficulty
- Community can share tips in comments

---

### 9. **Forum Moderation**
Monitor and manage community chat/comments

**What you can do:**
- View all messages
- Flag inappropriate content
- See reactions and engagement
- Monitor moderation status:
  - ✅ **Approved** - Visible to all
  - ⏳ **Pending** - Awaiting review
  - 🚫 **Flagged** - Hidden, needs review

**How to moderate:**
1. Scroll to "Forum Moderation" section
2. Review messages by story
3. Check **Status**:
   - Flagged messages highlighted in yellow
   - AI moderation flags suspicious content
4. Actions:
   - ✅ Approve flagged messages
   - 🚫 Flag new messages if needed
   - 📊 View sentiment analysis

**Current moderation system:**
- AI automatically flags potentially problematic content
- You manually review and approve/reject
- All messages stored with timestamps

---

### 10. **Site Configuration** (Advanced)
Advanced settings for the entire site

**General settings:**
- `Site Name` - Official name
- `Site Tagline` - Motto/tagline
- `Theme Color` - Controls browser UI color
- `Navigation Items` - Menu links

**Contact channels:** Configure multiple ways people can reach you:
- Type: Email, Phone, Social, WhatsApp, etc.
- Value: Email address, phone number, handles
- Examples:
  - Email: `hello@emade.social`
  - Instagram: `@emadeofficial`
  - WhatsApp: `+1234567890`

**Submit CTA:**
- Button text for submitting stories
- Button link/action

**Navigation Menu:**
Configure what appears in site nav:
- Each item has label and link
- Reorder by dragging
- Hide/show items
- Add custom links

**How to edit:**
1. Scroll to "Site Configuration" section or "Navigation"
2. Edit values
3. Click **Save Site Config**
4. Changes live immediately

---

## 🎨 Common Workflows

### Workflow 1: Launch a New Campaign
1. Create DIY guide (step-by-step instructions) in "DIY Blueprints"
2. Create accompanying story in "Stories"
3. Add campaign image to "Slideshow Images"
4. Update hero message if needed
5. Share link on social media

**Time**: ~15 minutes

### Workflow 2: Add Team Member
1. Get team member info: name, role, bio, photo
2. Go to "Team" section
3. Click "Add Team Member"
4. Fill in details
5. Upload photo or paste image URL
6. Add social links if available
7. Save
8. They appear on `/team` page

**Time**: ~5 minutes

### Workflow 3: Manage Community Feedback
1. Go to "Forum Moderation"
2. Review new flagged messages
3. For each flagged message:
   - Read the content
   - Approve if OK (✅)
   - Flag if inappropriate (🚫)
4. Review sentiment/engagement metrics
5. Message admin if trends are concerning

**Time**: ~10 minutes per day

### Workflow 4: Publish Community Story
1. User submits story via contact form
2. You add to "Stories" as Draft first
3. Review for quality/safety
4. Change status to Published
5. Share on social media
6. It appears on `/stories` page with comments

**Time**: ~10 minutes per story

---

## 🔒 Admin Security

### Current Setup (Development)
- Open admin panel - no authentication required
- Fine for testing and development

### For Production (Recommended)
Add password protection:

1. **Option 1: Environment Variable**
```bash
# In Vercel Environment Variables
NEXT_PUBLIC_ADMIN_PASS=your-strong-password-here
```

2. **Option 2: Admin Login System**
   - Create login page at `/admin/login`
   - Verify credentials before showing admin panel
   - Use session cookies (HttpOnly, Secure)

3. **Option 3: OAuth (Advanced)**
   - Use GitHub/Google OAuth
   - Only specific emails can access
   - More secure for teams

### Security Best Practices
1. Use strong passwords (20+ characters, mix of types)
2. Never share admin URL publicly
3. Regularly change passwords
4. Monitor who has access
5. Log admin actions (when added)
6. Don't store sensitive data in admin panel

---

## 🐛 Troubleshooting Admin Issues

### Problem: Changes don't save
**Cause**: Database not configured
**Fix**: 
1. Check if you're on production (emade.social)
2. Verify DATABASE_URL is set in Vercel
3. Check browser console for errors (F12)

### Problem: Images won't upload
**Cause**: Blob storage not configured
**Fix**:
1. Vercel → Storage → Blob exists?
2. Check BLOB_READ_WRITE_TOKEN in environment variables
3. Try smaller image (< 2MB)

### Problem: Admin panel is slow
**Cause**: Polling large amounts of data
**Fix**:
1. Reduce number of displayed items
2. Archive old content
3. Clear browser cache

### Problem: Lost admin access
**Cause**: Forgot password or wrong URL
**Fix**:
1. If password-protected, contact site admin
2. For email-based access, check your email
3. Redeploy to reset

---

## 📊 Analytics Dashboard (Future)

When you visit `/admin`, you'll see:
- **Total Content**: Stories, DIY guides, team members
- **Engagement**: Chat messages, reactions, views
- **Top Performers**: Most commented stories
- **Sentiment Analysis**: Community feedback tone
- **Traffic**: Page views and user actions

Currently displays real-time data from database.

---

## ⚡ Tips for Best Results

1. **Write compelling headlines** - First line users see
2. **Use good images** - High quality, relevant to content
3. **Keep stories focused** - 200-500 words is ideal
4. **Regular updates** - Add new content weekly
5. **Respond to comments** - Engages community
6. **Tag appropriately** - Helps with discoverability
7. **Keep DIY guides detailed** - More steps = more helpful
8. **Use consistent naming** - Makes finding content easier

---

## 🚀 Production Checklist

Before going live with admin panel:

- ✅ DATABASE_URL configured in Vercel
- ✅ BLOB_READ_WRITE_TOKEN set
- ✅ Test creating story
- ✅ Test uploading image
- ✅ Test modifying site config
- ✅ Verify changes persist after refresh
- ✅ Test on mobile
- ✅ Consider adding authentication
- ✅ Create backup of initial content
- ✅ Document admin passwords securely

---

## 📞 Still Need Help?

1. Check [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md) for setup
2. View [ENV_VARIABLES.md](ENV_VARIABLES.md) for configuration
3. Review section-specific docs above
4. Check browser console for error messages (F12)
5. Contact development team for technical issues

---

**Last Updated**: February 2026
**Status**: Production Ready ✅
