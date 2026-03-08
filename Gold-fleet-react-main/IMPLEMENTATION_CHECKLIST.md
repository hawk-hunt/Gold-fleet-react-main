# Payment Approval Workflow - Implementation Checklist

Use this checklist to verify that all parts of the fix are properly implemented and working.

## Pre-Implementation Checklist

- [ ] Read `FIX_SUMMARY.md` to understand the issue and solution
- [ ] Review `APPROVAL_WORKFLOW_FIX.md` for technical details
- [ ] Backup your database
- [ ] Ensure backend is running (`php artisan serve`)
- [ ] Ensure frontend is running (npm dev)

## Backend Implementation Verification

### PaymentVerificationService
- [ ] File exists: `backend/app/Services/PaymentVerificationService.php`
- [ ] Method exists: `approveCompanyAfterPayment()`
- [ ] Method exists: `notifyCompanyApprovalAfterPayment()`
- [ ] `verifyPayment()` method calls `approveCompanyAfterPayment()`
- [ ] Importing required classes:
  - [ ] `use App\Models\Company;`
  - [ ] `use App\Models\Notification;`
  - [ ] `use App\Models\Message;`
  - [ ] `use Illuminate\Support\Facades\Auth;`
- [ ] PHP Syntax: `php -l app/Services/PaymentVerificationService.php` returns "No syntax errors"

### Middleware
- [ ] File exists: `backend/app/Http/Middleware/EnsureCompanyApproved.php`
- [ ] PHP Syntax: `php -l app/Http/Middleware/EnsureCompanyApproved.php` returns "No syntax errors"
- [ ] Checks `account_status === 'verified'`
- [ ] Checks `subscription_status === 'active'`
- [ ] Checks `company_status === 'approved'`
- [ ] Returns 403 if any condition fails
- [ ] Registered in `bootstrap/app.php` as `ensure.company.approved`

### Routes Configuration
- [ ] File: `backend/routes/api.php`
- [ ] Has `Route::middleware('ensure.company.approved')->group()` wrapper
- [ ] All fleet routes inside the group:
  - [ ] vehicles
  - [ ] drivers
  - [ ] trips
  - [ ] services
  - [ ] inspections
  - [ ] issues
  - [ ] expenses
  - [ ] fuel-fillups
  - [ ] reminders
  - [ ] dashboard routes
  - [ ] mapping routes
  - [ ] charts routes
- [ ] Non-restricted routes OUTSIDE the group:
  - [ ] profile
  - [ ] notifications
  - [ ] subscriptions (view only)
  - [ ] messages

### Company Model
- [ ] Method exists: `approveCompany(User $approver)`
- [ ] Updates `company_status` to `'approved'`
- [ ] Sets `approved_at` to `now()`
- [ ] Sets `approved_by` to `approver->id`

## Database Verification

### Companies Table Schema
```bash
# Run in MySQL/CLI:
DESC companies;
```

Check these columns exist:
- [ ] `account_status` (varchar, default='pending')
- [ ] `company_status` (varchar, default='pending')
- [ ] `subscription_status` (varchar, default='none')
- [ ] `approved_at` (timestamp, nullable)
- [ ] `approved_by` (integer, nullable)

### Test Data Check
```sql
-- Run in database
SELECT id, name, account_status, company_status, subscription_status, approved_at, approved_by
FROM companies 
LIMIT 1;
```

- [ ] All columns exist and return values

## Frontend Implementation Verification

### AuthContext
- [ ] File exists: `frontend/src/context/AuthContext.jsx`
- [ ] Method exists: `refreshAuth()`
- [ ] Method fetches from `/api/user`
- [ ] Method updates `user` and `company` state
- [ ] Method exported in `<AuthContext.Provider>`

### ApprovalGuard Component
- [ ] File exists: `frontend/src/components/ApprovalGuard.jsx`
- [ ] Uses polling mechanism
- [ ] Polling interval set to 5 seconds
- [ ] Polling starts when `isApproved === false`
- [ ] Polling stops when `isApproved === true`
- [ ] Proper cleanup with `clearInterval()`
- [ ] Redirects to `/dashboard/pending-approval` when not approved
- [ ] Allows children when approved

### PendingApprovalPage
- [ ] File exists: `frontend/src/pages/PendingApprovalPage.jsx`
- [ ] UI includes manual refresh button
- [ ] Has "Check Status Now" button
- [ ] Shows loading state while checking
- [ ] Displays last check timestamp
- [ ] Auto-refreshes every 5 seconds
- [ ] Updated timeline message

### App.jsx Routes
- [ ] All fleet management routes wrapped with `<ApprovalGuard>`
- [ ] Routes include:
  - [ ] /vehicles (all sub-routes)
  - [ ] /drivers (all sub-routes)
  - [ ] /trips (all sub-routes)
  - [ ] /services (all sub-routes)
  - [ ] /inspections (all sub-routes)
  - [ ] /issues (all sub-routes)
  - [ ] /expenses (all sub-routes)
  - [ ] /fuel-fillups (all sub-routes)
  - [ ] /reminders (all sub-routes)
  - [ ] /map
  - [ ] /info
- [ ] Non-restricted routes NOT wrapped:
  - [ ] /profile
  - [ ] /notifications
  - [ ] /company-settings

