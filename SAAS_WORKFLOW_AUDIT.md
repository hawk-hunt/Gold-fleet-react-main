# SaaS Workflow Audit Report

**Date:** March 8, 2026  
**Status:** CRITICAL ISSUES IDENTIFIED  
**Priority:** Fix before production deployment  

---

## EXECUTIVE SUMMARY

The system has both companies, subscriptions, and payments modules, but they are **not properly connected**. Currently:

- ✅ Companies can be registered and appear in admin lists
- ✅ Subscription records are created
- ✅ Payments can be created and verified
- ❌ **Payment verification does NOT activate subscriptions**
- ❌ **Subscription activation does NOT properly update company status**
- ❌ **Company status fields are redundant and not synced**
- ❌ **Admin pages show stale data due to missing sync logic**

The core issue: **Data flows one direction (down) but modules need bi-directional communication.**

---

## DETAILED FINDINGS

### Issue 1: Payment Verification Breaks the Workflow

**Current Behavior:**
```php
PaymentVerificationService::verifyPayment()
├─ Updates payment_status = 'verified'
├─ Calculates earnings split
├─ Approves company (sets company_status = 'approved')
└─ ❌ DOES NOT activate the subscription
```

**Expected Behavior:**
```
Payment Verified
├─ Update payment_status = 'verified'
├─ Activate subscription (subscription_status = 'active')
├─ Update company flags (company_status = 'active', subscription_status = 'active')
└─ Send notifications to company admins
```

**Impact:**
- Company approved but subscription inactive = platform access denied
- Company dashboard still locked despite payment verified
- User sees confusing status messages

---

### Issue 2: Company Status Fields Are Redundant

**Problem:** 
The `companies` table has these conflicting status fields:
- `status` - legacy field (active, inactive, suspended)
- `is_active` - legacy boolean
- `company_status` - new field (registered, pending_approval, approved, declined)
- `subscription_status` - should mirror subscriptions.status, but doesn't

**Database Structure:**
```
companies table:
├─ id
├─ name
├─ status (legacy)
├─ is_active (legacy boolean)
├─ company_status (registered|pending_approval|approved|declined)
├─ subscription_status (none|active|expired) ← SHOULD BE DERIVED
├─ approved_at
├─ approved_by
└─ relationships:
   ├─ subscriptions (HasMany)
   └─ paymentSimulations (HasMany)

subscriptions table:
├─ id
├─ company_id (FK)
├─ plan_id (FK)
├─ status (pending|active|suspended|cancelled)
├─ started_at
├─ trial_ends_at
└─ expires_at

payment_simulations table:
├─ id
├─ company_id (FK)
├─ subscription_id (FK)
├─ payment_status (pending|verified|refunded)
└─ ...earnings fields
```

**Data Sync Issue:**
- When subscription.status changes → companies.subscription_status NOT updated
- Admin page shows old subscription_status
- Frontend thinks company has inactive subscription

---

### Issue 3: Module Responsibilities Unclear

**Current (Broken):**
- PaymentVerificationService only approves company
- SubscriptionManagementController activates subscription but maybe doesn't update company
- PlatformDashboardController has company approval methods
- Nobody is source-of-truth for "is company active"

**Expected (SaaS Pattern):**
```
COMPANIES MODULE:
├─ Responsibility: Manage tenant accounts
├─ Can Do: Create, suspend, activate, delete companies
├─ Status: company_status (registered|suspended|active|deleted)
├─ Can NOT: Touch subscriptions or payments

SUBSCRIPTIONS MODULE:
├─ Responsibility: Manage billing plans
├─ Can Do: Activate, suspend, reactivate, cancel subscriptions
├─ Status: subscription_status (pending|active|suspended|cancelled)
├─ When Status Changes: Update company's subscription_status mirror
├─ Can NOT: Approve companies directly

PAYMENTS MODULE:
├─ Responsibility: Track financial transactions
├─ Can Do: Verify, refund payments
├─ When Payment Verified:
│  ├─ Update payment_status = 'verified'
│  ├─ Trigger subscription activation
│  └─ Trigger company activation (via subscription)
├─ Can NOT: Directly modify companies or subscriptions (only trigger activation)
```

---

### Issue 4: Missing Two-Way Data Flow

**Current (One-Way Only):**
```
Company Registration → Subscription Creation → Payment Simulation
                     ↓ (down only)
                  (no feedback)
```

**Required (Bi-Directional):**
```
Company Registration
    ↓
Subscription Creation → Payment Simulation
    ↓                           ↓
Company updates ← ← ← ← ← Payment Verification
(subscription_status)
    ↓
Admin sees correct status in list
    ↓
Company can access platform
```

---

### Issue 5: Specific Code Problems

#### Problem 5A: PaymentVerificationService.verifyPayment()

**File:** `backend/app/Services/PaymentVerificationService.php`

**Current Code (Lines 28-86):**
```php
public function verifyPayment(PaymentSimulation $payment): array
{
    // ... calculate earnings ...
    
    $payment->update([
        'payment_status' => 'verified',  // ✓ CORRECT
        // ... earnings fields ...
    ]);
    
    // Approve company
    if ($company && $company->company_status !== 'approved') {
        $this->approveCompanyAfterPayment($company);  // ✓ CORRECT
    }
    
    // ❌ MISSING: Activate subscription!
    // Should call something like:
    // $subscription->status = 'active'; $subscription->save();
    // $company->subscription_status = 'active'; $company->save();
}
```

