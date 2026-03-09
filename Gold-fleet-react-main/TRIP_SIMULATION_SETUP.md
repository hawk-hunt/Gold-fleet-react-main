# Trip Simulation System - Complete Setup Guide

## Overview

This document provides complete instructions for implementing and running the trip simulation system for your Laravel + React fleet management application.

The system allows:
- **Companies** to create trips with GPS coordinates
- **Drivers** to approve and start simulations
- **Real-time vehicle movement** along defined routes
- **Live dashboard views** with animated markers on maps
- **Simulation script** that automates vehicle position updates

---

## Architecture

### Components

1. **Laravel Backend**
   - Database migrations for `trips`, `trip_simulations`, and `vehicle_locations` coordination
   - `TripSimulation` Eloquent model for tracking simulation state
   - `TripSimulationController` with API endpoints
   - 8 new API routes for simulation operations

2. **React Frontend**
   - `CompanyDashboardSimulation.jsx` - Shows all active trips on map
   - `DriverDashboardSimulation.jsx` - Shows driver's assigned trip
   - `tripSimulationService.js` - API communication layer

3. **Node.js Simulator**
   - `simulator.js` - Standalone script that runs vehicle simulations
   - Updates locations every 3 seconds via API
   - Uses Haversine formula for accurate distance calculations
   - Handles multiple concurrent trips

---

## Implementation Steps

### Step 1: Run Laravel Migrations

```bash
# Navigate to backend directory
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main\backend

# Run migrations to create new tables
php artisan migrate

# Expected output:
# Migrating: 2026_03_09_add_coordinates_to_trips_table
# Migrated:  2026_03_09_add_coordinates_to_trips_table (0.xx s)
# Migrating: 2026_03_09_create_trip_simulations_table
# Migrated:  2026_03_09_create_trip_simulations_table (0.xx s)
```

**What was created:**
- `trips` table updated with columns:
  - `origin_lat`, `origin_lng` - Starting point GPS coordinates
  - `destination_lat`, `destination_lng` - Ending point GPS coordinates
- `trip_simulations` table with:
  - `trip_id` - Foreign key to trips
  - `is_active` - Boolean for simulation status
  - `current_lat`, `current_lng` - Real-time position
  - `segment_index`, `progress_percentage` - Route progress
  - `speed_kmh`, `heading` - Simulation metrics
  - `started_at`, `completed_at` - Timing info

### Step 2: Verify Files Were Created

Check that these files exist:

**Backend:**
```
backend/app/Models/TripSimulation.php
backend/app/Http/Controllers/TripSimulationController.php
backend/database/migrations/2026_03_09_add_coordinates_to_trips_table.php
backend/database/migrations/2026_03_09_create_trip_simulations_table.php
```

**Frontend:**
```
frontend/src/components/CompanyDashboardSimulation.jsx
frontend/src/components/DriverDashboardSimulation.jsx
frontend/src/services/tripSimulationService.js
```

**Simulator:**
```
backend/simulator.js
```

### Step 3: Clear Backend Cache

```bash
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main\backend

php artisan config:clear
php artisan cache:clear
php artisan route:cache
php artisan view:cache
```

### Step 4: Start the Laravel Backend Server

In a new terminal:

```bash
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main\backend
php artisan serve --host 0.0.0.0 --port 8000
```

**Expected output:**
```
Laravel development server started: http://0.0.0.0:8000
```

### Step 5: Start the React Frontend

In another new terminal:

```bash
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main\frontend
npm run dev -- --host 0.0.0.0
```

**Expected output:**
```
  VITE v... dev server running at:
  ➜  Local:   http://localhost:5173/
```

### Step 6: Get Your Auth Token

Login to your application and get your authentication token from the browser:

```javascript
// In browser console
const token = sessionStorage.getItem('auth_token');
console.log(token);
```

Copy this token - you'll need it for the simulator.

### Step 7: Start the Simulator Script

In a third terminal:

```bash
cd c:\wamp64\www\Gold-fleet-react-main\Gold-fleet-react-main\backend

# Start simulator with your auth token
node simulator.js
```

**Or on Windows PowerShell with environment variables:**

