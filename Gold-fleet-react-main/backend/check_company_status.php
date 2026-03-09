<?php
require 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Setup database
$db = new DB;
$db->addConnection([
    'driver' => 'mysql',
    'host' => env('DB_HOST', 'localhost'),
    'database' => env('DB_DATABASE'),
    'username' => env('DB_USERNAME'),
    'password' => env('DB_PASSWORD'),
    'charset' => 'utf8mb4',
]);
$db->setAsGlobal();
$db->bootEloquent();

// Get all companies
$companies = DB::table('companies')
    ->select('id', 'name', 'account_status', 'company_status', 'subscription_status')
    ->get();

echo "=== COMPANY STATUS ===\n";
foreach ($companies as $company) {
    echo "ID: {$company->id}, Name: {$company->name}\n";
    echo "  Account Status: {$company->account_status}\n";
    echo "  Company Status: {$company->company_status}\n";
    echo "  Subscription Status: {$company->subscription_status}\n\n";
}

// Get all users
$users = DB::table('users')
    ->select('id', 'name', 'email', 'role', 'account_status', 'company_id')
    ->get();

echo "\n=== USER STATUS ===\n";
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
    echo "  Role: {$user->role}, Account Status: {$user->account_status}, Company ID: {$user->company_id}\n\n";
}
