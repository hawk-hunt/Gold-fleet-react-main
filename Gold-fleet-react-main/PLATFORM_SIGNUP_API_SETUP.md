# Platform Admin Signup API Setup Guide

## ✅ What Was Done

### 1. **Created Platform Auth Controller**
- **File**: `backend/app/Http/Controllers/Api/PlatformAuthController.php`
- **Features**:
  - Platform login endpoint
  - Platform signup endpoint (creates admin user + company)
  - User retrieval
  - Logout functionality

### 2. **Updated Routes**
- **File**: `backend/routes/api.php`
- **Routes Added**:
  - `POST /api/platform/login` - Login for platform admins
  - `POST /api/platform/signup` - Register new platform admin with company details
  - `GET /api/platform/user` - Get authenticated user (protected)
  - `POST /api/platform/logout` - Logout (protected)

### 3. **Created Database Migration**
- **File**: `backend/database/migrations/2026_02_24_add_company_details_to_companies_table.php`
- **Columns Added to `companies` table**:
  - `city` (nullable string)
  - `state` (nullable string)
  - `zip` (nullable string)
  - `country` (nullable string)
  - `industry` (nullable string)
  - `fleet_size` (integer, default 0)
  - `num_employees` (integer, default 0)
  - `subscription_plan` (string, default 'basic')
  - `subscription_status` (string, default 'active')

### 4. **Updated Models**
- **File**: `backend/app/Models/Company.php`
  - Updated `$fillable` array with all new fields
- **File**: `backend/app/Models/User.php`
  - Already supports 'role' field including 'platform_admin'

## 🚀 Next Steps - Run These Commands

### Step 1: Install Dependencies (if not already done)
```bash
cd backend
composer install
```

### Step 2: Run Database Migrations
```bash
php artisan migrate
```

This will create the new columns in the `companies` table.

### Step 3: Clear Cache (optional but recommended)
```bash
php artisan cache:clear
php artisan config:clear
```

### Step 4: Start the Backend Server
```bash
php artisan serve
```

This will start the Laravel server at `http://localhost:8000`

### Step 5: Start the Frontend Server (in another terminal)
```bash
cd frontend
npm run dev
```

## ✨ How It Works

### Registration Flow:
1. User fills out signup form at `/platform/signup`
2. Frontend sends data to `POST /api/platform/signup`
3. Backend:
   - Validates all fields
   - Creates a new `Company` record with all details
   - Creates a new `User` with role `platform_admin`
   - Generates authentication token
   - Returns token and user data
4. Frontend stores token in `sessionStorage` as `platformToken`
5. User is redirected to `/platform/dashboard`

### Form Fields Collected:

**Admin Information:**
- Full Name
- Email Address
- Password
- Confirm Password

**Company Information (CRUD):**
- Company Name
- Company Email
- Company Phone
- Street Address
- City
- State/Province
- ZIP/Postal Code
- Country
- Industry
- Fleet Size (vehicles)
- Number of Employees
- Subscription Plan (Basic/Pro/Enterprise)

## 🔐 Security Features

✅ Passwords hashed with bcrypt  
✅ Email verification set to current timestamp (auto-verified for platform admins)  
✅ Token-based authentication using Laravel Sanctum  
✅ Transaction-based database writes (rollback on error)  
✅ Input validation on both frontend and backend  
✅ Unique email and company name constraints  

## 📝 Example API Request

```bash
POST http://localhost:8000/api/platform/signup
Content-Type: application/json

{
  "admin_name": "John Doe",
  "admin_email": "john@example.com",
  "admin_password": "SecurePassword123",
  "admin_password_confirm": "SecurePassword123",
  "company_name": "Acme Fleet Logistics",
  "company_email": "fleet@acme.com",
  "company_phone": "+1-555-0123",
  "company_address": "123 Business Ave",
  "company_city": "New York",
  "company_state": "NY",
  "company_zip": "10001",
  "company_country": "United States",
  "company_industry": "logistics",
  "fleet_size": 50,
  "num_employees": 25,
  "subscription_plan": "pro"
}
```

## ✅ Expected Response

```json
{
  "message": "Platform admin account created successfully",
  "token": "your_auth_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "platform_admin",
    "company_id": 1,
    "email_verified_at": "2026-02-24T..."
  },
  "company": {
    "id": 1,
    "name": "Acme Fleet Logistics",
    "email": "fleet@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business Ave",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "United States",
    "industry": "logistics",
    "fleet_size": 50,
    "num_employees": 25,
    "subscription_plan": "pro",
    "subscription_status": "active"
  }
}
```

## 🐛 Troubleshooting

### Error: "SQLSTATE[42S22]: Column not found"
**Solution**: Run migrations: `php artisan migrate`

### Error: "Unique constraint violated"
**Solution**: Email or company name already exists. Use a different email/company name.

### Error: "Invalid credentials"
**Solution**: Make sure email matches a platform_admin user or use signup endpoint.

### Error: "CORS issues"
**Solution**: Make sure CORS is configured in `config/cors.php` (should already be set)

## 📚 Related Files

- Frontend Signup Component: `frontend/src/platform/pages/PlatformSignup.jsx`
- Frontend API Service: `frontend/src/platform/services/platformApi.js`
- Platform Router: `frontend/src/platform/routes/PlatformRouter.jsx`
- Platform Dashboard: `frontend/src/platform/pages/PlatformDashboard.jsx`

---

That's it! The platform admin signup is now fully connected to the database. 🎉
