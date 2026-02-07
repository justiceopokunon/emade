# Environment & Deployment Checklist

This project ships with a Next.js 14 application (`web/`) and relies on Neon Postgres for persistence, Vercel Blob for binary storage, and Gemini for AI-powered authoring. The steps below prepare local development, Neon, and Vercel so the site can be deployed and the admin console remains fully functional.

---

## 1. Local `.env` bootstrap

1. Duplicate `.env.example` to `.env.local` inside `web/`:
   ```powershell
   cd web
   Copy-Item ..\.env.example .env.local
   ```
2. Add real secrets to `.env.local` (see variable reference in section 4).
3. For TypeScript friendliness, restart the dev server after editing env files.

> `.env.local` is ignored by git and feeds both `next dev` and local scripts.

---

## 2. Neon Postgres alignment

The Neon database already exists (`neondb`). Set the connection URL as `DATABASE_URL` (or `POSTGRES_URL`).

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@ep-...neon.tech/neondb?sslmode=require&channel_binding=require"
```

To verify the schema directly from the workspace without `psql`, run the bundled TypeScript migration/inspection utility (requires `tsx` once globally or via `npx`):

```powershell
cd web
npx tsx database/migrate.ts
```

- The script will create tables (`site_data`, `stories`, `diy_projects`, `chat_messages`, etc.) if they are missing and sync JSON snapshots into Postgres.
- Rerun the migration whenever JSON seed files change.

> **Tip:** Add `$env:DATABASE_URL` to your PowerShell profile or `.env.local` so future scripts pick it up automatically.

---

## 3. Vercel project wiring

### 3.1 Link the project

```powershell
npm install -g vercel
cd web
vercel login
vercel link
```

### 3.2 Push environment variables

Use the helper script to sync secrets from `.env.vercel` (create this file with the values listed in section 4). Each call echoes the value into Vercel so it never lands in your shell history.

```powershell
# Example for PowerShell on Windows
Set-Content -Path .env.vercel -Value @"
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=...
GEMINI_API_KEY=...
NEXT_PUBLIC_ADMIN_PASS=slingshot-admin
NEXT_PUBLIC_SITE_NAME=E-MADE
NEXT_PUBLIC_SITE_DESCRIPTION=Interactive e-waste learning lab
NEXT_PUBLIC_SITE_URL=https://emade.social
ADMIN_PASS=slingshot-admin
"@ -NoNewline

Get-Content .env.vercel | ForEach-Object {
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $name = $parts[0]
    $value = $parts[1]
    if ($value) {
      $value | vercel env add $name production
      $value | vercel env add $name preview
      $value | vercel env add $name development
    }
  }
}
```

- Vercel CLI prompts for confirmation; repeat for each variable.
- Remove `.env.vercel` after syncing (`Remove-Item .env.vercel`).

You can later confirm values with:

```powershell
vercel env ls
vercel env pull .env.vercel.local
```

### 3.3 Deployment

Once env variables are in place:

```powershell
cd web
npm install
npm run build
vercel --prod
```

`vercel --prod` builds the app, uploads artifacts, and attaches the secrets. Use `vercel` (without `--prod`) for preview deployments.

---

## 4. Environment variable reference

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | Server | Primary Neon connection string used by the API routes. |
| `POSTGRES_URL` | ⚙️ optional | Server | Alias consumed by some hosted environments; keep in sync with `DATABASE_URL`. |
| `BLOB_READ_WRITE_TOKEN` | ✅ for uploads | Server | Grants write access to Vercel Blob storage for images/PDFs. |
| `GEMINI_API_KEY` | ✅ for AI | Server | Enables Gemini content generation routes. |
| `ADMIN_PASS` | ✅ | Server | Server-only admin password for `/admin/login`. Overrides the public fallback. |
| `NEXT_PUBLIC_ADMIN_PASS` | ⚙️ fallback | Client | Only used if `ADMIN_PASS` is missing; set to the same value for consistency. |
| `NEXT_PUBLIC_SITE_NAME` | ✅ | Client | Site branding in layout metadata. |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | ✅ | Client | Description used in metadata/social embeds. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Client | Canonical production URL (used in metadata + preview iframe origin checks). |

> **Security:** Never commit real secrets. `.env.example` in the repo documents variable names with placeholder values only.

---

## 5. Sanity checks before each deployment

1. `npm run lint` – ensures the bundle passes ESLint.
2. `npm run build` – catches missing environment variables or runtime errors locally.
3. `npx tsx database/migrate.ts` – keeps Neon tables up to date.
4. `vercel env pull .env.vercel.local` – confirms Vercel stored variables correctly.
5. `vercel --prod` – triggers the final deployment.

After deployment, visit `/admin` in production. The config banner will indicate whether Blob storage, Gemini, and Postgres are detected. All checks should show green when the environment is configured correctly.
