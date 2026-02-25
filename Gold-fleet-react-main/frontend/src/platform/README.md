# Platform Owner Panel - Complete Setup Guide

## Overview

This is a **completely isolated SaaS Platform Owner Control Panel** for the Gold Fleet application. It operates independently from the main tenant dashboard and is NOT a tenant admin interface.

## Key Features

✅ **Completely Isolated** - No modifications to main routes, auth, or controllers  
✅ **Separate Authentication** - Uses `platformToken` instead of `authToken`  
✅ **Independent Routes** - All routes under `/platform/*`  
✅ **Full Dashboard** - SaaS metrics, charts, and business analytics  
✅ **Company Management** - View and manage all tenant companies  
✅ **Subscription Tracking** - Monitor all active subscriptions and revenue  
✅ **Analytics & Reporting** - Comprehensive SaaS business metrics  
✅ **Messaging System** - Communicate with all companies  
✅ **Settings Management** - Configure platform-level settings  

## Architecture

### Folder Structure

```
src/platform/
├── pages/                          # Platform Pages
│   ├── PlatformLogin.jsx          # Platform-only login
│   ├── PlatformDashboard.jsx      # SaaS dashboard
│   ├── PlatformAnalytics.jsx      # Business analytics
│   ├── PlatformCompanies.jsx      # Company management
│   ├── PlatformSubscriptions.jsx  # Subscription tracking
│   ├── PlatformMessages.jsx       # Messaging system
│   └── PlatformSettings.jsx       # Platform settings
├── components/                     # Reusable components
├── layout/                         # Layout components
│   ├── PlatformLayout.jsx         # Main layout wrapper
│   ├── PlatformHeader.jsx         # Top navigation
│   └── PlatformSidebar.jsx        # Side navigation
├── routes/                         # Routing & Protection
│   ├── PlatformRouter.jsx         # All /platform/* routes
│   └── PlatformProtectedRoute.jsx # Auth guard (checks platformToken)
└── services/                       # API Integration
    └── platformApi.js             # All /api/platform/* calls
```

### Route Structure

All platform routes use the `/platform/*` namespace:

```
/platform/login              → PlatformLogin (public)
/platform/dashboard          → PlatformDashboard (protected)
/platform/analytics          → PlatformAnalytics (protected)
/platform/companies          → PlatformCompanies (protected)
/platform/subscriptions      → PlatformSubscriptions (protected)
/platform/messages           → PlatformMessages (protected)
/platform/settings           → PlatformSettings (protected)
```

## Authentication System

### Platform Login

```javascript
// POST /api/platform/login
{
  "email": "platform@gold-fleet.com",
  "password": "secure_password"
}
```

Response stores token in `sessionStorage.platformToken` (NOT `authToken`)

### Protected Routes

All platform pages are wrapped with `PlatformProtectedRoute` which:
- ✅ Checks ONLY for `platformToken`
- ✅ Redirects to `/platform/login` if missing
- ✅ Does NOT use main AuthContext
- ✅ Completely independent from tenant auth

## API Integration

### Platform API Base

All platform API calls use `/api/platform/*` endpoints:

```javascript
const API_BASE_URL = 'http://localhost:8000/api/platform';

platformApi.login(email, password)
platformApi.getDashboardStats()
platformApi.getCompanies(page, limit)
platformApi.getSubscriptions(page, limit)
platformApi.getMessages(page, limit)
platformApi.getSettings()
```

### Key Endpoints

```
POST   /api/platform/login
GET    /api/platform/dashboard/stats
GET    /api/platform/companies
GET    /api/platform/companies/count
GET    /api/platform/subscriptions
GET    /api/platform/subscriptions/active
GET    /api/platform/vehicles/count
GET    /api/platform/trips/today
GET    /api/platform/analytics/company-growth
GET    /api/platform/analytics/trips-per-company
GET    /api/platform/analytics/vehicle-usage
GET    /api/platform/analytics/subscription-revenue
GET    /api/platform/messages
POST   /api/platform/messages
GET    /api/platform/settings
PUT    /api/platform/settings
```

## Frontend Structure

### App.jsx Integration

```jsx
import PlatformRouter from './platform/routes/PlatformRouter';

// Inside AppRoutes:
<Route path="/*" element={<PlatformRouter />} />
```

This is appended WITHOUT modifying existing routes.

### PlatformRouter.jsx

```jsx
<Routes>
  {/* Public */}
  <Route path="/platform/login" element={<PlatformLogin />} />

  {/* Protected */}
  <Route path="/platform/*" element={
    <PlatformProtectedRoute>
      <PlatformLayout>
        <Routes>
          <Route path="/dashboard" element={<PlatformDashboard />} />
          <Route path="/analytics" element={<PlatformAnalytics />} />
          {/* ... more routes */}
        </Routes>
      </PlatformLayout>
    </PlatformProtectedRoute>
  } />
</Routes>
```

### PlatformLayout

Similar to main Layout but completely independent:
- Own header with platform-specific search and profile menu
- Own sidebar with platform navigation items
- Responsive design matching main dashboard style
- Separate color scheme (slate/yellow theme)

## Backend Requirements

The backend Laravel application must implement these endpoints:

### Authentication

```php
POST /api/platform/login
- Input: email, password
- Output: token, user data
```

### Dashboard Stats

```php
GET /api/platform/dashboard/stats
- Returns: stats object with counts and metrics
```

### Company Management

