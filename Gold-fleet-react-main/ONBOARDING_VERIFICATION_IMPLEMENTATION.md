# Secure Onboarding & Subscription Flow Implementation

## Overview

A complete **hybrid verification system** has been implemented across your GoldFleet platform. The system now supports:

1. **Automatic Account Verification** - Users are automatically verified upon registration
2. **Manual Company Approval** - Super admin must approve companies before full feature access
3. **Restricted Mode Dashboard** - Companies pending approval get a restricted dashboard
4. **Approval Notifications** - Users receive notifications and messages when approved

---

## System Architecture

### Three-Step Onboarding Flow

1. **Step 1: Choose Plan** - User selects pricing plan (session/state stored)
2. **Step 2: Register Company** - User creates account with company details
3. **Step 3: Payment** - User completes payment simulation

### Status Transitions

```
Step 1: Register
├── account_status = verified          (automatic)
├── company_status = pending           (initial)
└── subscription_status = none         (no subscription yet)

Step 3: Payment Complete
├── subscription_status = active       (payment successful)
├── company_status = pending_approval  (awaiting admin review)
└── User redirected to dashboard
    └── Dashboard shows restricted mode banner
    
Admin Approval
├── company_status = approved
├── approved_at = timestamp
├── approved_by = admin_user_id
├── System sends notifications & messages
└── User gets full feature access
```

---

## Database Changes

### Companies Table
New columns added:
- `account_status` - verified/unverified
- `company_status` - pending/pending_approval/approved/rejected
- `subscription_status` - none/active/expired/trial
- `approved_at` - timestamp when approved
- `approved_by` - user_id of approving admin

### Users Table
New column added:
- `account_status` - verified/unverified

### Migrations Created
1. `2026_03_08_add_verification_columns_to_companies_table.php`
2. `2026_03_08_add_account_status_to_users_table.php`

---

## Backend Implementation

### Models

#### Company Model (`app/Models/Company.php`)
**New Methods:**
- `isAccountVerified()` - Check if account is verified
- `isApproved()` - Check if company is admin-approved
- `hasActiveSubscription()` - Check subscription status
- `hasFullAccess()` - All three conditions met
- `approveCompany(User $approver)` - Approve company
- `rejectCompany(User $rejector)` - Reject company

**New Relationship:**
- `approvedByUser()` - Get the admin who approved

#### User Model (`app/Models/User.php`)
**New Methods:**
- `isAccountVerified()` - Check account verification
- `canAccessDashboard()` - Check if user can access dashboard

**New Relationship:**
- `approvalsGiven()` - Get approvals made by this user (super admin)

### Controllers

#### CompanyApprovalController (`app/Http/Controllers/Api/CompanyApprovalController.php`)
**Endpoints:**
- `GET /api/platform/company-approvals` - Get pending approvals
- `GET /api/platform/company-approvals/{id}` - Get company details
- `POST /api/platform/company-approvals/{id}/approve` - Approve company
- `POST /api/platform/company-approvals/{id}/reject` - Reject company
- `GET /api/platform/company-approvals/status/{status}` - Get by status

**Features:**
- Automatic notification/message creation on approval
- Rejection with optional reason message
- Super admin only access

#### Updated AuthController (`app/Http/Controllers/Api/AuthController.php`)
**Changes:**
- Registration sets `account_status = 'verified'` automatically
- Registration sets company `company_status = 'pending'`
- Login and user endpoints return company status info
- All responses include verification and approval statuses

#### Updated SubscriptionController (`app/Http/Controllers/SubscriptionController.php`)
**Changes:**
- On subscription creation:
  - Updates `subscription_status = 'active'`
  - Updates `company_status = 'pending_approval'`
  - Returns company status in response

### Middleware

#### DashboardAccessControl (`app/Http/Middleware/DashboardAccessControl.php`)
Validates:
- User is authenticated
- User account is verified
- User belongs to a company
- Company has active subscription
- Stores company status in request

#### CompanyApprovedAccess (`app/Http/Middleware/CompanyApprovedAccess.php`)
Validates:
- User is authenticated
- User has a company
- Company is approved
- Rejects access if company not approved

### Routes

Added to `routes/api.php` under platform group (protected):
```php
Route::get('/company-approvals', [CompanyApprovalController::class, 'getPendingApprovals']);
Route::get('/company-approvals/{id}', [CompanyApprovalController::class, 'showForApproval']);
Route::post('/company-approvals/{id}/approve', [CompanyApprovalController::class, 'approveCompany']);
Route::post('/company-approvals/{id}/reject', [CompanyApprovalController::class, 'rejectCompany']);
Route::get('/company-approvals/status/{status}', [CompanyApprovalController::class, 'getCompaniesByStatus']);
```

---

## Frontend Implementation

### AuthContext Updates (`src/context/AuthContext.jsx`)
**Changes:**
- Added `company` state alongside `user`
- All auth methods return and store company data
- Company status info accessible throughout app

**API Responses Now Include:**
```javascript
{
  user: { id, name, email, account_status, ... },
  company: { 
    id, 
    name, 
    account_status, 
    company_status, 
    subscription_status 
  }
}
```

### New Components

#### ApprovalBanner (`src/components/ApprovalBanner.jsx`)
Shows when `company_status = 'pending_approval'` and `subscription_status = 'active'`
- Displays yellow warning banner
- Lists available features:
  - ✓ Notifications, Messages, Billing, Profile
- Lists restricted features:
  - 🔒 Vehicles, Drivers, Tracking, Reports
- Shows "Approval usually takes up to 24 hours"

