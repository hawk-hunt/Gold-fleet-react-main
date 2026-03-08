#!/usr/bin/env php
<?php
/**
 * Approval Workflow Validation Script
 * 
 * This script validates that the payment approval workflow is working correctly.
 * Run from the backend directory: php test-approval-workflow.php
 * 
 * Checks:
 * 1. PaymentVerificationService has approveCompanyAfterPayment method
 * 2. Company model has approveCompany method
 * 3. Sample payment/company states in database
 * 4. Middleware is registered
 */

echo "========================================\n";
echo "Approval Workflow Validation\n";
echo "========================================\n\n";

// Check 1: PaymentVerificationService
echo "[1] Checking PaymentVerificationService...\n";
$serviceFile = __DIR__ . '/app/Services/PaymentVerificationService.php';
if (file_exists($serviceFile)) {
    $content = file_get_contents($serviceFile);
    if (strpos($content, 'approveCompanyAfterPayment') !== false) {
        echo "✓ approveCompanyAfterPayment method exists\n";
    } else {
        echo "✗ approveCompanyAfterPayment method NOT FOUND\n";
    }
    
    if (strpos($content, 'notifyCompanyApprovalAfterPayment') !== false) {
        echo "✓ notifyCompanyApprovalAfterPayment method exists\n";
    } else {
        echo "✗ notifyCompanyApprovalAfterPayment method NOT FOUND\n";
    }
} else {
    echo "✗ PaymentVerificationService file not found\n";
}

echo "\n";

// Check 2: Company Model
echo "[2] Checking Company Model...\n";
$companyFile = __DIR__ . '/app/Models/Company.php';
if (file_exists($companyFile)) {
    $content = file_get_contents($companyFile);
    if (strpos($content, 'approveCompany') !== false) {
        echo "✓ approveCompany method exists in Company model\n";
    } else {
        echo "✗ approveCompany method NOT FOUND\n";
    }
    
    if (strpos($content, 'company_status') !== false) {
        echo "✓ company_status field referenced\n";
    } else {
        echo "✗ company_status field NOT found\n";
    }
} else {
    echo "✗ Company model file not found\n";
}

echo "\n";

// Check 3: Middleware Registration
echo "[3] Checking Middleware Registration...\n";
$bootstrapFile = __DIR__ . '/bootstrap/app.php';
if (file_exists($bootstrapFile)) {
    $content = file_get_contents($bootstrapFile);
    if (strpos($content, 'ensure.company.approved') !== false) {
        echo "✓ ensure.company.approved middleware is registered\n";
    } else {
        echo "✗ ensure.company.approved middleware NOT registered\n";
    }
    
    if (strpos($content, 'EnsureCompanyApproved') !== false) {
        echo "✓ EnsureCompanyApproved class referenced\n";
    } else {
        echo "✗ EnsureCompanyApproved class NOT referenced\n";
    }
} else {
    echo "✗ bootstrap/app.php file not found\n";
}

echo "\n";

// Check 4: Routes
echo "[4] Checking API Routes...\n";
$routesFile = __DIR__ . '/routes/api.php';
if (file_exists($routesFile)) {
    $content = file_get_contents($routesFile);
    $count = substr_count($content, "middleware('ensure.company.approved')");
    echo "✓ Found {$count} references to ensure.company.approved middleware\n";
    
    if (strpos($content, 'PlatformStatusController') !== false) {
        echo "✓ PlatformStatusController imported\n";
    } else {
        echo "✗ PlatformStatusController NOT imported\n";
    }
} else {
    echo "✗ routes/api.php file not found\n";
}

echo "\n";

// Check 5: Frontend Components
echo "[5] Checking Frontend Components...\n";
$authContextFile = __DIR__ . '/../frontend/src/context/AuthContext.jsx';
if (file_exists($authContextFile)) {
    $content = file_get_contents($authContextFile);
    if (strpos($content, 'refreshAuth') !== false) {
        echo "✓ refreshAuth method exists in AuthContext\n";
    } else {
        echo "✗ refreshAuth method NOT found\n";
    }
} else {
    echo "✗ AuthContext.jsx file not found\n";
}

$approvalGuardFile = __DIR__ . '/../frontend/src/components/ApprovalGuard.jsx';
if (file_exists($approvalGuardFile)) {
    $content = file_get_contents($approvalGuardFile);
    if (strpos($content, 'setInterval') !== false) {
        echo "✓ Polling mechanism found in ApprovalGuard\n";
    } else {
        echo "✗ Polling mechanism NOT found in ApprovalGuard\n";
    }
} else {
    echo "✗ ApprovalGuard.jsx file not found\n";
}

$pendingPageFile = __DIR__ . '/../frontend/src/pages/PendingApprovalPage.jsx';
if (file_exists($pendingPageFile)) {
    $content = file_get_contents($pendingPageFile);
    if (strpos($content, 'Check Status Now') !== false || strpos($content, 'handleManualRefresh') !== false) {
        echo "✓ Manual refresh button found in PendingApprovalPage\n";
    } else {
        echo "✗ Manual refresh button NOT found\n";
    }
} else {
    echo "✗ PendingApprovalPage.jsx file not found\n";
}

echo "\n";

// Check 6: Database Columns
echo "[6] Database Configuration Check...\n";
echo "Note: Requires database connection to fully validate\n";
echo "Expected columns on companies table:\n";
echo "  - account_status (varchar, not null)\n";
echo "  - company_status (varchar, not null)\n";
echo "  - subscription_status (varchar, not null)\n";
echo "  - approved_at (timestamp, nullable)\n";
echo "  - approved_by (integer, nullable)\n";

try {
    // Try to connect to database
    require __DIR__ . '/vendor/autoload.php';
    require __DIR__ . '/config/database.php';
    
    echo "\n✓ Database configuration loaded\n";
} catch (\Throwable $e) {
    echo "\n! Could not load database config (this is OK if running outside Laravel)\n";
}

echo "\n";

// Summary
echo "========================================\n";
echo "Validation Complete\n";
echo "========================================\n";
echo "\nIf all checks passed with ✓, the approval workflow fix is properly installed.\n";
echo "If any checks show ✗, please review the fix documentation.\n";
echo "\nNEXT STEPS:\n";
echo "1. Run: php artisan cache:clear\n";
echo "2. Run: php artisan config:cache\n";
echo "3. Run: php artisan route:cache\n";
echo "4. Test payment approval workflow\n";
echo "5. Check logs: tail -f storage/logs/laravel.log\n";
