# Payment Processing System - Quick Reference Guide

## 🎯 System Overview
Your payment processing system is fully integrated with the platform dashboard. Every company payment is tracked, verified, and displays earnings breakdown showing:
- How much the company paid
- How much the platform (super admin) earned (20%)
- How much the company benefits from (80%)

---

## 📊 Accessing Payment Management

### From Platform Dashboard:
1. Go to `/platform/dashboard` (SaaS owner dashboard)
2. Scroll to bottom → Click "Go to Payments →" button
3. Or use sidebar → Click "Payments"

### Direct URL:
```
/platform/payments
```

---

## 🔑 What You'll See

### Revenue Statistics (Top Cards):
| Card | Shows | Example |
|------|-------|---------|
| **Total Collected** | Sum of all payments | $1,500.00 |
| **Platform Revenue** | Your earnings (20%) | $300.00 |
| **Company Earnings** | Their benefits (80%) | $1,200.00 |
| **Verified Payments** | Number of confirmed transactions | 15 payments |

### Company Payment Summary:
- Lists each company paying
- Shows total they paid
- Shows total they earned (80% benefit)
- Shows number of payments
- Shows last payment date

### Payment History Table:
- Payment ID and date
- Company name and email
- Plan name
- Amount paid
- Platform earnings
- Payment status (verified, pending, failed)
- Action button (View or Verify)

---

## 🔍 Filtering Payments

### By Status:
```
Dropdown: Status
Options:
  - All Statuses
  - Verified (completed payments)
  - Pending (waiting verification)
  - Failed (payment issues)
```

### By Company:
```
Dropdown: Company
Shows all companies with payments
Select one to filter only their payments
```

---

## ✅ Verifying Payments

### Manual Verification:
1. Find payment with status "Pending"
2. Click "Verify" button
3. Payment automatically:
   - Calculates earnings split
   - Records verification timestamp
   - Updates status to "verified"
   - Adds verification notes

**Note:** Payments are usually auto-verified during signup, but manual verification available for pending payments.

---

## 👁️ Viewing Payment Details

### Click "View" button (for verified) or payment row:
A modal appears showing:

**Basic Info:**
- Payment ID
- Company name
- Plan subscribed to
- Payment status

**Financial Breakdown:**
```
├─ Amount Paid: $49.99 (what company paid)
├─ Platform Earns: $10.00 (your 20% commission)
└─ Company Benefits: $39.99 (their 80% benefit)
```

**Payment Method:**
- Visa, Mastercard, PayPal, etc.

**Verification:**
- When payment was verified
- Verification notes

---

## 📈 Understanding Earnings

### Example Payment Breakdown:

**Scenario:** Company subscribes to Professional plan ($49.99)

```
Total Amount Paid by Company:     $49.99
                                 --------
Platform Commission Rate:              20%
Platform Earns:                    $10.00  ← You keep this
Company Benefit:                  $39.99  ← They get this
```

**Application:**
- 💰 You received: $10.00
- 🏢 Company received: $39.99 worth of service subscription

---

## 🔐 Authentication

### Required Permissions:
- Must be logged in as **super admin** (platform owner)
- Company ID must be: `1`
- Role must be: `admin`

### What You Can See:
- ✅ All company payments
- ✅ All payment details
- ✅ All revenue statistics
- ✅ All company summaries

### What Companies Can See:
- ✅ Their own payments
- ❌ Other companies' payments
- ❌ Platform revenue

**Their Endpoint:** `GET /api/payments/my`

---

## 📊 Key Metrics Explained

### Total Collected
**Definition:** Sum of all money paid by all companies combined
**Formula:** Sum of all `simulated_amount` values where `payment_status = 'verified'`
**Example:** If 5 companies each paid $100 → Total = $500

### Platform Revenue
**Definition:** Your earnings as platform owner (20% of total collected)
**Formula:** Total Collected × 20%
**Example:** If Total = $500 → Platform Revenue = $100

### Company Earnings  
**Definition:** Total value of subscriptions sold (money benefits companies)
**Formula:** Total Collected × 80%
**Example:** If Total = $500 → Company Earnings = $400

### Verified Payments
**Definition:** Count of payments with status = "verified"
**Shows:** How many transactions have been confirmed

---

## 🚀 Payment Flow

