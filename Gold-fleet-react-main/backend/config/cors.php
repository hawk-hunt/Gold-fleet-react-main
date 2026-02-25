<?php

return [
    // Include API routes and the Sanctum CSRF cookie endpoint used by SPA auth
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'sanctum/csrf-token', 'login', 'logout'],
    'allowed_methods' => ['*'],
    // Allow local dev frontend ports (5173/5174/5175) and localhost loopback equivalents
    'allowed_origins' => [
        'http://localhost:5174',
        'http://localhost:5173',
        'http://localhost:5175',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5175',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
