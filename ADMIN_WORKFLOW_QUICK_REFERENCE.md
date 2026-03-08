# Admin Platform - SaaS Workflow Quick Reference

**For:** Platform Admins & Developers  
**Purpose:** Quick reference of what happens at each step in the SaaS onboarding workflow  
**Last Updated:** March 8, 2026  

---

## THE CLEAN SaaS WORKFLOW

### What the Admin Sees & Does

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN PLATFORM COMPANIES TAB                                │
├─────────────────────────────────────────────────────────────┤
│ Company Name │ Email │ Status │ Subscription │ Payment │ ... │
├─────────────────────────────────────────────────────────────┤
│ Acme Corp    │ a@... │ ●      │ ◯            │ ◯       │ ... │
│              │       │Register│ Pending      │ Pending │     │
│              │       │        │              │         │ [V] │ ← Verify Payment
└─────────────────────────────────────────────────────────────┘
                            ↓ (admin clicks VERIFY PAYMENT)
                    SYSTEM AUTOMATICALLY UPDATES:
                    
          company_status = Approved ✓
          subscription_status = Active ✓
          payment_status = Verified ✓
          
                    ↓ (after 30-60 seconds)
                    
┌─────────────────────────────────────────────────────────────┐
│ COMPANIES LIST (NOW SHOWING UPDATED STATUS)                 │
├─────────────────────────────────────────────────────────────┤
│ Acme Corp    │ a@... │ ●      │ ◯            │ ◯       │ ... │
│              │       │Approved│ Active       │ Verified│     │
│              │       │        │              │         │ [X] │
└─────────────────────────────────────────────────────────────┘

          ✓ Company can now access platform
          ✓ Dashboard is unlocked
          ✓ All features available
```

---

## STEP-BY-STEP ADMIN ACTIONS

### 1. Company Registers (Automatic)
```
What Happens:
├─ Companies tab shows new company
├─ Status = "Registered"
├─ Subscription = "Pending"
├─ Payment = "Pending"
└─ Action buttons = Available

Database Changes:
├─ companies.company_status = 'registered'
├─ companies.subscription_status = 'pending'
└─ companies.is_active = false
```

### 2. Admin Views Payment Details
```
What Admin Does:
├─ Click "View" on a company
└─ See payment details and "Verify Payment" button

System Response:
├─ Shows payment amount
├─ Shows payment method
├─ Shows current status
└─ Shows "Verify Payment" button
```

### 3. Admin Verifies Payment ⭐ CRITICAL STEP
```
What Admin Does:
└─ Click "Verify Payment" button

System Automatically Does:
├─ Step 1: Marks payment as verified
│          payment_status = 'verified'
│
├─ Step 2: ACTIVATES SUBSCRIPTION [NEW FIX]
│          subscription.status = 'active'
│
├─ Step 3: Updates company sync [NEW FIX]
│          company.subscription_status = 'active'
│          company.is_active = true
│
├─ Step 4: Approves company
│          company.company_status = 'approved'
│
├─ Step 5: Sends notifications
│          Notifies company admin users
│
└─ Response to Admin:
           "Payment verified successfully"
           "Subscription activated"
           "Company approved"
```

### 4. Admin Returns to Companies List
```
What Admin Sees:
├─ Still shows old data for 0-30 seconds (loading in background)
│
└─ After 30 seconds auto-refresh:
   ├─ Status = "Approved" ✓
   ├─ Subscription = "Active" ✓
   ├─ Payment = "Verified" ✓
   └─ Company can now access platform ✓
```

### 5. Company Accesses Platform (Meanwhile, At Company Side)
```
What Company Sees:
├─ Dashboard ApprovalBanner DISAPPEARS
├─ All fleet management features UNLOCK
├─ Can now access:
│  ├─ Vehicles
│  ├─ Drivers
│  ├─ Trips
│  ├─ Services
│  ├─ Inspections
│  ├─ Issues
│  ├─ Expenses
│  ├─ Fuel tracking
│  ├─ Analytics
│  └─ More...
└─ Full platform access granted
```

---

## ADMIN ACTIONS & THEIR EFFECTS

### Action: Approve Company
```
Before:
  company_status = 'registered'
  is_active = false