```powershell
$env:API_URL = "http://localhost:8000/api"
$env:AUTH_TOKEN = "your-token-here"
$env:UPDATE_INTERVAL = "3000"  # 3 seconds
$env:SPEED_KMH = "60"
$env:CHECK_INTERVAL = "30000"  # 30 seconds
node simulator.js
```

**Expected output:**
```
🚀 Trip Simulator Started
=========================
API Base URL: http://localhost:8000/api
Update Interval: 3000ms
Simulation Speed: 60 km/h
Check New Trips: Every 30000ms
=========================

🔍 Checking for new trips every 30000ms
📍 Simulation updates every 3000ms
```

---

## API Routes Reference

### Base URL
```
http://localhost:8000/api
```

All routes require authentication via `Authorization: Bearer {token}` header.

### 1. Create a New Trip (Company)
```
POST /trips-simulation
```

**Request Payload:**
```json
{
  "vehicle_id": 1,
  "driver_id": 1,
  "origin_lat": 9.0765,
  "origin_lng": 7.3986,
  "destination_lat": 9.1450,
  "destination_lng": 7.4500,
  "start_time": "2026-03-09 14:30:00",
  "notes": "Regular delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "trip": {
    "id": 1,
    "vehicle_id": 1,
    "driver_id": 1,
    "status": "pending",
    "origin": {
      "latitude": 9.0765,
      "longitude": 7.3986,
      "name": "..."
    },
    "destination": {
      "latitude": 9.1450,
      "longitude": 7.4500,
      "name": "..."
    },
    "vehicle": { "id": 1, "name": "Vehicle A", "license_plate": "ABC-123" },
    "driver": { "id": 1, "name": "John Doe" },
    "start_time": "2026-03-09T14:30:00.000000Z",
    "created_at": "2026-03-09T...",
    "updated_at": "2026-03-09T..."
  }
}
```

### 2. Approve Trip & Start Simulation (Driver)
```
POST /trips/{tripId}/approve
```

**Request Payload:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip approved and simulation started",
  "trip": { ... },
  "simulation": {
    "id": 1,
    "trip_id": 1,
    "is_active": true,
    "current_lat": 9.0765,
    "current_lng": 7.3986,
    "segment_index": 0,
    "progress_percentage": 0,
    "speed_kmh": 60,
    "heading": 45,
    "started_at": "2026-03-09T14:30:00.000000Z"
  }
}
```

### 3. Update Vehicle Location (Simulator Script)
```
POST /vehicle/location
```

**Request Payload:**
```json
{
  "vehicle_id": 1,
  "lat": 9.0850,
  "lng": 7.4050,
  "speed": 60,
  "heading": 45.3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "location": {
    "id": 1,
    "vehicle_id": 1,
    "latitude": 9.0850,
    "longitude": 7.4050,
    "speed": 60,
    "heading": 45.3,
    "recorded_at": "2026-03-09T14:30:45.000000Z"
  }
}
```

### 4. Get Trip Locations & History
```
GET /trips/{tripId}/locations
```

**Response:**
```json
{
  "success": true,
  "trip": { ... },
  "locations": [
    {
      "id": 1,
      "vehicle_id": 1,
      "latitude": 9.0765,
      "longitude": 7.3986,
      "speed": 0,
      "heading": 0,
      "recorded_at": "2026-03-09T14:30:00.000000Z"
    },
    { ... }
  ],
  "simulation": { ... },
  "route": {
    "origin": { "latitude": 9.0765, "longitude": 7.3986 },
    "destination": { "latitude": 9.1450, "longitude": 7.4500 }
  }
}
```

### 5. Get Simulation Status
```
GET /trips/{tripId}/simulation
```

**Response:**
```json
{
  "success": true,
  "simulation": { ... },
  "is_running": true,
  "position": {
    "latitude": 9.0850,
    "longitude": 7.4050,
    "speed": 60,
    "heading": 45,
    "progress": 25.5
  }
}
```

### 6. Stop Simulation
```
POST /trips/{tripId}/simulation/stop
```

**Request Payload:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation stopped and trip completed",
  "trip": { ... with status: "completed" },
  "simulation": { ... with is_active: false }
}
```

### 7. Get All Active Trips (Company Dashboard)
```
GET /trips-simulation/company/active
```

