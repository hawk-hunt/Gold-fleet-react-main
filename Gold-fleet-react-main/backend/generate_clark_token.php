<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== GENERATING API TOKEN FOR CLARK ===\n";
$clark = \App\Models\User::where('email', 'clark@gmail.com')->first();

if ($clark) {
    // Generate new API token
    $token = \Illuminate\Support\Str::random(80);
    $clark->update(['api_token' => $token]);
    
    echo "✓ Generated API token for Clark\n";
    echo "Token: {$token}\n\n";
    echo "Clark can now log in successfully!\n";
    echo "Email: clark@gmail.com\n";
    echo "Password: (use your password)\n";
} else {
    echo "Clark not found!\n";
}
