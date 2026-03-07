# Payment Simulation System - Implementation Guide

## Overview

A comprehensive payment simulation CRUD system has been implemented for Gold Fleet's signup process. This system allows users during signup to simulate their payment based on their selected plan and resource usage (vehicles, drivers, users).

## Features

### 1. Plan-Based Limitations
- Each plan has specific limits:
  - **Starter** (Free for 12 days): 5 vehicles, 5 drivers, 2 users
  - **Professional** ($49.99/month): 50 vehicles, 50 drivers, 10 users
  - **Enterprise** ($199.99/month): Unlimited resources
- Payment simulation prevents users from simulating beyond plan limits

### 2. Trial Period Management
- Free plans automatically expire after 12 days
- Trial end date is calculated from subscription creation date
- After trial expires, account is automatically deactivated
- Users are notified before trial expiration

### 3. Payment Simulation CRUD
Users can create, read, update, and delete payment simulations with the following details:
- **Simulated Resources:**
  - Number of vehicles to simulate
  - Number of drivers to simulate
  - Number of users to simulate
- **Payment Details:**
  - Simulated amount ($)
  - Payment method (Credit Card, Bank Transfer, Check, Other)
  - Payment date
  - Due date (optional)
  - Notes

## File Structure

### Backend Files

#### Database Migrations
- `database/migrations/2026_03_07_000001_create_payment_simulations_table.php`
  - Creates payment_simulations table with all necessary fields
  - Includes foreign keys to companies and subscriptions tables
  
- `database/migrations/2026_03_07_000002_add_is_active_to_companies_table.php`
  - Adds is_active boolean field to companies table
  - Used to track account activation status

#### Models
- `app/Models/PaymentSimulation.php`
  - Relationships: company(), subscription()
  - Methods: exceedsLimits(), getLimitErrors()
  - Full CRUD functionality
  
- `app/Models/Subscription.php` (Updated)
  - Added paymentSimulations() relationship
  - Tracks trial and subscription expiration

- `app/Models/Company.php` (Updated)
  - Added is_active to fillable array
  - Added subscriptions() relationship
  - Added PaymentSimulation relationship

- `app/Models/Plan.php` (Existing)
  - max_vehicles, max_drivers, max_users fields

#### Controllers
- `app/Http/Controllers/PaymentSimulationController.php`
  - Full CRUD operations with authorization checks
  - Validates resource limits based on plan
  - Methods:
    - index() - List all payment simulations for company
    - store() - Create new payment simulation
    - show() - Get single payment simulation
    - update() - Update payment simulation
    - destroy() - Delete payment simulation
    - getBySubscription() - Get simulations for specific subscription
    - processPayment() - Mark payment as completed

#### API Routes
Routes registered in `routes/api.php`:
```php
Route::apiResource('payment-simulations', PaymentSimulationController::class);
Route::get('/payment-simulations/subscription/{subscriptionId}', [PaymentSimulationController::class, 'getBySubscription']);
Route::post('/payment-simulations/{id}/process', [PaymentSimulationController::class, 'processPayment']);
```

#### Console Commands
- `app/Console/Commands/DeactivateExpiredAccounts.php`
  - Runs scheduled deactivation of accounts with expired trials/subscriptions
  - Sets subscription status to 'expired'
  - Sets company is_active to false
  - Usage: `php artisan accounts:deactivate-expired`

### Frontend Files

#### React Components
- `src/components/PaymentSimulation.jsx`
  - Full CRUD UI for payment simulations
  - Plan limits displayed in form
  - Real-time validation against plan limits
  - Payment status indicators (pending, completed, failed)
  - Edit/Delete/Process payment buttons

#### Pages
- `src/pages/AuthPage.jsx` (Updated)
  - Added Step 3: Payment Simulation
  - New signup flow: Plan Selection → Profile Form → Payment Simulation
  - Integrates PaymentSimulation component
  - Creates subscription before showing payment simulation step

