#!/usr/bin/env php
<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\User;

// Verify all companies
$updated = DB::table('companies')->update(['account_status' => 'verified']);
echo "✓ Updated $updated companies to verified status\n";

// Show company status
echo "\n=== COMPANY STATUS ===\n";
$companies = Company::select('id', 'name', 'account_status', 'company_status', 'subscription_status')->get();
foreach ($companies as $c) {
    echo "ID: {$c->id}, {$c->name} - Account: {$c->account_status}, Company: {$c->company_status}, Sub: {$c->subscription_status}\n";
}

// Show user status
echo "\n=== USER STATUS ===\n";
$users = User::select('id', 'name', 'email', 'role', 'account_status', 'company_id')->orderBy('id')->limit(15)->get();
foreach ($users as $u) {
    echo "ID: {$u->id}, {$u->name} ({$u->email}) - Role: {$u->role}, Account: {$u->account_status}, Company ID: {$u->company_id}\n";
}

echo "\n✓ All companies verified! Drivers should now have access to driver dashboard.\n";