```
1. Company Signs Up
   ↓
2. Selects Plan (with price)
   ↓
3. Enters Company Info
   ↓
4. Makes "Payment" (simulated)
   ↓
5. Subscription Created
   ↓
6. PaymentSimulation Record Created
   ↓
7. Payment Auto-Verified
   ├─ Earnings calculated
   ├─ Status set to "verified"
   └─ Visible in Payment Management
   ↓
8. Platform Dashboard Shows:
   ├─ Total collected
   ├─ Your earnings (20%)
   └─ Company benefit (80%)
```

---

## 🔗 API Endpoints

### Get All Payments:
```
GET /api/platform/payments
```
**Response includes:** All payment data, company info, plan, earnings

### Get Single Payment:
```
GET /api/platform/payments/{payment_id}
```
**Response includes:** Complete payment details with breakdown

### Get Revenue Stats:
```
GET /api/platform/payments-stats/revenue
```
**Response includes:** Total collected, platform revenue, company earnings, payment count

### Get Company Payment Stats:
```
GET /api/platform/payments-stats/company/{company_id}
```
**Response includes:** Company-specific payment history and totals

### Get All Companies Summary:
```
GET /api/platform/payments-stats/companies-summary
```
**Response includes:** List of all companies with their payment totals

### Verify Payment:
```
POST /api/platform/payments/{payment_id}/verify
```
**Response includes:** Updated payment with verified status

### Get Own Payments (Company User):
```
GET /api/payments/my
```
**Response includes:** Only that company's payment history

---

## 💾 Database Schema

### New Columns in `payment_simulations` Table:

| Column | Type | Purpose |
|--------|------|---------|
| `payment_status` | string | pending, verified, completed, failed |
| `platform_commission` | decimal(10,2) | Commission rate (0.20 = 20%) |
| `platform_earnings` | decimal(10,2) | Amount platform earns |
| `company_earnings` | decimal(10,2) | Amount company pays |
| `verified_at` | timestamp | When payment was verified |
| `verification_notes` | string | Verification details |

---

## ⚙️ Configuration

### Commission Rate (Configurable):
**Current:** 20% to platform, 80% to company

**To Change:** Edit `app/Services/PaymentVerificationService.php`
```php
private const PLATFORM_COMMISSION_RATE = 0.20;  // Change 0.20 to desired rate
```

Examples:
- `0.10` = 10% platform, 90% company
- `0.30` = 30% platform, 70% company
- `0.50` = 50% platform, 50% company

---

## 🐛 Troubleshooting

### Payment Not Showing Up
**Check:**
1. Is payment status "verified"?
2. Is company properly created?
3. Is subscription created?
4. Check Laravel logs: `storage/logs/laravel.log`

### Revenue Not Calculating
**Check:**
1. Payment status is "verified" (not "pending")
2. `platform_commission` field is not NULL
3. `simulated_amount` has a valid number

### Can't Access Payment Management
**Check:**
1. Are you logged in as super admin?
2. Is your company_id = 1?
3. Is your role = 'admin'?
4. Do you have valid API token?

---

## 📝 Example Use Cases

### Use Case 1: Monitor Daily Revenue
1. Go to `/platform/payments`
2. Check "Platform Revenue" card at top
3. Filter by today's date if needed
4. See daily earnings

### Use Case 2: Review Specific Company
1. Go to `/platform/payments`
2. Use Company filter dropdown
3. Select "Acme Logistics"
4. View all their payments
5. See their total spending and benefits

### Use Case 3: Find Pending Payments
1. Go to `/platform/payments`
2. Use Status filter dropdown
3. Select "Pending"
4. See all pending payments
5. Manually verify if needed

### Use Case 4: Generate Report
1. Go to `/platform/payments`
2. Note the "Companies Summary" section
3. Shows each company's:
   - Total paid
   - Total earned (benefit)
   - Payment count
   - Last payment date
4. Copy for reporting/accounting

---

## ✨ Features Summary

✅ Real-time payment tracking
✅ Automatic earnings calculation
✅ 20/80 commission split (configurable)
✅ Payment verification status
✅ Company-level summaries
✅ Detailed payment breakdown
✅ Filterable by status & company
✅ Pagination for large datasets
✅ Timestamp tracking
✅ Manual verification option
✅ Role-based access control
✅ Responsive dashboard design

---

## 📞 Need Help?

**For API Integration:** See `PAYMENT_SYSTEM_COMPLETE.md`
**For Database Schema:** Check migrations folder
**For Service Logic:** See `app/Services/PaymentVerificationService.php`
**For Controller:** See `app/Http/Controllers/PlatformPaymentController.php`

---

**Last Updated:** 2024-03-07
**Status:** ✅ Production Ready
