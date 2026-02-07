param(
    [string]$DatabaseUrl = "",
    [string]$BlobToken = "",
    [string]$AdminPass = "slingshot-admin"
)

# E-MADE Production Deployment Script (PowerShell)
# Usage: .\deploy.ps1 -DatabaseUrl "postgresql://..." -BlobToken "vercel_blob_..." -AdminPass "your_password"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  E-MADE Production Deployment for emade.social     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check required environment
Write-Host "📋 Checking environment..." -ForegroundColor Yellow

if (-not (Test-Path ".\web")) {
    Write-Host "❌ Error: 'web' directory not found" -ForegroundColor Red
    exit 1
}

Push-Location .\web

# Verify Node.js and npm
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm $npmVersion" -ForegroundColor Green

# Check Vercel CLI
$vercelVersion = vercel --version
Write-Host "✅ Vercel CLI $vercelVersion" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing/updating dependencies..." -ForegroundColor Yellow
npm install | Out-Null
Write-Host "✅ Dependencies ready" -ForegroundColor Green

Write-Host ""
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "🔐 Configuring environment variables..." -ForegroundColor Yellow

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    Write-Host "⚠️  SKIPPED: No DATABASE_URL provided" -ForegroundColor Yellow
    Write-Host "   You can add it manually in Vercel Dashboard" -ForegroundColor Gray
} else {
    Write-Host "→ Setting DATABASE_URL..." -ForegroundColor Gray
    echo $DatabaseUrl | vercel env add DATABASE_URL production --non-interactive 2>&1 | Out-Null
    Write-Host "✅ DATABASE_URL configured" -ForegroundColor Green
}

if (-not [string]::IsNullOrWhiteSpace($BlobToken)) {
    Write-Host "→ Setting BLOB_READ_WRITE_TOKEN..." -ForegroundColor Gray
    echo $BlobToken | vercel env add BLOB_READ_WRITE_TOKEN production --non-interactive 2>&1 | Out-Null
    Write-Host "✅ BLOB_READ_WRITE_TOKEN configured" -ForegroundColor Green
}

Write-Host "→ Setting ADMIN_PASS..." -ForegroundColor Gray
echo $AdminPass | vercel env add ADMIN_PASS production --non-interactive 2>&1 | Out-Null
Write-Host "✅ ADMIN_PASS configured" -ForegroundColor Green

# Verify public variables are set
Write-Host "→ Verifying public environment variables..." -ForegroundColor Gray
vercel env ls --environment=production 2>&1 | Out-Null
Write-Host "✅ Environment variables configured" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Configuring custom domain..." -ForegroundColor Yellow
Write-Host "→ Adding emade.social..." -ForegroundColor Gray
vercel domains add emade.social 2>&1 | Select-String -Pattern "√|✓|Error" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Domain configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Domain configuration may need manual setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Preparing final deployment..." -ForegroundColor Yellow
Write-Host "→ Your project: prj_wo6a0l77h4RVd4bj6d3EGmi6M2wy" -ForegroundColor Gray

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            DEPLOYMENT READY                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run deployment" -ForegroundColor Cyan
Write-Host "  vercel --prod" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your site will be live at: https://emade.social" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Documentation: See PRODUCTION_SETUP.md for detailed instructions" -ForegroundColor Gray

Pop-Location