#### API Service
- `src/services/api.js` (Updated)
  - Added payment simulation methods:
    - getPaymentSimulations()
    - getPaymentSimulation(id)
    - createPaymentSimulation(data)
    - updatePaymentSimulation(id, data)
    - deletePaymentSimulation(id)
    - getPaymentSimulationsBySubscription(subscriptionId)
    - processPaymentSimulation(id, data)

## Signup Flow

1. **Step 1: Plan Selection**
   - User selects from Starter, Professional, or Enterprise plan
   - Plan details and limits are displayed

2. **Step 2: Complete Your Profile**
   - User Account Information (name, email, password)
   - Company Details (company name, email, phone, address)
   - Subscription is created after form submission

3. **Step 3: Payment Simulation** (NEW)
   - Plan limits are displayed
   - User simulates resource usage (vehicles, drivers, users)
   - User selects payment method and amount
   - Simulation can be edited or deleted
   - Payment can be marked as processed/completed

4. **Completion**
   - Account created and ready to use
   - User receives verification email
   - Trial period starts immediately

## Account Deactivation

### How It Works
- **Free Trial Plans**: Automatically deactivated after 12 days
- **Paid Plans**: Deactivated when subscription expires_at date is reached
- Command runs as scheduled job: `php artisan accounts:deactivate-expired`

### What Happens When Deactivated
1. Company is_active flag set to false
2. Subscription status changed to 'expired'
3. Users cannot log in or access fleet data
4. All API requests return 401 Unauthorized

### Scheduling (Optional)
To run deactivation automatically, add to `bootstrap/app.php`:
```php
->withSchedule(function (Schedule $schedule) {
    $schedule->command('accounts:deactivate-expired')
        ->daily()
        ->at('00:00'); // Run daily at midnight
})
```

## Validation and Error Handling

### Plan Limit Validation
- Simulated vehicles cannot exceed plan max_vehicles
- Simulated drivers cannot exceed plan max_drivers
- Simulated users cannot exceed plan max_users
- Error messages display specific limits and current values

### Authorization
- Only authenticated users can access payment simulations
- Users can only access their own company's simulations
- Admin role required for some operations

## Testing

### Manual Testing
1. Create new account via signup page
2. Select a plan
3. Complete profile information
4. In payment simulation step:
   - Try adding resources within limits → Should succeed
   - Try adding resources beyond limits → Should show error
   - Create multiple simulations
   - Edit existing simulation
   - Delete simulation
   - Process payment (mark as completed)

### Database Testing
```bash
# Check payment simulations
php artisan tinker
PaymentSimulation::all();

# Check deactivation
php artisan accounts:deactivate-expired
```

## API Endpoints

### Create Payment Simulation
```http
POST /api/payment-simulations
Authorization: Bearer {token}
Content-Type: application/json

{
  "subscription_id": 1,
  "simulated_vehicles": 3,
  "simulated_drivers": 2,
  "simulated_users": 1,
  "simulated_amount": 49.99,
  "payment_method": "credit_card",
  "payment_date": "2026-03-07",
  "due_date": "2026-04-07",
  "notes": "Test payment simulation"
}
```

### Get Payment Simulations by Subscription
```http
GET /api/payment-simulations/subscription/{subscriptionId}
Authorization: Bearer {token}
```

### Process Payment
```http
POST /api/payment-simulations/{id}/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_method": "credit_card",
  "payment_date": "2026-03-07"
}
```

## Future Enhancements

1. **Automatic Plan Upgrades**: Allow users to upgrade plan when reaching limits
2. **Resource Overages Tracking**: Track when usage exceeds plan limits
3. **Email Notifications**: Send emails for trial expiration warnings
4. **Billing Integration**: Connect to payment gateways for actual payments
5. **Usage Analytics**: Track actual vs. simulated usage
6. **Custom Plans**: Allow admins to create custom tier plans
7. **Payment History**: Detailed payment transaction history
8. **Auto-Renewal**: Automatic subscription renewal on card
