# Payment Approval Workflow - Complete Fix Guide

**Issue:** Company subscription was approved in platform/payments, but the company account remained in restricted mode with `company_status = 'pending_approval'` instead of automatically transitioning to `company_status = 'approved'`.

**Root Cause:** The payment verification service updated the PaymentSimulation record but never updated the related Company record to approve it for fleet access.

---

## What Was Fixed

### 1. Backend Payment Verification Service
**File:** `backend/app/Services/PaymentVerificationService.php`

**Problem:**
- `verifyPayment()` only updated payment status
- Did NOT update company status to 'approved'
- Company remained in 'pending_approval' even after successful payment verification

**Solution:**
- Added automatic company approval when a payment is verified
- Created method `approveCompanyAfterPayment()` to approve company after payment
- Created method `notifyCompanyApprovalAfterPayment()` to send notifications
- Added comprehensive logging at each step
- Gracefully handles missing super admin (uses system approval)

**New Methods:**
```php
private function approveCompanyAfterPayment(Company $company): void
private function notifyCompanyApprovalAfterPayment(Company $company): void
```

**Changes to verifyPayment():**
- Now checks if company exists and is not already approved
- Automatically calls `approveCompanyAfterPayment()` 
- Logs the company approval to track the workflow
- Returns `company_approved` flag in response

### 2. Frontend Auth Context
**File:** `frontend/src/context/AuthContext.jsx`

**Added:**
- `refreshAuth()` method to re-fetch user and company data from `/api/user`
- Exports `refreshAuth` in context provider so components can call it
- Provides a way for frontend to get latest approval status without page reload

**How It Works:**
```javascript
const refreshAuth = async () => {
  // Fetches fresh user/company data from API
  // Updates local state if successful
  // Returns boolean indicating success
}
```

### 3. Frontend ApprovalGuard Component
**File:** `frontend/src/components/ApprovalGuard.jsx`

**Added:**
- Automatic polling mechanism every 5 seconds when company is not approved
- Calls `refreshAuth()` to check for status updates
- Automatically stops polling once company is approved
- Proper cleanup of intervals to prevent memory leaks

**How It Works:**
```javascript
useEffect(() => {
  if (!isApproved) {
    // Start polling every 5 seconds for approval updates
    const interval = setInterval(async () => {
      await refreshAuth();
    }, 5000);
    
    return () => clearInterval(interval); // Cleanup on unmount
  }
}, [isApproved]);
```

### 4. Frontend PendingApprovalPage
**File:** `frontend/src/pages/PendingApprovalPage.jsx`

**Added:**
- Manual "Check Status Now" button for immediate status verification
- Auto-refresh every 5 seconds in the background
- Last check timestamp display
- Improved approval timeline message explaining instant approval

**User Experience:**
- Users see a refresh button they can click anytime
- System automatically checks status every 5 seconds
- When approval is detected, user is automatically redirected to fleet dashboard
- Clear feedback on when the last check occurred

---

## Complete Approval Workflow Flow

### Before Fix
```
User Creates Subscription
  ↓
Payment Verified in platform/payments
  ↓
payment_status = 'verified'  ✓
company_status = 'pending_approval' ✗ (NO CHANGE)
  ↓
Routes blocked by EnsureCompanyApproved middleware
  ↓
Company remains in restricted mode indefinitely
```

### After Fix
```
User Creates Subscription
  ↓
Payment Verified in platform/payments
  ↓
payment_status = 'verified'  ✓
PaymentVerificationService::verifyPayment() called
  ↓
  Automatically calls approveCompanyAfterPayment()
    ├─ Sets company_status = 'approved'
    ├─ Sets approved_at = now()
    ├─ Sets approved_by = super_admin or system
    └─ Sends notifications to admin users
  ↓
Frontend ApprovalGuard detects approval
  ├─ Polling discovers company_status = 'approved'
  ├─ Front-end state automatically updates
  └─ User redirected to fleet dashboard
  ↓
Routes accessible - full fleet access granted
```

---

## Database Column Requirements

The system checks three conditions - **ALL MUST BE TRUE**:

```sql
SELECT account_status, subscription_status, company_status 
FROM companies 
WHERE id = <company_id>;
```

**Expected Values for Full Access:**
- `account_status` = `verified`
- `subscription_status` = `active`
- `company_status` = `approved`

