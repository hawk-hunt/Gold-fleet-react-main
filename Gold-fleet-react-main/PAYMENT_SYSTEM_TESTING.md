# Payment System Testing & Verification Guide

## Quick Verification Steps

### ✅ Step 1: Verify Database Migration
```bash
cd backend
php artisan migrate
```
**Expected Output:**
```
2026_03_07_000003_update_payment_simulations_for_tracking ..... 40.15ms DONE
```

**Verify columns were added to `payment_simulations` table:**
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'payment_simulations' 
AND column_name IN ('platform_commission', 'platform_earnings', 'company_earnings', 'verified_at', 'verification_notes');
```

Should show 5 new columns.

---

### ✅ Step 2: Verify Backend Services & Controllers

#### Check Service File Exists:
```bash
ls -la backend/app/Services/PaymentVerificationService.php
```
✅ Should exist and contain:
- `verifyPayment()` method
- `getCompanyPaymentStats()` method
- `getPlatformRevenueStats()` method
- `PLATFORM_COMMISSION_RATE = 0.20`

#### Check Controller File Exists:
```bash
ls -la backend/app/Http/Controllers/PlatformPaymentController.php
```
✅ Should exist and contain:
- `index()` - list all payments
- `show()` - single payment details
- `verifyPayment()` - verify payment
- `revenueStats()` - revenue statistics
- `companyStats()` - company stats
- `companiesSummary()` - all companies summary
- `myPayments()` - company's own payments

---

### ✅ Step 3: Verify API Routes

**Check routes file:**
```bash
grep -n "PlatformPaymentController" backend/routes/api.php
```

✅ Should find these routes:
```
/api/platform/payments - GET
/api/platform/payments/{id} - GET
/api/platform/payments/{id}/verify - POST
/api/platform/payments-stats/revenue - GET
/api/platform/payments-stats/company/{companyId} - GET
/api/platform/payments-stats/companies-summary - GET
/api/payments/my - GET
```

---

### ✅ Step 4: Verify Frontend Components

#### Check Payment Management Component:
```bash
ls -la frontend/src/platform/pages/PaymentManagement.jsx
```
✅ Should exist and contain:
- Revenue statistics cards
- Company summary table
- Payment history table
- Status filters
- Company filters
- Pagination
- Payment detail modal
- Manual verification button

#### Check Router Updated:
```bash
grep -n "PaymentManagement" frontend/src/platform/routes/PlatformRouter.jsx
```
✅ Should show import and route `/platform/payments`

#### Check Sidebar Updated:
```bash
grep -n "Payments" frontend/src/platform/layout/PlatformSidebar.jsx
```
✅ Should show "Payments" in navigation items

#### Check Dashboard Link Added:
```bash
grep -n "Go to Payments" frontend/src/platform/pages/PlatformDashboard.jsx
```
✅ Should show link to payment management on dashboard

---

## Manual Testing

### Test 1: Create a Company Signup with Payment

**Test Data:**
```json
{
  "name": "Test Company LLC",
  "email": "test@test.com",
  "phone": "+12025551234",
  "address": "123 Main St, City, State 12345",
  "password": "TestPassword123!",
  "plan_id": 2,
  "payment_data": {
    "simulated_amount": 49.99,
    "payment_method": "credit_card_visa",
    "payment_date": "2024-03-07T10:30:00Z",
    "card_number": "4111111111111111",
    "expiry_date": "12/25",
    "cvc": "123"
  }
}
```

**Using Postman/cURL:**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d @test-signup.json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "api_token": "YOUR_TOKEN_HERE",
  "user": {
    "id": 3,
    "name": "Test Company LLC",
    "email": "test@test.com",
    "company_id": 3
  }
}
```

**Then Verify Database:**
```sql
-- Check company was created
SELECT * FROM companies WHERE email = 'test@test.com';

-- Check subscription was created
SELECT * FROM subscriptions WHERE company_id = (SELECT id FROM companies WHERE email = 'test@test.com');

-- Check payment was created AND verified
SELECT id, company_id, payment_status, platform_commission, platform_earnings, company_earnings, verified_at 
FROM payment_simulations 
WHERE company_id = (SELECT id FROM companies WHERE email = 'test@test.com');
```

**Expected Database Results:**
```
Company: email = 'test@test.com', status = 'active'
Subscription: plan_id = 2, status = 'active', started_at = NOW()
Payment: payment_status = 'verified', platform_commission = 0.20, platform_earnings = 10.00, company_earnings = 39.99, verified_at = NOW()
```

---

### Test 2: Test Revenue API Endpoint

**Get Super Admin Token:**
```bash
curl -X POST http://localhost:8000/api/platform/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@goldfleet.com", "password": "your_password"}'
```

**Get Revenue Stats:**
```bash
curl -X GET http://localhost:8000/api/platform/payments-stats/revenue \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_collected": 49.99,
    "platform_revenue": 10.00,
    "companies_total_earnings": 39.99,
    "commission_rate": 20,
    "payment_count": 1,
    "breakdown": {
      "platform_percentage": 20,
      "company_percentage": 80
    }
  }
}
```

---

### Test 3: Test Get All Payments Endpoint

