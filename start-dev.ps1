# Sealify Development Startup Script
# Runs both Vite dev server and Wrangler Pages dev server concurrently

Write-Host "`n[sealify-dev] Starting development servers...`n" -ForegroundColor Cyan

# Check if dist folder exists, if not build first
if (-not (Test-Path -Path "dist" -PathType Container)) {
    Write-Host "[sealify-dev] dist folder not found, building first..." -ForegroundColor Yellow
    npm run build
}

# Start Wrangler Pages dev server in background
Write-Host "[sealify-dev] Starting Wrangler Pages dev server on port 8788..." -ForegroundColor Magenta
$wrangler = Start-Process -FilePath "npx" -ArgumentList "wrangler", "pages", "dev", "./dist", "--port", "8788", "--compatibility-date", "2026-08-31", "--compatibility-flag", "nodejs_compat" -PassThru -WindowStyle Hidden

# Give Wrangler a moment to start
Start-Sleep -Seconds 3

# Start Vite dev server
Write-Host "[sealify-dev] Starting Vite dev server on port 5173..." -ForegroundColor Green
$vite = Start-Process -FilePath "npx" -ArgumentList "vite", "--port", "5173" -PassThru -WindowStyle Hidden

Write-Host "`n[sealify-dev] Both servers started!" -ForegroundColor Cyan
Write-Host "[sealify-dev] Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "[sealify-dev] API (Pages Functions): http://localhost:8788" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop both servers...`n" -ForegroundColor Gray

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`n[sealify-dev] Shutting down..." -ForegroundColor Cyan
    if ($wrangler) { Stop-Process -Id $wrangler.Id -Force -ErrorAction SilentlyContinue }
    if ($vite) { Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "[sealify-dev] Stopped.`n" -ForegroundColor Cyan
}