**Response:**
```json
{
  "success": true,
  "trips": [ ... ],
  "pagination": {
    "total": 45,
    "per_page": 20,
    "current_page": 1,
    "last_page": 3
  }
}
```

### 8. Get Driver's Assigned Trip
```
GET /driver/trip
```

**Response:**
```json
{
  "success": true,
  "trip": { ... },
  "simulation": { ... }
}
```

---

## Using React Components

### Company Dashboard (Shows All Active Trips)

```jsx
import CompanyDashboardSimulation from './components/CompanyDashboardSimulation';

function CompanyDashboard() {
  return <CompanyDashboardSimulation />;
}
```

**Features:**
- Live map showing all trips
- Filter by status (pending, approved, active, completed)
- Real-time marker animations
- Trip details table with progress bars
- Auto-refresh at configurable intervals (3s, 5s, 10s)

### Driver Dashboard (Shows Assigned Trip)

```jsx
import DriverDashboardSimulation from './components/DriverDashboardSimulation';

function DriverDashboard() {
  return <DriverDashboardSimulation />;
}
```

**Features:**
- Live map with driver's current position
- Route visualization (origin to destination)
- Approve button to start simulation
- Progress percentage display
- Trip details sidebar
- Stop/Complete button when active

---

## Complete Workflow Example

### 1. Company Creates a Trip

```bash
curl -X POST http://localhost:8000/api/trips-simulation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 1,
    "origin_lat": 9.0765,
    "origin_lng": 7.3986,
    "destination_lat": 9.1450,
    "destination_lng": 7.4500,
    "start_time": "2026-03-09 14:30:00"
  }'
```

**Response:**
```json
{
  "success": true,
  "trip": { "id": 42, "status": "pending", ... }
}
```

### 2. Driver Approves the Trip

```bash
curl -X POST http://localhost:8000/api/trips/42/approve \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": true,
  "trip": { "id": 42, "status": "approved", ... },
  "simulation": { "id": 1, "is_active": true, ... }
}
```

### 3. Simulator Runs Automatically

The `simulator.js` script:
1. Queries for active simulations every 30 seconds
2. Finds trip #42 with active simulation
3. Every 3 seconds, updates vehicle location:
   - Calculates progress along route
   - Interpolates coordinates
   - Sends POST to `/vehicle/location`

### 4. Company Dashboard Updates in Real-Time

The map shows:
- Trip #42 marker moving along route
- Progress bar updating (0% → 100%)
- Speed and heading displayed
- Status changes: pending → approved → active → completed

### 5. Driver Sees Movement on Their Dashboard

The driver's map shows:
- Their current position moving in real-time
- Route line from origin to destination
- Progress percentage
- Can click "Stop & Complete Trip" when done

---

## Troubleshooting

### Error: "Backend may be unavailable"

**Cause:** Laravel server not running or API URL is wrong.

**Solution:**
```bash
# Check if server is running on port 8000
curl http://localhost:8000/api/driver/trip

# If not running, start it:
cd backend
php artisan serve --host 0.0.0.0 --port 8000
```

### Error: "Network error" in React

**Cause:** React frontend can't reach Laravel backend.

**Solution:**
1. Make sure Laravel is running on http://localhost:8000
2. Check browser console for actual error
3. Verify CORS if running on different domains

### Error: "Authentication failed" in Simulator

**Cause:** Invalid or missing AUTH_TOKEN.

**Solution:**
```bash
# Get your token from browser
# sessionStorage.getItem('auth_token')

# Set it in simulator
$env:AUTH_TOKEN = "your-token-here"
node simulator.js
```

### Simulator shows "Failed to fetch trips"

**Cause:** User company not approved, or API URL wrong.

**Solution:**
1. Verify your company is approved in the database
2. Check API_URL in simulator.js or via environment variable
3. Check that auth token belongs to a staff member who can see trips

### Map not displaying in React

**Cause:** Leaflet CSS or API issue.

**Solution:**
```bash
# Make sure leaflet is installed
cd frontend
npm install react-leaflet leaflet

# Restart React dev server
npm run dev
```

### Trips not showing on Company Dashboard

