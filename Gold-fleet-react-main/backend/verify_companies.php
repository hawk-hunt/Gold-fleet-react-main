<?php
/**
 * Verify all companies for driver access
 * Usage: php artisan tinker --execute="include 'verify_companies.php'"
 */

// Get all companies
$companies = \App\Models\Company::all();

echo "\n=== CURRENT COMPANY STATUS ===\n";
foreach ($companies as $company) {
    echo "ID: {$company->id}, Name: {$company->name}\n";
    echo "  Account Status: {$company->account_status}\n";
    echo "  Company Status: {$company->company_status}\n"; 
    echo "  Subscription Status: {$company->subscription_status}\n";
}

echo "\n=== UPDATING COMPANIES ===\n";
// Mark all companies as verified for development
$updated = \App\Models\Company::query()->update([
    'account_status' => 'verified',
]);

echo "Updated {$updated} companies to account_status = 'verified'\n";

// Show updated status
echo "\n=== UPDATED STATUS ===\n";
$companies = \App\Models\Company::all();
foreach ($companies as $company) {
    echo "ID: {$company->id}, {$company->name} - Account Status: {$company->account_status}\n";
}

// Check users  
echo "\n=== USERS ===\n";
$users = \App\Models\User::select('id', 'name', 'email', 'role', 'account_status', 'company_id')->get();
foreach ($users as $user) {
    echo "ID: {$user->id}, {$user->name} ({$user->email}), Role: {$user->role}, Account: {$user->account_status}, Company: {$user->company_id}\n";
}

echo "\n✓ Done!\n";
