#!/usr/bin/env powershell
# Verify and seed database

Write-Host "🔍 Checking database for plans..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
cd backend

# Check current migrations
Write-Host "📋 Checking migration status..." -ForegroundColor Yellow
php artisan migrate:status 2>&1 | Select-String "plans" -Context 2

Write-Host ""
Write-Host "🌱 Running database seeder..." -ForegroundColor Yellow
php artisan db:seed --force

Write-Host ""
Write-Host "✅ Seeding complete!" -ForegroundColor Green

# Test API endpoint
Write-Host ""
Write-Host "🧪 Testing /api/plans endpoint..." -ForegroundColor Cyan

$response = curl -s -X GET http://localhost:8000/api/plans `
  -H "Accept: application/json"

Write-Host ""
Write-Host "Response:" -ForegroundColor Yellow
Write-Host $response | ConvertFrom-Json | ConvertTo-Json -Depth 3

Write-Host ""
Write-Host "✅ Plan verification complete!" -ForegroundColor Green
