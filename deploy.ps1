Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   BioMindQ Production Deployment Script  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Build and start with Docker Compose
Write-Host "[1/2] Building and launching containers..." -ForegroundColor Green
docker compose down
docker compose build
docker compose up -d

Write-Host "[2/2] Checking system health..." -ForegroundColor Green
Start-Sleep -Seconds 3
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " BioMindQ is live:" -ForegroundColor Green
Write-Host " Frontend: http://localhost" -ForegroundColor White
Write-Host " Backend API: http://localhost:8000/docs" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