**Verification SQL:**
```sql
-- Check if company is fully approved
SELECT id, name, account_status, company_status, subscription_status, approved_at
FROM companies 
WHERE id = <company_id> 
AND account_status = 'verified'
AND subscription_status = 'active'
AND company_status = 'approved';
```

---

## Testing the Approval Workflow

### Step 1: Register a Company
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Manager",
    "email": "manager@test.local",
    "password": "Test1234!",
    "password_confirmation": "Test1234!",
    "company_name": "Test Company",
    "company_email": "company@test.local",
    "company_phone": "1234567890"
  }'

# Response includes:
# {
#   "company": {
#     "account_status": "verified",
#     "company_status": "pending",
#     "subscription_status": "none"
#   }
# }
```

### Step 2: Create Subscription & Payment
```bash
# (Frontend handles this through subscription setup)
# After payment, company_status should = "pending_approval"
```

### Step 3: Verify Payment in Platform Admin
```bash
# Admin portal approves payment at /platform/payments
# This triggers verifyPayment() which now ALSO approves the company
```

### Step 4: Check Company Status Was Updated
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer <token>"

# Response now includes:
# {
#   "company": {
#     "company_status": "approved",
#     "subscription_status": "active",
#     "approved_at": "2026-03-08T10:30:45Z"
#   }
# }
```

### Step 5: Verify Fleet Access Works
```bash
# These endpoints now return 200 instead of 403
curl -X GET http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer <token>"

curl -X GET http://localhost:8000/api/platform/status \
  -H "Authorization: Bearer <token>"

# Should return:
# {
#   "access": {
#     "can_access_fleet_features": true
#   },
#   "restrictions": {
#     "blocked_reason": null
#   }
# }
```

---

## Logging & Monitoring

### Backend Logs to Watch

**Payment Verification Logs:**
```
[2026-03-08 10:30:45] Payment verified (payment_id: 123, company_id: 45, amount: 99.99)
[2026-03-08 10:30:45] Company auto-approved after payment (company_id: 45)
[2026-03-08 10:30:45] Approval notification sent to user (user_id: 12)
```

**Enable detailed logging:**
```php
// In PaymentVerificationService.php - logs will appear in:
// storage/logs/laravel.log

Log::info('Payment verified', [...]);
Log::info('Company auto-approved after payment', [...]);
Log::error('Failed to approve company after payment', [...]);
```

### Frontend Logging

**Check browser console for:**
```
[Auth] Auth state refreshed. Checking approval status...
[ApprovalGuard] Company not approved. Starting to poll for approval updates...
[ApprovalGuard] Company approved! Stopped polling
```

**Enable React DevTools:**
- Check ApprovalGuard component state
- Watch `isApproved` transition from `false` to `true`
- Verify `pollInterval` cleanup

---

## Validation Checklist

### Backend Validation
- [ ] `PaymentVerificationService.php` has `approveCompanyAfterPayment()` method
- [ ] `verifyPayment()` calls `approveCompanyAfterPayment()` after updating payment
- [ ] Logs indicate "Company auto-approved after payment"
- [ ] Database shows `company_status = 'approved'` after payment verification
- [ ] `approved_at` timestamp is set
- [ ] Notifications created for admin users

### Middleware Validation
- [ ] `EnsureCompanyApproved` checks all three conditions:
  - `account_status === 'verified'`
  - `subscription_status === 'active'`
  - `company_status === 'approved'`
- [ ] Returns 403 with correct error code if any condition fails
- [ ] Returns 200 and allows access if all pass

### API Endpoint Validation
- [ ] `/api/platform/status` returns live data (not cached)
- [ ] `/api/user` includes `company.company_status`
- [ ] Response shows current database state

### Frontend Validation
- [ ] `AuthContext` exports `refreshAuth` method
- [ ] `ApprovalGuard` polls every 5 seconds when not approved
- [ ] `PendingApprovalPage` shows "Check Status Now" button
- [ ] Manual refresh button calls `refreshAuth()`
- [ ] Browser console shows polling logs

### Cache Validation
- [ ] Ran `php artisan cache:clear`
- [ ] Ran `php artisan config:cache`
- [ ] Ran `php artisan route:cache`

---

## Troubleshooting

### Issue: Company still pending after payment approval

**Check 1: Database State**
```sql
SELECT company_status, approved_at FROM companies WHERE id = X;
```
If `company_status` still = `pending_approval`, the fix is not working.

