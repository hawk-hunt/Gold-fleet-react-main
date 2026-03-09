<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== CHECKING CLARK (Company Admin) ===\n";
$clark = \App\Models\User::where('email', 'clark@gmail.com')->first();

if ($clark) {
    echo "Name: {$clark->name}\n";
    echo "Email: {$clark->email}\n";
    echo "Role: {$clark->role}\n";
    echo "Company ID: {$clark->company_id}\n";
    echo "Account Status: {$clark->account_status}\n";
    echo "Has Password: " . (!empty($clark->password) ? 'YES' : 'NO') . "\n";
    echo "Has API Token: " . (!empty($clark->api_token) ? 'YES' : 'NO') . "\n";
    
    // Get company details
    $company = $clark->company;
    echo "\nCompany Details:\n";
    echo "  Name: {$company->name}\n";
    echo "  Email: {$company->email}\n";
    echo "  Subscription Status: {$company->subscription_status}\n";
    echo "  Is Active: " . ($company->is_active ? 'YES' : 'NO') . "\n";
    
    // Check if there are any issues
    $issues = [];
    if ($clark->account_status !== 'verified') {
        $issues[] = "Account status is '{$clark->account_status}', should be 'verified'";
    }
    if (!$clark->api_token) {
        $issues[] = "No API token set";
    }
    if (!$company->is_active) {
        $issues[] = "Company is not active";
    }
    if ($company->subscription_status !== 'active') {
        $issues[] = "Company subscription is '{$company->subscription_status}', should be 'active'";
    }
    
    if (!empty($issues)) {
        echo "\n⚠ ISSUES FOUND:\n";
        foreach ($issues as $issue) {
            echo "  - {$issue}\n";
        }
    } else {
        echo "\n✓ Everything looks good for Clark!\n";
    }
} else {
    echo "Clark not found!\n";
}

echo "\n\n=== CHECKING SANJI (Platform Admin) ===\n";
$sanji = \App\Models\User::where('email', 'sanji@gmail.com')->first();

if ($sanji) {
    echo "Name: {$sanji->name}\n";
    echo "Email: {$sanji->email}\n";
    echo "Role: {$sanji->role}\n";
    echo "Company ID: {$sanji->company_id}\n";
    echo "Account Status: {$sanji->account_status}\n";
    echo "Has Password: " . (!empty($sanji->password) ? 'YES' : 'NO') . "\n";
    echo "Has API Token: " . (!empty($sanji->api_token) ? 'YES' : 'NO') . "\n";
    
    // Get company details
    $company = $sanji->company;
    echo "\nAssociated Company:\n";
    echo "  Name: {$company->name}\n";
    echo "  Email: {$company->email}\n";
    
    // Check if there are any issues
    $issues = [];
    if ($sanji->account_status !== 'verified') {
        $issues[] = "Account status is '{$sanji->account_status}', should be 'verified'";
    }
    if (!$sanji->api_token) {
        $issues[] = "No API token set";
    }
    
    if (!empty($issues)) {
        echo "\n⚠ ISSUES FOUND:\n";
        foreach ($issues as $issue) {
            echo "  - {$issue}\n";
        }
    } else {
        echo "\n✓ Everything looks good for Sanji!\n";
    }
} else {
    echo "Sanji not found!\n";
}
