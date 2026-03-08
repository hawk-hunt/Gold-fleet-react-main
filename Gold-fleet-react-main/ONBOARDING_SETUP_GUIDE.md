# Onboarding & Verification System - Quick Setup

## Prerequisites
- Laravel backend running
- React frontend in development or built
- MySQL database connected
- API endpoints accessible

---

## Backend Setup

### 1. Run Migrations
```bash
cd backend

# Run the new migrations
php artisan migrate

# Verify migrations
php artisan migrate:status
```

**Expected Output:**
```
2026_03_08_add_verification_columns_to_companies_table   ✓
2026_03_08_add_account_status_to_users_table              ✓
```

### 2. Clear Cache
```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

### 3. Verify Models
Check that the models compile without errors:
```bash
php artisan tinker
>>> App\Models\Company::first()
>>> App\Models\User::first()
exit
```

### 4. Create Super Admin (if needed)
```bash
php artisan tinker
>>> App\Models\User::create([
...   'name' => 'Admin User',
...   'email' => 'admin@goldfleet.local',
...   'password' => Hash::make('securepassword'),
...   'role' => 'super_admin',
...   'account_status' => 'verified'
... ])
```

---

## Frontend Setup

### 1. No Installation Needed
The React components are compatible with your existing setup.

### 2. Verify Components Exist
```bash
cd frontend/src

# These files should exist:
ls components/ApprovalBanner.jsx
ls components/RestrictedFeatureOverlay.jsx
ls hooks/useCompanyApprovalStatus.js
ls context/AuthContext.jsx  # Updated
ls pages/Dashboard.jsx       # Updated
```

### 3. Build if Necessary
```bash
cd frontend
npm run build
```

---

## Testing the System

### Test 1: User Registration → Restricted Dashboard

```bash
# 1. Register new company
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Manager",
    "email": "manager@test.com",
    "password": "Test1234!",
    "password_confirmation": "Test1234!",
    "company_name": "Test Company",
    "company_email": "company@test.com",
    "company_phone": "1234567890"
  }'

# Should return:
# {
#   "user": {
#     "id": XX,
#     "account_status": "verified"
#   },
#   "company": {
#     "id": XX,
#     "account_status": "verified",
#     "company_status": "pending",
#     "subscription_status": "none"
#   },
#   "token": "..."
# }
```

### Test 2: Create Subscription

```bash
# Save token from previous response
TOKEN="..."

# Create subscription
curl -X POST http://localhost:8000/api/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "plan_id": 1,
    "payment_data": {
      "simulated_amount": 99.99,
      "payment_method": "credit_card_visa"
    }
  }'

# Should return:
# {
#   "company": {
#     "subscription_status": "active",
#     "company_status": "pending_approval"
#   }
# }
```

### Test 3: Login and Check Dashboard

```bash
# Login with registered credentials
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@test.com",
    "password": "Test1234!"
  }'

# Response should include:
# {
#   "company": {
#     "company_status": "pending_approval",
#     "subscription_status": "active"
#   }
# }
```

In browser, ApprovalBanner should appear on Dashboard.

### Test 4: Get Pending Approvals (Super Admin)

```bash
# Login as super admin first (get super admin token)
ADMIN_TOKEN="..."

# Get pending approvals
curl -X GET http://localhost:8000/api/platform/company-approvals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should return list of pending companies
```

### Test 5: Approve Company

```bash
ADMIN_TOKEN="..."

# Approve the company
curl -X POST http://localhost:8000/api/platform/company-approvals/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return:
# {
#   "company_status": "approved",
#   "approved_at": "2026-03-08T..."
# }
```

### Test 6: Verify Approval

```bash
# Check company is approved
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer $TOKEN"

# Response should show:
# {
#   "company": {
#     "company_status": "approved"
#   }
# }
```

In browser, ApprovalBanner should disappear and Dashboard should be fully unlocked.

---

## Database Rollback (if needed)

```bash
# Rollback last migration
php artisan migrate:rollback --step=2

# Or specific rollback
php artisan migrate:rollback --path=database/migrations/2026_03_08_*
```

---

## Troubleshooting

### Issue: Migration fails
**Solution:**
``` bash
# Check if columns already exist
php artisan tinker
>>> DB::table('companies')->getConnection()->getDoctrineTable('companies')->getColumns()
>>> // Look for account_status, company_status, etc.

# If columns exist, you can safely skip migrations
# Or add conditional checks in migrations (already done)
```

### Issue: Approval endpointreturns 403
**Solutions:**
1. Verify user is super_admin: `user.role = 'super_admin'`
2. Check token is valid: `php artisan tinker` → `User::find(id)->api_token`
3. Verify Authorization header format: `Bearer {token}`

### Issue: Dashboard shows no banner after payment
**Solutions:**
1. Check company_status in DB: 
   ```sql
   SELECT company_status, subscription_status FROM companies WHERE id = X;
   ```
2. Verify ApprovalBanner component is imported in Dashboard
3. Check browser console for JavaScript errors
4. Clear browser sessionStorage: Open DevTools → Application → Clear All

### Issue: Restricted cards still clickable
**Solutions:**
1. Verify `canAccessRestrictedFeatures` hook is imported
2. Check company_status returns 'pending_approval'
3. Verify subscription_status returns 'active'
4. Inspect element to see if onClick handler is bound correctly

---

## Database Schema Verification

```sql
-- Check companies table
DESC companies;
-- Should show: account_status, company_status, subscription_status, approved_at, approved_by

-- Check users table
DESC users;
-- Should show: account_status

-- Verify column types
SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'companies' 
AND COLUMN_NAME IN ('account_status', 'company_status', 'subscription_status');

-- Expected:
-- account_status: varchar(255)
-- company_status: varchar(255)
-- subscription_status: varchar(255)
```

---

## Files to Review

1. **New Migrations:** 
   - `backend/database/migrations/2026_03_08_add_verification_columns_to_companies_table.php`
   - `backend/database/migrations/2026_03_08_add_account_status_to_users_table.php`

2. **New Backend Files:**
   - `backend/app/Http/Controllers/Api/CompanyApprovalController.php`
   - `backend/app/Http/Middleware/DashboardAccessControl.php`
   - `backend/app/Http/Middleware/CompanyApprovedAccess.php`

3. **Updated Backend Files:**
   - `backend/app/Models/Company.php`
   - `backend/app/Models/User.php`
   - `backend/app/Http/Controllers/Api/AuthController.php`
   - `backend/app/Http/Controllers/SubscriptionController.php`
   - `backend/routes/api.php`

4. **New Frontend Files:**
   - `frontend/src/components/ApprovalBanner.jsx`
   - `frontend/src/components/RestrictedFeatureOverlay.jsx`
   - `frontend/src/hooks/useCompanyApprovalStatus.js`

5. **Updated Frontend Files:**
   - `frontend/src/context/AuthContext.jsx`
   - `frontend/src/pages/Dashboard.jsx`

---

## Next Steps (Optional)

1. **Email Notifications:**
   - Add email jobs for approval/rejection notifications
   - Update notification templates

2. **Admin Dashboard:**
   - Create admin panel for managing approvals
   - Add approval timeline view
   - Add rejection reason tracking

3. **Advanced Features:**
   - Company metadata for approval verification
   - Document uploads for verification
   - Custom approval workflows
   - Scheduled auto-approval timers

---

## Support

For issues or questions:
1. Check the main implementation document: `ONBOARDING_VERIFICATION_IMPLEMENTATION.md`
2. Review test examples above
3. Check browser console and server logs
4. Verify database state with provided SQL queries

**Implementation Complete:** March 8, 2026
