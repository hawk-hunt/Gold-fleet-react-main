# Comprehensive Diagnostic Script for Plan ID Invalid Error
# This script checks all aspects of the plan system

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   GOLD FLEET - PLAN VALIDATION DIAGNOSTIC TOOL             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Color helper function
function Write-Status ($status, $message) {
    switch ($status) {
        "success" { Write-Host "✅ $message" -ForegroundColor Green }
        "error" { Write-Host "❌ $message" -ForegroundColor Red }
        "warning" { Write-Host "⚠️  $message" -ForegroundColor Yellow }
        "info" { Write-Host "ℹ️  $message" -ForegroundColor Cyan }
        "step" { Write-Host "🔧 $message" -ForegroundColor Magenta }
    }
}

# Section 1: Check Backend Server
Write-Host ""
Write-Host "SECTION 1: Backend Server" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $response = curl -s -m 3 http://localhost:8000/api/plans
    if ($response) {
        Write-Status "success" "Backend API is running on port 8000"
    }
} catch {
    Write-Status "error" "Backend API is NOT running on port 8000"
    Write-Host "  → Run: cd backend && php artisan serve" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Section 2: Test Plans Endpoint
Write-Host ""
Write-Host "SECTION 2: Plans API Endpoint" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $response = curl -s -X GET http://localhost:8000/api/plans -H "Accept: application/json" | ConvertFrom-Json
    
    if ($response) {
        if ($response -is [array]) {
            Write-Status "success" "API returned plan data (Array format)"
            Write-Host "  Plans count: $($response.Count)"
            Write-Host "  Plans: " -NoNewline
            $response | ForEach-Object { Write-Host "$($_.id):$($_.name) " -NoNewline }
            Write-Host ""
        } else {
            Write-Status "warning" "API response is not an array, it's an object"
            Write-Host "  Response type: $($response.GetType().Name)"
        }
    } else {
        Write-Status "error" "API returned empty response"
    }
} catch {
    Write-Status "error" "Failed to fetch plans from API: $_"
}

# Section 3: Database Connection
Write-Host ""
Write-Host "SECTION 3: Database Connection" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Push-Location backend
try {
    # Check if we can run Tinker
    $tinkerTest = php artisan tinker --execute "echo 'DB OK';" 2>&1
    if ($tinkerTest -like "*DB OK*") {
        Write-Status "success" "Database connection is working"
    } else {
        Write-Status "error" "Database connection failed"
        Write-Host "  Error: $tinkerTest" -ForegroundColor Gray
        Pop-Location
        exit
    }
} catch {
    Write-Status "error" "Could not test database: $_"
    Pop-Location
    exit
}

# Section 4: Check Plans in Database
Write-Host ""
Write-Host "SECTION 4: Plans in Database" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $plansOutput = php artisan tinker --execute "echo json_encode(DB::table('plans')->orderBy('id')->get());" 2>&1
    
    # Clean up tinker output
    $plansOutput = $plansOutput -replace '.*?(\[.*\])', '$1' -split '\n' | Where-Object { $_ -like '*[*' } | Select-Object -First 1
    
    if ($plansOutput) {
        $plans = $plansOutput | ConvertFrom-Json
        Write-Status "success" "Found $($plans.Count) plans in database"
        
        Write-Host ""
        Write-Host "Plan Details:" -ForegroundColor Cyan
        $plans | ForEach-Object {
            Write-Host "  ID: $($_.id) | Name: $($_.name) | Price: $($_.price) | Status: $($_.status)" -ForegroundColor White
        }
    } else {
        Write-Status "error" "No plans found in database"
        Write-Host "  → You need to run: php artisan db:seed" -ForegroundColor Gray
    }
} catch {
    Write-Status "error" "Could not read plans from database: $_"
}

# Section 5: Check Migrations
Write-Host ""
Write-Host "SECTION 5: Database Migrations" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $migrateOutput = php artisan migrate:status 2>&1
    
    # Check for key tables
    $hasPlansMigration = $migrateOutput -like "*create_plans_table*"
    $hasSubscriptionsMigration = $migrateOutput -like "*create_subscriptions_table*"
    
    if ($hasPlansMigration) {
        Write-Status "success" "Plans migration exists"
    } else {
        Write-Status "warning" "Plans migration not found"
    }
    
    if ($hasSubscriptionsMigration) {
        Write-Status "success" "Subscriptions migration exists"
    } else {
        Write-Status "warning" "Subscriptions migration not found"
    }
} catch {
    Write-Status "error" "Could not check migrations: $_"
}

# Section 6: Test Seeding
Write-Host ""
Write-Host "SECTION 6: Database Seeding" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Status "step" "Running database seeder..."
try {
    $seedOutput = php artisan db:seed --force 2>&1
    if ($seedOutput -like "*Seeded*" -or $seedOutput -like "*successfully*") {
        Write-Status "success" "Seeder ran successfully"
    } else {
        Write-Status "info" "Seeder output: $seedOutput"
    }
} catch {
    Write-Status "error" "Seeder failed: $_"
}

# Section 7: Verify Plans After Seeding
Write-Host ""
Write-Host "SECTION 7: Verify Plans After Seeding" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $plansCount = php artisan tinker --execute "echo json_encode(DB::table('plans')->count());" 2>&1
    $plansCount = [int]($plansCount -replace '[^0-9]', '')
    
    if ($plansCount -eq 3) {
        Write-Status "success" "Database has exactly 3 plans (expected)"
    } else {
        Write-Status "warning" "Database has $plansCount plans (expected 3)"
    }
} catch {
    Write-Status "error" "Could not verify plan count: $_"
}

Pop-Location

# Section 8: Final API Check
Write-Host ""
Write-Host "SECTION 8: Final API Verification" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $finalResponse = curl -s -X GET http://localhost:8000/api/plans -H "Accept: application/json" | ConvertFrom-Json
    
    if ($finalResponse -is [array] -and $finalResponse.Count -eq 3) {
        Write-Status "success" "API returns 3 plans correctly"
        Write-Host ""
        Write-Host "✅ Your plan system is ready for signup testing!" -ForegroundColor Green
    } else {
        Write-Status "warning" "API response count mismatch"
    }
} catch {
    Write-Status "error" "Final verification failed: $_"
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   NEXT STEPS                                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ensure backend is running: cd backend && php artisan serve" -ForegroundColor Gray
Write-Host "2. Test signup: Go to http://localhost:5173 → Sign Up" -ForegroundColor Gray
Write-Host "3. Select a plan (should see Starter, Professional, Enterprise)" -ForegroundColor Gray
Write-Host "4. Fill in user details and submit" -ForegroundColor Gray
Write-Host "5. Should proceed to Step 3 (Payment Simulation)" -ForegroundColor Gray
Write-Host ""
Write-Host "If you still see 'plan id is invalid' error:" -ForegroundColor Gray
Write-Host "  → Check browser console (F12) for debug information" -ForegroundColor Gray
Write-Host "  → Error will show which plans exist in database" -ForegroundColor Gray
Write-Host ""
