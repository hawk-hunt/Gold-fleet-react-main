<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Update Sanji's account to verified
$user = \App\Models\User::where('email', 'sanji@gmail.com')->first();

if ($user) {
    echo "Found user: {$user->email}\n";
    echo "Current account_status: {$user->account_status}\n";
    echo "Current role: {$user->role}\n";
    echo "Has password: " . (!empty($user->password) ? 'YES' : 'NO') . "\n";
    
    // Update account status
    $user->update(['account_status' => 'verified']);
    echo "Updated account_status to: verified\n";
    
    // Reset password if needed (default password: Sanji@123456)
    // This is optional - uncomment if needed
    // $user->update(['password' => Hash::make('Sanji@123456')]);
    // echo "Reset password to: Sanji@123456\n";
} else {
    echo "User not found!\n";
}

// Verify the fix
$user = \App\Models\User::where('email', 'sanji@gmail.com')->first();
echo "\nAfter update:\n";
echo "Email: {$user->email}\n";
echo "Role: {$user->role}\n";
echo "Account Status: {$user->account_status}\n";
echo "Company ID: {$user->company_id}\n";
echo "\nYou can now try logging in with:\n";
echo "Email: sanji@gmail.com\n";
echo "Password: (your password)\n";
