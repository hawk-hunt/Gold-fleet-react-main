# Quick Start - Payment Approval Workflow Testing

This guide helps you test the complete approval workflow to confirm the fix is working.

## Prerequisites
- Laravel backend running on http://localhost:8000
- React frontend running on http://localhost:3000 (or your dev port)
- MySQL database with migrations applied
- Postman or cURL for API testing (or use the system terminal)

## Test Scenario: Complete Approval Flow (5-10 minutes)

### Phase 1: Company Registration

**Step 1: Register a new company**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager", 
    "email": "john@testcompany.local",
    "password": "Test1234!",
    "password_confirmation": "Test1234!",
    "company_name": "Test Company LLC",
    "company_email": "info@testcompany.local",
    "company_phone": "5551234567"
  }'
```

**Response:** Save the `token` value
```json
{
  "user": {
    "id": 1,
    "account_status": "verified"
  },
  "company": {
    "id": 1,
    "account_status": "verified",
    "company_status": "pending",
    "subscription_status": "none"
  },
  "token": "YOUR_TOKEN_HERE"
}
```

**Step 2: Check company status in database**
```bash
# In MySQL
SELECT id, name, account_status, company_status, subscription_status 
FROM companies WHERE id = 1;

# Result:
# id: 1, name: "Test Company LLC", account_status: "verified", 
# company_status: "pending", subscription_status: "none"
```

### Phase 2: Create Subscription

**Step 3: Create subscription (frontend or API)**
```bash
curl -X POST http://localhost:8000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "plan_id": 1,
    "payment_data": {
      "simulated_amount": 99.99,
      "payment_method": "credit_card_visa"
    }
  }'
```

**Expected Result:** 
```json
{
  "company": {
    "subscription_status": "active",
    "company_status": "pending_approval"
  }
}
```

**Step 4: Verify database state**
```bash
SELECT company_status, subscription_status FROM companies WHERE id = 1;
# Result: company_status: "pending_approval", subscription_status: "active"
```

### Phase 3: Manual Payment Approval (Simulating Admin Action)

**Step 5: Get pending payments**
```bash
# Admin login first - get admin token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'

# Save the admin token, then get payments
curl -X GET "http://localhost:8000/api/platform/payments?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Accept: application/json"
```

**Step 6: Approve the payment**
```bash
# Replace payment_id with the actual ID from previous response
curl -X POST http://localhost:8000/api/platform/payments/1/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      "status": "verified",
      "verified_at": "2026-03-08T10:30:45Z"
    }
  },
  "company_approved": true
}
```

### Phase 4: THE FIX - Verify Company Auto-Approval

**Step 7: Check that company_status was automatically updated**
```bash
SELECT company_status, approved_at, approved_by FROM companies WHERE id = 1;

# EXPECTED RESULT (THE FIX):
# company_status: "approved"
# approved_at: "2026-03-08 10:30:45"  (current timestamp)
# approved_by: 2 (or 1, depending on admin ID)
```

**This is the critical validation!** If `company_status` is still `pending_approval`, the fix is not working.

### Phase 5: Verify Fleet Access Now Works

**Step 8: Try accessing fleet endpoints (should now return 200 instead of 403)**
```bash
# This would have returned 403 COMPANY_NOT_APPROVED before the fix
curl -X GET http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Expected: 200 empty array or list of vehicles
# NOT 403 Forbidden
```

**Step 9: Check platform status endpoint**
```bash
curl -X GET http://localhost:8000/api/platform/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"

# Expected response:
{
  "success": true,
  "company": {
    "company_status": "approved",
    "subscription_status": "active"
  },
  "access": {
    "can_access_fleet_features": true
  },
  "restrictions": {
    "blocked_reason": null
  }
}
```

### Phase 6: Frontend Auto-Detection

**Step 10: Test frontend approval detection**
1. Login to React frontend with the company's account
2. Navigate to `/vehicles` or `/dashboard/pending-approval`
3. You should see:
   - **Before Fix:** Stuck on PendingApprovalPage forever
   - **After Fix:** Page redirects to /vehicles within 5 seconds
4. Check browser console for:
   ```
   [ApprovalGuard] Company not approved. Starting to poll for approval updates...
   [ApprovalGuard] Company approved! Stopped polling
   ```

### Phase 7: Verify Notifications

**Step 11: Check that admin users received notifications**
```bash
SELECT * FROM notifications 
WHERE company_id = 1 
ORDER BY created_at DESC;

