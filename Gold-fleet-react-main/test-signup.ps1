#!/usr/bin/env powershell
# Test signup endpoint with curl

$body = @{
    name = "Test User"
    email = "testuser$(Get-Random)@example.com"
    password = "TestPassword123"
    password_confirmation = "TestPassword123"
    company_name = "Test Company $(Get-Random)"
    company_email = "testcompany$(Get-Random)@example.com"
    company_phone = "555-1234"
    company_address = "123 Test St"
} | ConvertTo-Json

Write-Host "📤 Sending signup request..."
Write-Host "Body: $body`n"

$response = curl -X POST http://localhost:8000/api/register `
    -H "Content-Type: application/json" `
    -H "Accept: application/json" `
    -d $body -v

Write-Host "`n✅ Response:`n"
Write-Host $response