**Missing Steps:**
1. ❌ Subscription activation (status → active)
2. ❌ Company subscription_status sync (should be 'active')
3. ❌ No checks for payment-subscription relationship

---

#### Problem 5B: SubscriptionManagementController.activate()

**File:** `backend/app/Http/Controllers/Api/SubscriptionManagementController.php` (Lines 65-107)

**Current Code:**
```php
public function activate($id)
{
    $subscription->update(['status' => 'active']);
    
    // Also update company
    $subscription->company->update([
        'subscription_status' => 'active',
        'is_active' => true,
    ]);
    
    return response()->json([...]);
}
```

**Issue:** This works BUT it's not triggered by payment verification!

---

#### Problem 5C: PlatformDashboardController.getCompanies()

**File:** `backend/app/Http/Controllers/Api/PlatformDashboardController.php`

**Current:** Returns data with subscriptions fully loaded
**Issue:** subscription_status in response comes from companies table (not subscriptions table)
**Result:** Shows stale data if subscription.status differs from company.subscription_status

---

### Issue 6: Frontend Data Consistency

**File:** `frontend/src/platform/pages/PlatformCompanies.jsx`

**Display Fields:**
```javascript
const columns = [
  'Name',
  'Email',
  'Status',                    // ← from company_status
  'Subscription',              // ← from company.subscription_status (STALE!)
  'Payment',                   // ← from company.payment_status
  'Plan',
  'Vehicles',
  'Drivers',
  'Actions'
];
```

**Problem:**
- Shows `company.subscription_status` (companies table)
- Doesn't show `subscription.status` (subscriptions table)
- These differ when payment is verified but subscription not activated
- Result: Admin sees "Subscription: pending" when subscription is actually "active"

---

## ROOT CAUSE ANALYSIS

### Why Payment Verification Doesn't Activate Subscriptions?

1. **PaymentVerificationService only knew about companies**
   - origin: Built piecemeal without full SaaS workflow understanding
   - It approves the company but has no knowledge that it should also activate a subscription

2. **No orchestration layer**
   - Each module works independently
   - No central coordinator saying "after payment verified, do X then Y then Z"
   - No domain events or workflow engine

3. **Subscription table not part of payment flow**
   - PaymentSimulation has FK to subscription
   - But verifyPayment() never touches subscription table
   - It only touches company table

### Why Does Admin See Wrong Status?

1. **Multiple source-of-truth problem**
   - Subscription status lives in subscriptions.status
   - Company also has subscription_status (copy/mirror)
   - When subscription.status changes, copy is not updated
   - Admin UI queries companies table instead of joining to subscriptions table

---

## REQUIRED FIXES (In Priority Order)

### Fix 1: Activate Subscription When Payment Verified
- **File:** PaymentVerificationService
- **Change:** After marking payment as verified, activate the subscription
- **Impact:** Subscription becomes active when payment verified ✓

### Fix 2: Sync Company Subscription Status
- **File:** SubscriptionManagementController methods
- **Change:** When subscription status changes, update companies.subscription_status
- **Impact:** company.subscription_status always matches subscription.status ✓

### Fix 3: Fix Admin Data Queries
- **File:** PlatformDashboardController.getCompanies()
- **Change:** Join to subscriptions table for real-time subscription_status
- **Impact:** Admin sees correct subscription status in list ✓

### Fix 4: Implement Company Status Derivation
- **File:** Company model
- **Change:** Add method to get company_status from subscriptions
- **Impact:** company_status is always derived from business rules ✓

### Fix 5: Fix Frontend Data Display
- **File:** PlatformCompanies.jsx, PaymentManagement.jsx, PlatformSubscriptions.jsx
- **Change:** Use subscription.status instead of company.subscription_status where appropriate
- **Impact:** Frontend shows real-time data ✓

---

## VERIFICATION CHECKLIST

After fixes, verify:

- [ ] Company registers → subscription created → payment created
- [ ] Admin verifies payment → subscription auto-activated
- [ ] Admin sees "active" subscription in Companies list after verification
- [ ] Company can access platform immediately after payment verified
- [ ] Suspending subscription deactivates company
- [ ] Reactivating subscription reactivates company
- [ ] Admin list shows real-time data (no stale status)
- [ ] All three modules (companies/subscriptions/payments) work independently
- [ ] No breaking changes to existing APIs
- [ ] No breaking changes to database

---

## IMPLEMENTATION PLAN

1. **PaymentVerificationService** - Activate subscription in verifyPayment()
2. **SubscriptionManagementController** - Ensure all status changes update company
3. **PlatformDashboardController** - Fix query to show real subscription status
4. **Frontend** - Update components to pull fresh data
5. **Test** - End-to-end SaaS workflow verification
6. **Documentation** - Update module responsibilities

---

## STATUS

**Phase:** Implementation Ready  
**Complexity:** Medium  
**Risk:** Low (no breaking changes if done right)  
**Estimated Time:** 2-3 hours