# Should see notification with:
# type: "approval"
# title: "Company Approved"
# message: "Your GoldFleet company account has been approved..."
```

## Debugging Checklist

If something doesn't work:

### Backend Issues
- [ ] Run `php artisan cache:clear`
- [ ] Run `php artisan config:cache`  
- [ ] Run `php artisan route:cache`
- [ ] Check `storage/logs/laravel.log` for errors
- [ ] Verify `PaymentVerificationService.php` has `approveCompanyAfterPayment()` method
- [ ] Confirm middleware is registered: `ensure.company.approved`

### Database Issues
- [ ] Verify columns exist: `DESC companies;`
- [ ] Check that migrations were run: `php artisan migrate:status`
- [ ] Ensure no duplicate columns if migrations were run before

### Frontend Issues
- [ ] Clear browser cache: DevTools > Application > Clear All
- [ ] Clear sessionStorage: `sessionStorage.clear()` in console
- [ ] Reload page
- [ ] Check browser console for errors
- [ ] Verify `refreshAuth` is exported from AuthContext

### API Issues
- [ ] Test endpoints with Postman or cURL
- [ ] Verify Authorization header: `Bearer <token>`
- [ ] Check response status codes (401, 403, 500)
- [ ] Look for error messages in response

## Expected Logs

**In browser console (frontend):**
```
[Auth] App initialized. Checking sessionStorage for token...
[Auth] Token found in sessionStorage. Validating with API...
[Auth] ✓ Token is valid! User data: {...}
[ApprovalGuard] Company not approved. Starting to poll for approval updates...
[ApprovalGuard] Auth state refreshed. Checking approval status...
[ApprovalGuard] Company approved! Stopped polling
```

**In `storage/logs/laravel.log` (backend):**
```
[2026-03-08 10:30:45] local.INFO: Payment verified
[2026-03-08 10:30:45] local.INFO: Company auto-approved after payment verification
[2026-03-08 10:30:45] local.INFO: Approval notification sent to user
```

## Success Criteria

All of these must be true:
- ✅ Company registered with `account_status = verified`
- ✅ Subscription created with `subscription_status = active`
- ✅ Payment verified by admin
- ✅ **Company auto-approved:** `company_status = approved` (THE FIX)
- ✅ `approved_at` timestamp set
- ✅ Notifications created for admin users
- ✅ Fleet endpoints return 200 (not 403)
- ✅ Frontend automatically redirects to fleet pages
- ✅ Logs show "Company auto-approved after payment"

## Quick Validation Commands

Run these to verify everything:

```bash
# 1. Check backend service methods
grep -n "approveCompanyAfterPayment" backend/app/Services/PaymentVerificationService.php

# 2. Check middleware registered
grep -n "ensure.company.approved" backend/bootstrap/app.php

# 3. Check frontend refreshAuth
grep -n "refreshAuth" frontend/src/context/AuthContext.jsx

# 4. Check approval guard polling
grep -n "setInterval" frontend/src/components/ApprovalGuard.jsx

# 5. Clear caches (IMPORTANT!)
cd backend && php artisan cache:clear && php artisan config:cache && php artisan route:cache
```

## Still Having Issues?

1. **Check the main fix documentation:** `APPROVAL_WORKFLOW_FIX.md`
2. **Run the validation script:** `php backend/test-approval-workflow.php`
3. **Review the code changes** in the files mentioned
4. **Check database logs** for update statements
5. **Enable debug mode** in `.env`: `APP_DEBUG=true`

---

**Need Help?** Check the troubleshooting section in `APPROVAL_WORKFLOW_FIX.md` or review the complete workflow documentation.

**Status:** Ready to Test ✅
