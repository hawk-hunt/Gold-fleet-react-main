# Driver Login Seeder Guide

## Overview
The `DriverLoginSeeder` creates test driver accounts with assigned vehicles for testing driver portal login functionality.

## What It Creates
- **5 test drivers** with complete profiles
- **3 test vehicles** (auto-assigned to drivers)
- Ready-to-use login credentials for each driver

## Test Driver Credentials

| Email | Password | Name |
|-------|----------|------|
| james.osei@fleet.com | Driver123 | James Osei |
| mary.mensah@fleet.com | Driver123 | Mary Mensah |
| paul.adjei@fleet.com | Driver123 | Paul Adjei |
| grace.boateng@fleet.com | Driver123 | Grace Boateng |
| samuel.gyamfi@fleet.com | Driver123 | Samuel Gyamfi |

## How to Use

### Option 1: Run Standalone (Recommended)
Run only the driver login seeder without affecting existing data:

```bash
php artisan db:seed --class=DriverLoginSeeder
```

### Option 2: Include in Fresh Migration
To include it in fresh migration with comprehensive data:

1. Edit `database/seeders/DatabaseSeeder.php`:
   ```php
   public function run(): void
   {
       $this->call([
           ComprehensiveDummySeeder::class,
           DriverLoginSeeder::class,  // Uncomment this line
       ]);
   }
   ```

2. Run migration:
   ```bash
   php artisan migrate:fresh --seed
   ```

### Option 3: Fresh Database with Only Drivers
If you want a clean database with only driver test accounts:

```bash
php artisan migrate:fresh
php artisan db:seed --class=DriverLoginSeeder
```

## Test Vehicle Assignments
Each driver is automatically assigned a test vehicle:
- **Vehicle 1**: Toyota Hiace Van
- **Vehicle 2**: Mercedes Sprinter Van  
- **Vehicle 3**: TATA Prima Truck

## Features Created
- ✓ User accounts with driver role
- ✓ Driver profiles with license information
- ✓ License expiry dates (3 years from now)
- ✓ Active status drivers
- ✓ Phone numbers for each driver
- ✓ API tokens for authentication
- ✓ Email verification (pre-verified)

## Notes
- All drivers use the same password: `Driver123`
- Each driver is assigned to the same company as the admin (clark@gmail.com)
- Drivers are marked as "active" by default
- License numbers are in format: DL001001, DL001002, etc.
- Seeder uses `firstOrCreate()` to prevent duplicates on re-runs
