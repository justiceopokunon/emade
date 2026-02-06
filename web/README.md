## E-MADE

E-MADE is a purpose-driven initiative transforming how electronic waste is managed: responsible recycling, repair, and community empowerment. The site includes hero storytelling, a DIY lab of printable guides, a community forum, a gallery, team hub, and an admin stewardship console. Built with Next.js 14 (App Router), TypeScript, Tailwind v4, Framer Motion, and Radix UI.

### Structure
- Home (hero, stats, live pilots, DIY highlights, forum signals, admin CTA)
- /stories – forum signals and long-form writeups
- /diy – field-tested blueprints with steps, timing, and impact
- /team – stewardship profiles with socials
- /contact – partnerships/press/community links
- /admin – password-gated controls to edit all pages (client-side demo; wire to your backend to persist)

### Run locally
```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000.

### Admin password
Set an env var to control access:
```
NEXT_PUBLIC_ADMIN_PASS=slingshot-admin
```
If unset, the default above is used. This gate is client-side for demo—connect it to your auth/CMS for production security.

### Personalization + environment
Create a `.env.local` using the template in `.env.example` to customize the live metadata and branding:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_SITE_DESCRIPTION=Short tagline for search and sharing previews.
```

### Build
```bash
npm run build
```

### Production run
```bash
npm run start
```

### Deployment notes
- `output: "standalone"` is enabled in `next.config.ts` for container-ready builds.
- Use a real `NEXT_PUBLIC_SITE_URL` so Open Graph previews resolve correctly.
- Ensure `/data` is persisted if you rely on the JSON-backed admin edits.

### Tech
- Next.js 14 App Router + TypeScript
- Tailwind CSS v4
- Framer Motion for motion design
- Radix UI Dialog for accessible modals

### Notes
- All data lives in src/lib/data.ts for quick edits.
- Backend storage is enabled for site-wide edits (hero/stats/team/contact) and for /stories and /diy via JSON files in /data and API routes (/api/site, /api/stories, /api/diy).

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/emade.git
   ```
2. Navigate to the project directory:
   ```bash
   cd emade/web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the `web` directory and add the following environment variables:
   ```env
  NEXT_PUBLIC_SITE_NAME=E-MADE
  NEXT_PUBLIC_SITE_DESCRIPTION=E-MADE transforms electronic waste into opportunity through responsible recycling, repair, and community empowerment.
   NEXT_PUBLIC_SITE_URL=https://emade.social
   NEXT_PUBLIC_API_URL=https://api.emade.social
   NEXT_PUBLIC_AUTH_SECRET=your-auth-secret
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### API Usage
The project includes several API routes for various functionalities:

#### `/api/admin/login`
- **Method**: `POST`
- **Description**: Handles admin login.
- **Request Headers**:
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "your-password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful."
  }
  ```

#### `/api/admin/logout`
- **Method**: `POST`
- **Description**: Logs out the admin by clearing the authentication cookie.
- **Response**:
  ```json
  {
    "ok": true
  }
  ```

#### `/api/upload/image`
- **Method**: `POST`
- **Description**: Uploads an image file.
- **Request Headers**:
  - `Content-Type`: `multipart/form-data`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully."
  }
  ```

#### `/api/upload/pdf`
- **Method**: `POST`
- **Description**: Uploads a PDF file.
- **Request Headers**:
  - `Content-Type`: `multipart/form-data`
- **Response**:
  ```json
  {
    "success": true,
    "message": "PDF uploaded successfully."
  }
  ```

For more details, refer to the API route files in the `src/app/api` directory.