#### RestrictedFeatureOverlay (`src/components/RestrictedFeatureOverlay.jsx`)
Wraps components/sections to show lock overlay
- Grays out content (opacity-50)
- Shows lock icon with message
- Prevents interaction

### Custom Hook

#### useCompanyApprovalStatus (`src/hooks/useCompanyApprovalStatus.js`)
Returns:
- `isCompanyApproved` - boolean
- `isPendingApproval` - boolean
- `canAccessRestrictedFeatures` - boolean (approved + active subscription)
- `companyStatus` - current status string
- `subscriptionStatus` - current subscription status

### Dashboard Updates (`src/pages/Dashboard.jsx`)
**Changes:**
- Imports ApprovalBanner and hook
- Displays approval banner below header
- Restricts access to:
  - Total Vehicles card
  - Total Drivers card
  - Total Trips card
  - Map-related features
  - Reports features
- Shows lock icon overlays when restricted
- Prevents navigation to restricted sections

---

## API Response Examples

### After Registration
```json
{
  "success": true,
  "message": "Registration successful.",
  "token": "...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "account_status": "verified"
  },
  "company": {
    "id": 1,
    "name": "GoldFleet Co",
    "account_status": "verified",
    "company_status": "pending",
    "subscription_status": "none"
  }
}
```

### After Payment
```json
{
  "message": "Subscription created successfully",
  "subscription": { ... },
  "company": {
    "id": 1,
    "name": "GoldFleet Co",
    "subscription_status": "active",
    "company_status": "pending_approval"
  }
}
```

### Get User (Dashboard)
```json
{
  "success": true,
  "user": { ... },
  "company": {
    "id": 1,
    "company_status": "pending_approval",
    "subscription_status": "active"
  }
}
```

### Admin Approval
```json
{
  "success": true,
  "message": "Company approved successfully",
  "data": {
    "id": 1,
    "company_status": "approved",
    "approved_at": "2026-03-08T10:30:00Z",
    "approved_by": 1
  }
}
```

---

## Testing Workflow

### 1. Register Company
```bash
POST /api/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "company_name": "Test Company",
  "company_email": "company@example.com",
  "company_phone": "1234567890"
}
```
Expected: account_status = verified, company_status = pending

### 2. Create Subscription
```bash
POST /api/subscriptions
{
  "company_id": 1,
  "plan_id": 1,
  "payment_data": { ... }
}
```
Expected: company_status = pending_approval, subscription_status = active

### 3. Check Dashboard (Restricted)
- Should show ApprovalBanner
- Vehicles/Drivers/Trips cards have lock overlays
- Navigation blocked for restricted features

### 4. Admin Approves Company
```bash
POST /api/platform/company-approvals/1/approve
```
Expected: 
- company_status = approved
- Notifications sent to company users
- Messages created

### 5. Check Dashboard (Full Access)
- ApprovalBanner disappears
- All cards accessible
- All features unlocked

---

## Security Implementation

###Access Control Hierarchy
```
1. Authentication Check
   ↓
2. Account Verification Check (account_status = verified)
   ↓
3. Company Assignment Check (user.company_id exists)
   ↓
4. Subscription Check (subscription_status = active)
   ↓
5. Approval Check (company_status = approved) [For restricted features]
```

### Restricted Features
Vehicles, Drivers, Trips, Services, Inspections, Issues, Expenses, Fuel Fillups, Reports, and Fleet Management tools require:
- ✓ account_status = verified
- ✓ subscription_status = active
- ✓ company_status = approved

### Allowed Before Approval
- Notifications
- Messages
-Profile
- Billing

---

## Key Files Modified

### Backend
- `app/Models/Company.php` - Added status methods
- `app/Models/User.php` - Added verification methods
- `app/Http/Controllers/Api/AuthController.php` - Status flow
- `app/Http/Controllers/SubscriptionController.php` - Status updates
- `routes/api.php` - Added approval routes

### Frontend
- `src/context/AuthContext.jsx` - Company state
- `src/pages/Dashboard.jsx` - Restricted mode
- `src/components/ApprovalBanner.jsx` - New banner
- `src/components/RestrictedFeatureOverlay.jsx` - New overlay
- `src/hooks/useCompanyApprovalStatus.js` - New hook

### Database
- `database/migrations/2026_03_08_add_verification_columns_to_companies_table.php`
- `database/migrations/2026_03_08_add_account_status_to_users_table.php`

---

## No Breaking Changes

✓ Existing API routes unchanged
✓ Existing database relations preserved
✓ Existing components work as-is
✓ Existing URLs not modified
✓ Backward compatible timestamps
✓ Existing authentication flow extended, not replaced

---

## Future Enhancements

1. **Email notifications** for approval status
2. **Approval timeline dashboard** for admins
3. **Company verification documents**
4. **Automated approval based on criteria**
5. **Approval expiration** (re-verification needed)
6. **Detailed rejection reasons** in UI
7. **Audit trail** for all approvals

---

## Support & Troubleshooting

### Company Status Still Pending After Payment?
- Check `companies.subscription_status` = 'active'
- Check `companies.company_status` = 'pending_approval'
- Verify admin hasn't rejected company

### Dashboard Features Locked?
- Verify `company.company_status` = 'approved'
- Check banner is showing (expected for pending approval)
- Verify login and refresh

### Notifications Not Received?
- Check `notifications` table for records
- Verify company users have `role = 'admin'`
- Check `messages` table for message records

---

**Implementation Date:** March 8, 2026  
**Status:** COMPLETE AND TESTED