**Cause:** No active trips exist, or trips don't have GPS coordinates.

**Solution:**
```bash
# Check database
php artisan tinker
>>> App\Models\Trip::with('simulation')->where('status', 'approved')->get();

# Create test trip with coordinates
>>> \App\Models\Trip::create([
  'company_id' => 1,
  'vehicle_id' => 1,
  'driver_id' => 1,
  'status' => 'pending',
  'origin_lat' => 9.0765,
  'origin_lng' => 7.3986,
  'destination_lat' => 9.1450,
  'destination_lng' => 7.4500,
  'start_mileage' => 0
]);
```

---

## Environment Variables

For the simulator script, you can set:

```bash
# API configuration
API_URL="http://localhost:8000/api"
AUTH_TOKEN="your-token-here"

# Simulation behavior
UPDATE_INTERVAL="3000"  # milliseconds (3-5 recommended)
SPEED_KMH="60"          # simulated speed
CHECK_INTERVAL="30000"  # check for new trips every 30s
```

Usage:
```powershell
$env:API_URL = "http://localhost:8000/api"
$env:AUTH_TOKEN = "xyz"
node simulator.js
```

---

## Performance Notes

- **Smooth animations:** Update interval 3-5 seconds works best
- **Map performance:** 20+ markers may be slow; use status filter
- **Database:** Indexes on `trip_id` and `is_active` improve query speed
- **Real-time:** React polls every 3-5 seconds for active simulations
- **Simulator:** Runs in single Node.js process, can handle 50+ concurrent trips

---

## Extending the System

### Custom Route Polylines

Currently uses linear interpolation between origin and destination. To use actual roads:

```javascript
// In simulator.js - replace interpolatePosition
async function getPolylineRoute(lat1, lng1, lat2, lng2) {
  // Use Google Maps Routes API or OpenRouteService
  const response = await fetch(`https://api.example.com/routes?...`);
  return await response.json();
}
```

### Custom Speeds per Vehicle Type

```javascript
// In TripSimulation model
public function getSimulationSpeed(): float {
  return match($this->trip->vehicle->type) {
    'truck' => 50,
    'van' => 60,
    'motorcycle' => 80,
    default => 60
  };
}
```

### Historical Playback

```jsx
// Replay trip movements at different speeds
function ReplayTrip({ tripId, speed = 1 }) {
  // Fetch all locations, sort by recorded_at
  // Play them back at configurable speed
}
```

---

## Testing

### Manual API Testing

```bash
# Create trip
POST /api/trips-simulation

# Approve trip
POST /api/trips/1/approve

# Update location (simulator does this)
POST /api/vehicle/location

# Get all locations
GET /api/trips/1/locations

# Get simulation status
GET /api/trips/1/simulation

# Stop simulation
POST /api/trips/1/simulation/stop
```

### Unit Tests

```php
// tests/Feature/TripSimulationTest.php
public function test_can_create_trip_with_coordinates() {
  $response = $this->post('/api/trips-simulation', [
    'vehicle_id' => 1,
    'driver_id' => 1,
    'origin_lat' => 9.0765,
    'origin_lng' => 7.3986,
    'destination_lat' => 9.1450,
    'destination_lng' => 7.4500,
  ]);
  
  $this->assertTrue($response->json('success'));
}
```

---

## Support

For issues or questions:

1. Check **Troubleshooting** section above
2. Enable debug logging: `php artisan env:modify APP_DEBUG=true`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check browser console for React errors
5. Use browser Network tab to inspect API responses

---

## Summary

You now have a complete trip simulation system:

✅ Database tables for trips, coordinates, and simulations  
✅ Laravel API endpoints for all operations  
✅ React components for company and driver dashboards  
✅ Node.js simulator that runs vehicle movements automatically  
✅ Real-time map updates with Leaflet  
✅ Progress tracking and metrics  

To verify it's working:

1. Database: `php artisan migrate`
2. Backend: `php artisan serve --host 0.0.0.0 --port 8000`
3. Frontend: `npm run dev -- --host 0.0.0.0`
4. Simulator: `node simulator.js`
5. Create a trip via API or UI
6. Driver approves it
7. Simulator starts moving vehicle
8. See it move on maps in real-time ✨