**Check 2: Payment Status**
```sql
SELECT payment_status, verified_at FROM payment_simulations WHERE company_id = X;
```
Confirm `payment_status` = `verified` and `verified_at` is recent.

**Check 3: Backend Logs**
```bash
tail -f storage/logs/laravel.log | grep -i "auto-approved"
```
Should see "Company auto-approved after payment" log entry.

**Check 4: Laravel Caches**
```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### Issue: Frontend not detecting approval

**Check 1: AuthContext Export**
Verify `frontend/src/context/AuthContext.jsx` exports `refreshAuth`:
```javascript
<AuthContext.Provider value={{ ..., refreshAuth, ... }}>
```

**Check 2: ApprovalGuard Polling**
Open DevTools Console, should see:
```
[ApprovalGuard] Company not approved. Starting to poll for approval updates...
```

**Check 3: Permission Response**
```bash
curl http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

If `403 COMPANY_NOT_APPROVED`, check database again.

### Issue: Notifications Not Sent

**Check Company Users:**
```php
php artisan tinker
>>> $company = Company::find(X);
>>> $company->users()->where('role', 'admin')->count();
```

Must have at least one admin user to receive notifications.

**Check Notification Table:**
```sql
SELECT * FROM notifications WHERE company_id = X ORDER BY created_at DESC;
```

### Clearing Session State

If frontend still shows pending after backend approval:
```javascript
// In browser DevTools Console:
sessionStorage.clear();
location.reload();
```

This forces fresh auth state from API.

---

## Architecture Summary

```
Payment Approval Flow (Auto)
│
├─ Admin clicks "Verify" in platform/payments
│  │
│  ├─ PlatformPaymentController::verifyPayment()
│  │  │
│  │  └─ PaymentVerificationService::verifyPayment()
│  │     ├─ Calculate earnings split
│  │     ├─ Update payment_simulations table
│  │     ├─ Call approveCompanyAfterPayment()
│  │     │  ├─ Update companies table (company_status = 'approved')
│  │     │  ├─ Call notifyCompanyApprovalAfterPayment()
│  │     │  │  ├─ Create Notification records
│  │     │  │  └─ Create Message records
│  │     │  └─ Log approval
│  │     └─ Return success with company_approved flag
│  │
│  └─ Response includes { company_approved: true }
│
└─ Frontend/User Flow (Auto-Detection)
   │
   ├─ PendingApprovalPage mounts
   │  └─ ApprovalGuard starts polling every 5 seconds
   │
   ├─ Poll loop:
   │  ├─ Call refreshAuth()
   │  ├─ Fetch /api/user from backend
   │  ├─ Update local company state
   │  └─ Check if company_status === 'approved'
   │
   └─ When approved detected:
      ├─ isApproved = true
      ├─ Stop polling (cleanup interval)
      └─ Navigate to /vehicles (or requested route)
```

---

## Files Modified

1. **backend/app/Services/PaymentVerificationService.php**
   - Added imports for Company, Notification, Message, Auth
   - Enhanced `verifyPayment()` to call approval method
   - Added `approveCompanyAfterPayment()` private method
   - Added `notifyCompanyApprovalAfterPayment()` private method

2. **frontend/src/context/AuthContext.jsx**
   - Added `refreshAuth()` method
   - Exported `refreshAuth` in provider

3. **frontend/src/components/ApprovalGuard.jsx**
   - Added polling mechanism when not approved
   - Auto-cleanup of polling intervals
   - Enhanced component logic

4. **frontend/src/pages/PendingApprovalPage.jsx**
   - Added manual refresh button
   - Added auto-refresh every 5 seconds
   - Updated timeline text for instant approval
   - Added "Check Status Now" button with loading state

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Send email to company admins when approved
   - Include link to fleet dashboard

2. **Admin Dashboard**
   - Show payment verification status
   - Display approval timestamps
   - Log all approval events

3. **Webhook/Events**
   - Emit event when company approved
   - Allow external systems to react to approvals

4. **Scheduled Jobs**
   - Auto-approve after certain period
   - Reject if conditions not met

5. **Analytics**
   - Track approval timing
   - Measure time from payment to activation

---

## Support & Questions

For issues:
1. Check backend logs: `storage/logs/laravel.log`
2. Check database state with SQL queries
3. Check browser console for ApprovalGuard polling
4. Clear caches: `php artisan cache:clear`
5. Verify middleware is registered in `bootstrap/app.php`

---

**Implementation Date:** March 8, 2026
**Status:** Complete & Ready for Testing
