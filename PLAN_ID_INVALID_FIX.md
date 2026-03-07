# Fix Plan ID Invalid Error - Complete Guide

## Problem
Getting error: `The selected plan id is invalid` when trying to create subscription after signup

## Root Cause
The plan ID being sent (1, 2, or 3) doesn't exist in the database, OR the database seeder wasn't run.

## Solution

### Step 1: Ensure Database is Properly Seeded

```powershell
# Navigate to the project
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main

# Navigate to backend folder
cd backend

# Run the database seeder to create plans
php artisan db:seed --force
```

**What this does:**
- Creates 3 plans in the database:
  - ID 1: Starter (Free, 12-day trial)
  - ID 2: Professional ($49.99/month)
  - ID 3: Enterprise ($199.99/month)

### Step 2: Verify Plans Exist in Database

```powershell
# Open Laravel Tinker interactive shell
php artisan tinker

# Check all plans
>>> Plan::all();

# If you see output with id, name, price - SUCCESS ✅
# If no output - plans weren't created, run seeder again
```

Expected output:
```
[
  {id: 1, name: "Starter", price: 0.00, status: "active"},
  {id: 2, name: "Professional", price: 49.99, status: "active"},
  {id: 3, name: "Enterprise", price: 199.99, status: "active"}
]
```

### Step 3: Verify API Returns Plans

```powershell
# Test the plans endpoint
curl -X GET http://localhost:8000/api/plans -H "Accept: application/json"
```

Expected response (should be an array of plans):
```json
[
  {
    "id": 1,
    "name": "Starter",
    "price": 0,
    "trial_days": 12,
    "status": "active"
  },
  ...
]
```

### Step 4: Check Browser Console During Signup

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up
4. Look for these logs:
   ```
   ✅ API Plans Response: [...]
   📦 Plans from API (array): [...]
   🎯 Using plans from API: [...]
   📋 Creating subscription with plan: {company_id: 1, plan_id: 1, ...}
   ```

5. If you see `plan_id: 1` and it still fails, check the error response which will show:
   ```json
   {
     "debug": {
       "plans_in_database": [
         {"id": 1, "name": "Starter", ...},
         {"id": 2, "name": "Professional", ...}
       ]
     }
   }
   ```

### Step 5: Full Diagnostic Check

Run the diagnostic script to check everything:

```powershell
cd c:\wamp64\www\Gold-fleet-react-main

# Run the comprehensive diagnostic
.\diagnose-plans.ps1
```

This will:
1. Check if API is running
2. Fetch plans from API
3. Run the seeder
4. Verify plans in database
5. Check API again

## Common Issues & Fixes

### Issue: "API is not running"
**Fix:**
```powershell
cd backend
php artisan serve
```

### Issue: No plans appear after seeding
**Fix:**
```powershell
# Check if migrations ran
php artisan migrate:status

# If migrations aren't complete, run them
php artisan migrate

# Then seed
php artisan db:seed --force
```

### Issue: Cache interfering
**Fix:**
```powershell
php artisan cache:clear
php artisan config:clear
```

## Step-by-Step Signup Test

Once plans are verified:

1. **Open Browser** → http://localhost:5173 or http://localhost:5174
2. **Click "Sign Up"**
3. **Select a Plan** (you should see Starter, Professional, Enterprise)
4. **Fill Form**:
   - Name: Test User
   - Email: test@example.com (must be unique)
   - Password: TestPass123
   - Company: Test Corp
   - Company Email: testcorp@example.com (must be unique)
5. **Click "Create Account"**
6. **Expected**: Step 3 Payment Simulation page appears ✅

## What to Check If Still Failing

### Check 1: Browser Console
Open DevTools (F12) → Console tab during signup. Look for:
- `❌ Subscription creation failed:` message
- The plan_id value being sent
- API response with debug info

### Check 2: API Response
In the error message, you'll see debug info like:
```
plans_in_database:
- { id: 1, name: "Starter", status: "active" }
- { id: 2, name: "Professional", status: "active" }
- { id: 3, name: "Enterprise", status: "active" }
```

If you see plans with different IDs, update your expectations.

### Check 3: Database
```powershell
# Check if plans table exists and has data
php artisan tinker
>>> DB::table('plans')->count(); // Should return 3
>>> DB::table('plans')->get(); // Should show all plans
```

## Success Indicators

✅ All 3 steps show in signup flow  
✅ Browser console shows `📦 Plans from API (array): [...]`  
✅ After "Create Account", Step 3 Payment page appears  
✅ Can add, edit, delete payment simulations  

## Final Reset (Nuclear Option)

If nothing works:

```powershell
cd backend

# Fresh database
php artisan migrate:fresh

# Seed everything
php artisan db:seed

# Clear cache
php artisan cache:clear && php artisan config:clear

# Restart server
php artisan serve
```

Then test signup again.

---

**Note**: The fix has been implemented. The error responses now include a `debug` object that shows exactly which plans are in the database, making it easy to diagnose the issue.
