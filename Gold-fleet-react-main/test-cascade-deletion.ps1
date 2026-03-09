# Test cascade deletion when removing a team member/driver
# This script tests the data cleanup when a user is deleted

Write-Host "=== Cascade Deletion Test ===" -ForegroundColor Green

$baseUrl = "http://localhost:8000/api"

# Test data - we'll use an existing driver
Write-Host "1. Getting list of drivers to test with..." -ForegroundColor Yellow

# First, authenticate as admin/platform user to get auth token
Write-Host "2. Authenticating as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body @{
        email = "admin@example.com"
        password = "password"
    } | ConvertFrom-Json

if ($loginResponse.success) {
    $token = $loginResponse.data.api_token
    Write-Host "✓ Authentication successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,10))..." -ForegroundColor Gray
} else {
    Write-Host "✗ Authentication failed" -ForegroundColor Red
    exit 1
}

# Get company details to find team members
Write-Host "3. Getting company team members..." -ForegroundColor Yellow
$teamResponse = Invoke-WebRequest -Uri "$baseUrl/company/team" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json

if ($teamResponse.success -and $teamResponse.data.Count -gt 0) {
    Write-Host "✓ Found $($teamResponse.data.Count) team members" -ForegroundColor Green
    
    # Find a driver to test with
    $driverUser = $teamResponse.data | Where-Object { $_.role -eq 'driver' } | Select-Object -First 1
    
    if ($driverUser) {
        Write-Host "   Driver to test: $($driverUser.name) (ID: $($driverUser.id))" -ForegroundColor Gray
        
        # Get driver's data before deletion
        Write-Host "4. Getting driver's associated data before deletion..." -ForegroundColor Yellow
        
        $driverId = $driverUser.id
        $driverDetails = Invoke-WebRequest -Uri "$baseUrl/drivers/$driverId" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
        
        Write-Host "   Driver record: $($driverDetails.data.id)" -ForegroundColor Gray
        
        # Get trips for this driver
        $tripsResponse = Invoke-WebRequest -Uri "$baseUrl/trips?driver_id=$driverId" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
        Write-Host "   Trips: $($tripsResponse.data.Count) records" -ForegroundColor Gray
        
        # Get inspections for this driver
        $inspectionsResponse = Invoke-WebRequest -Uri "$baseUrl/inspections?driver_id=$driverId" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
        Write-Host "   Inspections: $($inspectionsResponse.data.Count) records" -ForegroundColor Gray
        
        # Get issues for this driver
        $issuesResponse = Invoke-WebRequest -Uri "$baseUrl/issues?driver_id=$driverId" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
        Write-Host "   Issues: $($issuesResponse.data.Count) records" -ForegroundColor Gray
        
        # Now remove the team member
        Write-Host "5. Removing team member..." -ForegroundColor Yellow
        $removeResponse = Invoke-WebRequest -Uri "$baseUrl/team-members/$driverId" `
            -Method DELETE `
            -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
        
        if ($removeResponse.success) {
            Write-Host "✓ Team member removed successfully" -ForegroundColor Green
            
            # Check if data was cleaned up
            Write-Host "6. Verifying cascade deletion..." -ForegroundColor Yellow
            
            # Try to get driver record (should fail)
            try {
                $driverCheck = Invoke-WebRequest -Uri "$baseUrl/drivers/$driverId" `
                    -Method GET `
                    -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
                Write-Host "✗ Driver record still exists after deletion!" -ForegroundColor Red
            }
            catch {
                Write-Host "✓ Driver record deleted" -ForegroundColor Green
            }
            
            # Check if trips were deleted
            $tripsAfter = Invoke-WebRequest -Uri "$baseUrl/trips?driver_id=$driverId" `
                -Method GET `
                -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
            
            if ($tripsAfter.data.Count -eq 0) {
                Write-Host "✓ Trips deleted ($($tripsResponse.data.Count) → 0)" -ForegroundColor Green
            } else {
                Write-Host "✗ Trips still exist: $($tripsAfter.data.Count)" -ForegroundColor Red
            }
            
            # Check if inspections were deleted
            $inspectionsAfter = Invoke-WebRequest -Uri "$baseUrl/inspections?driver_id=$driverId" `
                -Method GET `
                -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
            
            if ($inspectionsAfter.data.Count -eq 0) {
                Write-Host "✓ Inspections deleted ($($inspectionsResponse.data.Count) → 0)" -ForegroundColor Green
            } else {
                Write-Host "✗ Inspections still exist: $($inspectionsAfter.data.Count)" -ForegroundColor Red
            }
            
            # Check if issues had driver_id set to null (not deleted)
            $issuesAfter = Invoke-WebRequest -Uri "$baseUrl/issues?driver_id=$driverId" `
                -Method GET `
                -Headers @{"Authorization"="Bearer $token"} | ConvertFrom-Json
            
            if ($issuesAfter.data.Count -eq 0 -and $issuesResponse.data.Count -gt 0) {
                Write-Host "✓ Issues unassigned from driver ($($issuesResponse.data.Count) → 0 with this driver)" -ForegroundColor Green
            } elseif ($issuesAfter.data.Count -eq 0) {
                Write-Host "✓ No issues were associated with this driver" -ForegroundColor Green
            } else {
                Write-Host "⚠ Issues still reference this driver: $($issuesAfter.data.Count)" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "✗ Failed to remove team member: $($removeResponse.message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ No driver users found to test" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ No team members found" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