```bash
curl -X GET http://localhost:8000/api/platform/payments \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 3,
      "company": {
        "id": 3,
        "name": "Test Company LLC",
        "email": "test@test.com"
      },
      "subscription": {
        "id": 1,
        "plan": {
          "id": 2,
          "name": "Professional",
          "price": 49.99
        }
      },
      "payment": {
        "amount": 49.99,
        "method": "credit_card_visa",
        "date": "2024-03-07T10:30:00Z",
        "status": "verified"
      },
      "earnings": {
        "company_pays": 49.99,
        "platform_earns": 10.00,
        "company_benefits": 39.99,
        "commission_rate": "20%"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

### Test 4: Test Get Company Stats Endpoint

```bash
curl -X GET http://localhost:8000/api/platform/payments-stats/company/3 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "company_id": 3,
    "total_paid": 49.99,
    "company_earnings": 39.99,
    "payment_count": 1,
    "company_name": "Test Company LLC",
    "company_email": "test@test.com",
    "payments": [
      {
        "id": 1,
        "amount": 49.99,
        "date": "2024-03-07T10:30:00Z",
        "status": "verified"
      }
    ]
  }
}
```

---

### Test 5: Test Companies Summary Endpoint

```bash
curl -X GET http://localhost:8000/api/platform/payments-stats/companies-summary \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "company_id": 3,
      "company_name": "Test Company LLC",
      "company_email": "test@test.com",
      "total_paid": 49.99,
      "company_earnings": 39.99,
      "payment_count": 1,
      "last_payment_date": "2024-03-07T10:30:00Z"
    }
  ]
}
```

---

### Test 6: Test Company's Own Payment Endpoint

**Using Test Company Token From Test 1:**
```bash
curl -X GET http://localhost:8000/api/payments/my \
  -H "Authorization: Bearer COMPANY_TOKEN_FROM_SIGNUP"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subscription_id": 1,
      "simulated_amount": 49.99,
      "payment_method": "credit_card_visa",
      "payment_date": "2024-03-07T10:30:00Z",
      "payment_status": "verified"
    }
  ],
  "pagination": {
    "total": 1,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

### Test 7: Test Frontend Dashboard

**Steps:**
1. Open browser → `http://localhost:3000/platform/dashboard` (as super admin)
2. Should see platform dashboard with stats
3. Scroll to bottom
4. Should see "Payment Management" section with "Go to Payments →" button
5. Click button → Should go to `/platform/payments`
6. Should see:
   - Revenue statistics cards (total collected, platform revenue, etc.)
   - Company summary table
   - Payment history table
   - Status and company filters
   - Payment details when clicked

---

### Test 8: Test Manual Payment Verification

**Create a pending payment:**
1. Directly insert into database or via signup with special flag
2. Get payment ID
3. Update payment status to 'pending'

**Verify via API:**
```bash
curl -X POST http://localhost:8000/api/platform/payments/{payment_id}/verify \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 1,
    "payment_status": "verified",
    "verified_at": "2024-03-07T10:35:00Z",
    "verification_notes": "Payment verified: Company pays..."
  }
}
```

---

## Checklist for Full Verification

- [ ] Database migration executed successfully
- [ ] 5 new columns exist in payment_simulations table
- [ ] PaymentVerificationService.php exists and has all methods
- [ ] PlatformPaymentController.php exists with 7 endpoints
- [ ] All routes registered in api.php
- [ ] PaymentManagement.jsx component created
- [ ] Route /platform/payments created
- [ ] Sidebar link added for Payments
- [ ] Dashboard link added to Payment Management
- [ ] Test company signup creates payment
- [ ] Payment auto-verifies on creation
- [ ] Revenue stats API returns correct calculation
- [ ] All payments API returns all data
- [ ] Company stats API returns filtered data
- [ ] Companies summary shows all companies
- [ ] Frontend dashboard loads payment management page
- [ ] Payment filters work correctly
- [ ] Pagination works correctly
- [ ] Payment detail modal displays correctly
- [ ] Manual verification button works
- [ ] Company can see only their own payments

---

## Performance Testing

### Test Large Dataset:
```bash
# Create 100 test companies with payments
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/register \
    -H "Content-Type: application/json" \
    -d "{...company data with random plan...}"
done
```

**Then test API performance:**
```bash
# Measure response time for all payments
time curl -X GET "http://localhost:8000/api/platform/payments?per_page=50" \
  -H "Authorization: Bearer YOUR_TOKEN" > /dev/null
```

Expected: < 500ms response time

---

## Security Testing

### Test 1: Verify Super Admin Check
```bash
# Try to access with non-admin user token
curl -X GET http://localhost:8000/api/platform/payments \
  -H "Authorization: Bearer COMPANY_TOKEN"
```
**Expected:** 403 Unauthorized error

### Test 2: Verify Company_id Check
```bash
# Try to access with admin token but wrong company_id
# (Should not be possible if user is properly authenticated)
```

### Test 3: Verify Token Required
```bash
# Try without any token
curl -X GET http://localhost:8000/api/platform/payments
```
**Expected:** 401 Unauthorized error

---

## Common Issues & Solutions

### Issue: Payment not verified automatically
**Solution:** Check SubscriptionController is calling PaymentVerificationService after creating subscription

### Issue: Earnings calculation wrong
**Solution:** Verify platform_commission is set to 0.20, check formula: company_earnings = amount - (amount * commission)

### Issue: API returns 404
**Solution:** Verify routes are registered, clear route cache:
```bash
php artisan route:clear
```

### Issue: Frontend doesn't load payment component
**Solution:** Check all imports are correct, verify React Router path is `/platform/payments`

### Issue: Pagination not working
**Solution:** Verify pageSize = 10 in component, check page parameter logic

---

## Success Criteria

✅ All tests pass
✅ Database has 5 new columns
✅ 7 API endpoints working
✅ React component loads
✅ Payment calculations correct (20% platform, 80% company)
✅ Auth verification working (super admin only)
✅ Company privacy working (companies can only see own payments)
✅ Pagination working
✅ Filters working
✅ Response times < 500ms

---

**Testing Status:** Ready for Full Verification
**Last Updated:** 2024-03-07
