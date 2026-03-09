<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== USERS IN DATABASE ===\n";
$users = \App\Models\User::get(['id', 'name', 'email', 'role', 'company_id', 'account_status']);
foreach ($users as $user) {
  echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email} | Role: {$user->role} | Company: {$user->company_id} | Status: {$user->account_status}\n";
}

echo "\n=== COMPANIES IN DATABASE ===\n";
$companies = \App\Models\Company::get(['id', 'name', 'email', 'subscription_status', 'is_active']);
foreach ($companies as $company) {
  echo "ID: {$company->id} | Name: {$company->name} | Email: {$company->email} | Sub: {$company->subscription_status} | Active: {$company->is_active}\n";
}