After Verify Payment (automatic):
  company_status = 'approved'
  is_active = true
  subscription_status = 'active'

Effect: Company unlocked, full access
```

### Action: Decline Company
```
Before:
  company_status = 'registered'
  subscription_status = 'pending'

After Clicking Decline:
  company_status = 'declined'
  subscription_status = 'cancelled'
  is_active = false
  (+ automatic refund triggered)

Effect: Company locked out, payment refunded
```

### Action: Suspend Subscription
```
Before:
  subscription.status = 'active'
  company.subscription_status = 'active'
  company.is_active = true

After Suspend:
  subscription.status = 'suspended'
  company.subscription_status = 'suspended'  ← SYNCED [FIX]
  company.is_active = false

Effect: Company access temporarily revoked
Time to Effect: Immediate (or within 30 sec on frontend)
```

### Action: Resume Subscription
```
Before:
  subscription.status = 'suspended'
  company.subscription_status = 'suspended'
  company.is_active = false

After Resume:
  subscription.status = 'active'
  company.subscription_status = 'active'  ← SYNCED [FIX]
  company.is_active = true

Effect: Company access restored
Time to Effect: Immediate (or within 30 sec on frontend)
```

### Action: Delete Company
```
Before:
  company exists with subscriptions and payments

Delete Process (safe due to FK constraints):
  1. Delete all payment_simulations for this company
  2. Delete all subscriptions for this company
  3. Delete company record
  4. (Cascade deletes related users if needed)

Effect: Company completely removed
Database: Clean, no orphaned records
Force: No FK constraint violations ✓
```

---

## DATA SYNCHRONIZATION

### How Data Stays In Sync

```
OLD PROBLEM (Before Fixes):
subscription.status = 'active'
company.subscription_status = 'pending'  ← MISMATCH!

Admin sees: "Subscription: Pending" (WRONG)
Reality: Subscription is active
Result: User locked out despite paying


NEW SOLUTION (After Fixes):
subscription.status = 'active'
company.subscription_status = 'active'  ← ALWAYS SYNCED ✓

Admin sees: "Subscription: Active" (CORRECT)
Reality: Subscription is active
Result: User unlocked immediately
```

### How Frontend Stays Fresh

1. **Auto-Refresh Every 30 Seconds**
   - Companies list refreshes automatically
   - Subscriptions list refreshes automatically
   - Payment list refreshes automatically

2. **Manual Refresh on Action**
   - After verifying payment → immediate refresh
   - After suspending subscription → immediate refresh
   - After declining company → immediate refresh

3. **Real-Time via Polling**
   - No need to manually refresh page
   - System polls backend continuously
   - Admin sees latest data

---

## WHAT WAS BROKEN & HOW IT'S FIXED

| Problem | Old Behavior | New Behavior | Impact |
|---------|--------------|--------------|--------|
| Payment verified but company locked | subscription.status remained 'pending' | subscription.status = 'active' automatically | ✅ Company unlocked |
| Admin saw stale subscription status | company.subscription_status = 'pending' | Gets real value from subscriptions table | ✅ Correct data |
| Suspending subscription didn't sync | company.subscription_status unchanged | company.subscription_status = 'suspended' | ✅ Data consistent |
| Frontend showed old data | Manual refresh required | Auto-refresh every 30s | ✅ Always fresh |

---

## MODULE RESPONSIBILITIES EXPLAINED

### COMPANIES = Account Management
```
What It Does:
├─ Create/delete companies
├─ Approve/decline companies
├─ Manage company account status
└─ Can suspend/activate companies