## Cache Clearing

- [ ] Ran `php artisan cache:clear`
- [ ] Ran `php artisan config:cache`
- [ ] Ran `php artisan route:cache`

## Automated Validation

```bash
cd backend
php test-approval-workflow.php
```

Expected output - all items should show ✓:
- [ ] ✓ approveCompanyAfterPayment method exists
- [ ] ✓ notifyCompanyApprovalAfterPayment method exists
- [ ] ✓ approveCompany method exists in Company model
- [ ] ✓ company_status field referenced
- [ ] ✓ ensure.company.approved middleware registered
- [ ] ✓ EnsureCompanyApproved class referenced
- [ ] ✓ Found references to ensure.company.approved middleware
- [ ] ✓ PlatformStatusController imported
- [ ] ✓ refreshAuth method exists in AuthContext
- [ ] ✓ Polling mechanism found in ApprovalGuard
- [ ] ✓ Manual refresh button found in PendingApprovalPage

## Integration Testing

### Step 1: Register New Company
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Manager","email":"test@local","password":"Test1234!","password_confirmation":"Test1234!","company_name":"Test Co","company_email":"company@test","company_phone":"1234567890"}'

# Save the token
# Check: company_status should be "pending"
```
- [ ] Company created successfully
- [ ] Token received
- [ ] company_status = 'pending' in database

### Step 2: Create Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"company_id":1,"plan_id":1,"payment_data":{"simulated_amount":99.99,"payment_method":"credit_card_visa"}}'

# Check: company_status should be "pending_approval"
```
- [ ] Subscription created
- [ ] company_status = 'pending_approval' in database
- [ ] subscription_status = 'active' in database

### Step 3: Admin Approves Payment
```bash
# Get payment ID
curl -X GET http://localhost:8000/api/platform/payments \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Verify payment
curl -X POST http://localhost:8000/api/platform/payments/<ID>/verify \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# THE FIX CHECK: company_status should NOW be "approved"
```
- [ ] Payment marked as 'verified'
- [ ] **CRITICAL:** company_status = 'approved' in database
- [ ] approved_at timestamp is recent
- [ ] Notifications created in database

### Step 4: Verify Fleet Access
```bash
curl -X GET http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer <TOKEN>"

# Should return 200, not 403
```
- [ ] Returns 200 OK (not 403)
- [ ] Fleet endpoints accessible
- [ ] No "COMPANY_NOT_APPROVED" error

### Step 5: Frontend Approval Detection
1. [ ] Login to React frontend with test company account
2. [ ] Navigate to `/vehicles` or another fleet page
3. [ ] Should show PendingApprovalPage
4. [ ] Should auto-redirect within 5 seconds (after approval is detected)
5. [ ] Check browser console for polling logs

### Step 6: Manual Refresh Button
1. [ ] On PendingApprovalPage, see "Check Status Now" button
2. [ ] Click button
3. [ ] Should show loading state
4. [ ] After clicking, check for console logs showing refresh
5. [ ] Should redirect after next approval detection

## Debugging Verification

### Backend Logs
```bash
tail -f storage/logs/laravel.log | grep -i "auto-approved"
```
- [ ] See "Company auto-approved after payment verification" log

### Frontend Console
Open browser DevTools > Console and look for:
- [ ] `[ApprovalGuard] Company not approved. Starting to poll...`
- [ ] `[ApprovalGuard] Auth state refreshed...`
- [ ] `[ApprovalGuard] Company approved! Stopped polling`

### Database Verification
```sql
-- Check a newly approved company
SELECT id, name, account_status, company_status, subscription_status, 
       approved_at, approved_by 
FROM companies 
WHERE company_status = 'approved' 
ORDER BY approved_at DESC 
LIMIT 1;
```
- [ ] company_status = 'approved'
- [ ] approved_at has recent timestamp
- [ ] approved_by has admin user ID

## Performance Verification

- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Page loads quickly
- [ ] Polling doesn't cause CPU spike
- [ ] No memory leaks (polling stops when approval detected)

## Final Validation

### All Systems Check
```bash
# 1. Syntax check
php -l app/Services/PaymentVerificationService.php
php -l app/Http/Middleware/EnsureCompanyApproved.php

# 2. Validation script
php test-approval-workflow.php

# 3. Complete flow test (follow steps above)
```

- [ ] All PHP files syntax valid
- [ ] All validation script checks pass
- [ ] Complete workflow test successful
- [ ] Payment approval triggers company approval
- [ ] Frontend detects approval automatically
- [ ] Fleet access granted after approval

## Sign-Off

- [ ] All checklist items completed
- [ ] No errors or warnings in logs
- [ ] Complete workflow tested successfully
- [ ] Ready for production deployment

**Tested by:** ________________
**Date:** ________________
**Status:** ✅ READY or ❌ ISSUES (specify below)

**Notes:**
```
[Add any notes or issues found]
```

---

## Rollback Plan (if needed)

If issues occur, rollback like this:

1. Restore backup: `mysql < backup.sql`
2. Clear caches: `php artisan cache:clear`
3. Restart servers

The fix is backward compatible so no code rollback needed (existing companies unaffected).

---

**Questions?** See `APPROVAL_WORKFLOW_FIX.md` for technical details.
