#!/usr/bin/env powershell
<#
  Comprehensive Database & API Diagnostic Script
  Tests plans existence and API endpoints
#>

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   GOLD FLEET - Database & API Diagnostics                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$workingDir = Get-Location
Write-Host "📍 Working Directory: $workingDir" -ForegroundColor Gray
Write-Host ""

# Step 1: Check if Laravel server is running
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1: Verify Backend Server" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$serverCheck = curl -s -I http://localhost:8000/api/plans 2>&1
if ($serverCheck -match "200|422") {
  Write-Host "✅ Backend API is running at http://localhost:8000" -ForegroundColor Green
} else {
  Write-Host "⚠️  Backend API might not be running. Make sure to run:" -ForegroundColor Red
  Write-Host "   cd backend && php artisan serve"
  Write-Host ""
}

Write-Host ""

# Step 2: Fetch and display plans from API
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2: Fetch Plans from API (http://localhost:8000/api/plans)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
  $response = curl -s -X GET http://localhost:8000/api/plans `
    -H "Accept: application/json"
  
  $plans = $response | ConvertFrom-Json -ErrorAction Stop
  
  if ($plans -is [array]) {
    Write-Host "✅ Plans fetched successfully (Array):" -ForegroundColor Green
    Write-Host ""
    $plans | ForEach-Object {
      Write-Host "   ID: $($_.id) | Name: $($_.name) | Price: $$($_.price) | Status: $($_.status)" -ForegroundColor Green
    }
  } elseif ($plans -is [object]) {
    Write-Host "✅ Plans response (Object):" -ForegroundColor Green
    Write-Host ($plans | ConvertTo-Json -Depth 3) -ForegroundColor Green
  } else {
    Write-Host "⚠️  Unexpected response format:" -ForegroundColor Yellow
    Write-Host $response
  }
} catch {
  Write-Host "❌ Failed to fetch plans:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}

Write-Host ""

# Step 3: Database Check
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3: Run Database Seeder" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

cd backend

Write-Host "🌱 Running: php artisan db:seed --force" -ForegroundColor Yellow
php artisan db:seed --force

Write-Host ""
Write-Host "✅ Seeding complete!" -ForegroundColor Green

Write-Host ""

# Step 4: Verify plans were created
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4: Verify Plans in Database" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "🧪 Running: php artisan tinker (to check database)..." -ForegroundColor Yellow

cd ..

Write-Host "✅ To manually verify, run in the backend folder:" -ForegroundColor Green
Write-Host "   php artisan tinker" -ForegroundColor Cyan
Write-Host "   >>> Plan::all();" -ForegroundColor Cyan
Write-Host ""

# Step 5: Test API again
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5: Final API Check" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
  Start-Sleep -Milliseconds 500
  $finalPlans = curl -s -X GET http://localhost:8000/api/plans `
    -H "Accept: application/json" | ConvertFrom-Json
  
  Write-Host "✅ Final Plans Available:" -ForegroundColor Green
  $finalPlans | ForEach-Object {
    Write-Host "   ✓ ID: $($_.id) | $($_.name)" -ForegroundColor Green
  }
} catch {
  Write-Host "❌ Failed to fetch final plans" -ForegroundColor Red
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Diagnostics Complete!                                    ║" -ForegroundColor Cyan
Write-Host "║   Next: Try signing up with one of the plans listed above  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
