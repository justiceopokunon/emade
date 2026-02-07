@echo off
REM E-MADE Final Deployment Script
REM This script completes the deployment to emade.social on Vercel

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     E-MADE FINAL DEPLOYMENT TO PRODUCTION                 ║
echo ║     Deploying to: https://emade.social                    ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Navigate to project
cd /d C:\Users\kingo\OneDrive\Desktop\action\web

echo Checking prerequisites...
echo ✓ Node.js version:
node --version

echo ✓ npm version:
npm --version

echo ✓ Vercel CLI version:
vercel --version

echo.
echo ────────────────────────────────────────────────────────────
echo Deploying to Production...
echo ────────────────────────────────────────────────────────────
echo.

REM Deploy to production
vercel --prod --yes

echo.
echo ✅ Deployment initiated!
echo.
echo Your site will be live soon at:
echo   • Production: https://web-[deploy-id].vercel.app
echo   • Custom Domain: https://emade.social (after DNS update)
echo.
echo Admin Panel: /admin
echo Password: slingshot-admin
echo.
echo For more info, see: AUTOMATED_DEPLOYMENT_COMPLETE.md
echo.
pause