What It CAN'T Do:
├─ Touch subscriptions
├─ Touch payments
└─ Change status without reason
```

### SUBSCRIPTIONS = Billing Plans
```
What It Does:
├─ Create subscriptions
├─ Activate/suspend subscriptions
├─ Handle plan changes
├─ Track subscription dates
└─ Sync to company.subscription_status

What It CAN'T Do:
├─ Touch payments
├─ Verify payments
└─ Approve companies
```

### PAYMENTS = Financial Transactions
```
What It Does:
├─ Track payments
├─ Verify payments
├─ Calculate earnings
├─ Trigger subscription activation
└─ Trigger company approval

What It CAN'T Do:
├─ Directly modify subscriptions
├─ Bypass subscription activation
└─ Refund without company decline
```

---

## TROUBLESHOOTING FOR ADMINS

### Issue: Company Status Not Updating
**Check:**
1. Admin clicked "Verify Payment" button? (Not declined)
2. Frontend refreshing? (Should update in 30 sec)
3. Could manually refresh: F5 or click refresh button
4. Database: `SELECT company_status, subscription_status FROM companies WHERE id = X;`

**Solution:** Wait 30 seconds for auto-refresh, or manually refresh page

---

### Issue: Subscription Shows Wrong Status
**Check:**
1. Is subscription.status correct? (Check subscriptions table directly)
2. Did admin recently suspend/resume? (May need 30 sec refresh)
3. Is auto-refresh working? (Check browser console)

**Solution:** Manual page refresh should fix it

---

### Issue: Payment Won't Verify
**Check:**
1. Is payment record in database?
2. Is payment_status already 'verified'? (Can't re-verify)
3. Does related subscription exist?
4. Does related company exist?
5. Server logs: `storage/logs/laravel.log`

**Solutions:**
- Check that related records exist
- Verify server is running
- Check API token in browser DevTools

---

### Issue: Can't Delete Company
**Check:**
1. Error about foreign keys? (Fixed in code, check syntax)
2. Are there active payments? (Delete order: payments → subscriptions → company)
3. Are there user accounts? (Should cascade)

**Solution:** System now deletes in correct order, should work

---

## VERIFICATION CHECKLIST FOR ADMINS

Use this checklist when onboarding a new company:

- [ ] Company registered successfully
- [ ] Company appears in Companies tab
- [ ] Status shows "Registered"
- [ ] Payment appears in Payments tab
- [ ] Click "Verify Payment" button
- [ ] See success message
- [ ] Wait 30 seconds
- [ ] Refresh Companies page (or auto-refresh)
- [ ] Status now shows "Approved"
- [ ] Subscription shows "Active"
- [ ] Payment shows "Verified"
- [ ] Notify company via email
- [ ] Company tests accessing dashboard
- [ ] All features unlocked ✓

---

## PERFORMANCE NOTES

- Company list queries: < 100ms (with proper indexing)
- Payment verification: < 500ms
- Frontend refresh interval: 30 seconds (configurable)
- Database updates: Transaction-safe, atomic operations

---

## API ENDPOINTS REFERENCED BY ADMIN UI

```
GET    /api/platform/companies
  └─ List all companies with status

POST   /api/platform/companies/{id}/approve
  └─ Approve single company (manual, rarely used)

POST   /api/platform/companies/{id}/decline
  └─ Decline and refund (with reason)

DELETE /api/platform/companies/{id}
  └─ Delete company

POST   /api/platform/payments/{id}/verify
  └─ Verify payment (TRIGGERS EVERYTHING)

POST   /api/platform/subscription-management/{id}/suspend
  └─ Suspend subscription

POST   /api/platform/subscription-management/{id}/resume
  └─ Resume subscription
```

---

**Need Help?** Check these files:
- Technical Details: `SAAS_WORKFLOW_IMPLEMENTATION_COMPLETE.md`
- Architecture Overview: `SAAS_WORKFLOW_AUDIT.md`
- Code Changes: Look at file dates/Git history

**Status:** ✅ Ready for Production