```php
GET /api/platform/companies
GET /api/platform/companies/count
- Returns: paginated companies or count
```

### Subscriptions

```php
GET /api/platform/subscriptions
GET /api/platform/subscriptions/active
- Returns: subscription data
```

### Analytics

```php
GET /api/platform/analytics/company-growth
GET /api/platform/analytics/trips-per-company
GET /api/platform/analytics/vehicle-usage
GET /api/platform/analytics/subscription-revenue
- Returns: chart data for Recharts
```

### Messages & Settings

```php
GET /api/platform/messages
POST /api/platform/messages
GET /api/platform/settings
PUT /api/platform/settings
```

## Safety Guarantees

### ✅ What This Platform Panel Does NOT Do

- ❌ Does NOT modify existing `/main` routes
- ❌ Does NOT modify Dashboard.jsx
- ❌ Does NOT modify auth middleware
- ❌ Does NOT modify ProtectedRoute.jsx
- ❌ Does NOT modify existing codebase
- ❌ Does NOT touch backend tenant controllers
- ❌ Does NOT rename any existing admin files
- ❌ Does NOT affect tenant login or public pages
- ❌ Does NOT redirect main dashboard
- ❌ Uses completely separate authentication system
- ❌ Uses completely separate token storage
- ❌ Uses completely separate routes namespace

### ✅ What Can Coexist

- Tenant login at `/login` or `/auth`
- Tenant dashboard at `/main`
- All tenant management pages (`/vehicles`, `/drivers`, etc.)
- Platform owner login at `/platform/login`
- Platform dashboard at `/platform/dashboard`
- All other pages remain unaffected

## Styling & Design

### Color Scheme

- **Primary**: Yellow/Amber (gold accents)
- **Background**: Slate-900 with gradients
- **Borders**: Slate-700 with yellow highlights on active
- **Text**: Slate-100 to Slate-400

### Components

- **Cards**: Gradient background with border design
- **Charts**: Recharts with custom tooltip styling
- **Tables**: Hover effects with alternating backgrounds
- **Forms**: Glass-morphism style inputs
- **Buttons**: Yellow gradient with slate text

## Data Models

### Dashboard Stats Example

```json
{
  "stats": {
    "totalCompanies": 24,
    "activeCompanies": 18,
    "totalVehicles": 156,
    "tripsToday": 42,
    "activeSubscriptions": 18,
    "monthlyRevenue": "$48,500"
  },
  "charts": {
    "growth": [
      { "month": "Jan", "companies": 12, "revenue": 8400 },
      { "month": "Feb", "companies": 18, "revenue": 12300 }
    ]
  }
}
```

## Usage Examples

### Access Platform Login

```
http://localhost:5173/platform/login
```

### Access Platform Dashboard (When Authenticated)

```
http://localhost:5173/platform/dashboard
```

### Check Existing Tenant Dashboard

```
http://localhost:5173/main
```

Both are completely independent and don't interfere with each other.

## Testing

### Test Platform Login

1. Navigate to `/platform/login`
2. Enter platform credentials
3. Token stored in `sessionStorage.platformToken`
4. Redirected to `/platform/dashboard`

### Test Protected Routes

1. Clear `platformToken` from sessionStorage
2. Try accessing `/platform/companies`
3. Should redirect to `/platform/login`

### Verify Main Dashboard Still Works

1. Login as tenant at `/login`
2. Main dashboard at `/main` should work normally
3. Platform panel doesn't interfere

## Customization

### Add New Platform Page

1. Create component in `src/platform/pages/`
2. Add route in `PlatformRouter.jsx`
3. Add navigation item in `PlatformSidebar.jsx`
4. Create API methods in `platformApi.js` if needed

### Example: New Analytics Page

```jsx
// src/platform/pages/PlatformReports.jsx
export default function PlatformReports() {
  // Component code
}

// Update PlatformRouter.jsx
<Route path="/reports" element={<PlatformReports />} />

// Update PlatformSidebar.jsx - add to navigationItems
{ label: 'Reports', path: '/platform/reports', icon: FaFileAlt }
```

### Modify API Endpoints

All API calls are centralized in `platformApi.js`. Update:

```javascript
// Add new endpoint
getPlatformReports: async () => {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: platformApi.getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
}
```

## Troubleshooting

### Issue: Can't access /platform/login

**Solution**: Ensure `/platform/login` is public in PlatformRouter.jsx

### Issue: Token not persisting

**Solution**: Check that `platformApi.login()` stores in `sessionStorage.platformToken`

### Issue: Platform pages redirect to login

**Solution**: Verify `platformToken` exists in sessionStorage after login

### Issue: Platform routes conflict with main routes

**Solution**: Main routes end before wildcard `/*` in App.jsx, so platform router catches them

## Production Deployment

### Environment Variables

```env
VITE_API_BASE_URL=https://api.gold-fleet.com
VITE_PLATFORM_BASE=https://gold-fleet.com/platform
```

### Security Checklist

- ✅ Platform token NOT stored in localStorage (sessionStorage only)
- ✅ All API calls require platformToken in headers
- ✅ Platform routes protected by PlatformProtectedRoute
- ✅ No sensitive data in frontend code
- ✅ Backend validates platform ownership

## Support

For issues or questions about the Platform Owner Panel, refer to:
1. This documentation
2. Component files (well-commented)
3. API service file `platformApi.js`
4. Backend API documentation

---

**Platform Owner Panel Created Successfully** ✅
