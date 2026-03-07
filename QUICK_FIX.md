# Quick Fix: 5-Minute Solution

## The Problem
You're getting: **"The selected plan id is invalid"** when trying to sign up

## The Solution (2 Command Steps)

### Step 1: Seed the Database
Open PowerShell and run:

```powershell
cd c:\wamp64\www\Gold-fleet-react-main\backend
php artisan db:seed --force
```

**What this does**: Creates the 3 plan options (Starter, Professional, Enterprise) in your database

### Step 2: Make Sure Backend is Running
Open another PowerShell window and run:

```powershell
cd c:\wamp64\www\Gold-fleet-react-main\backend
php artisan serve
```

**What this does**: Starts the Laravel development server on http://localhost:8000

### Step 3: Test Signup
1. Go to http://localhost:5173 (or :5174 if 5173 is taken)
2. Click "Sign Up"
3. You should now see 3 plans to choose from ✅
4. Select one, fill in the form, submit
5. You should be taken to Step 3: Payment Simulation page ✅

## If It Still Doesn't Work

Run this diagnostic command in PowerShell:

```powershell
cd c:\wamp64\www\Gold-fleet-react-main
.\diagnose-complete.ps1
```

This will check:
- ✅ Backend is running
- ✅ Plans exist in database
- ✅ API returns plans correctly
- ✅ Database connection works

The output will tell you exactly what's wrong.

## Verify Plans Were Created

Open PowerShell:

```powershell
cd c:\wamp64\www\Gold-fleet-react-main\backend
php artisan tinker
Plan::all();
```

You should see:
```
[
  {id: 1, name: "Starter", price: 0},
  {id: 2, name: "Professional", price: 49.99},
  {id: 3, name: "Enterprise", price: 199.99}
]
```

If you don't see this, the plans weren't created. Run the seeder again.

---

**That's it!** The issue should be resolved. If not, run the diagnostic script and share the output.
