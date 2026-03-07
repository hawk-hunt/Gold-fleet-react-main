# Vehicle Problem Detection System - Implementation Guide

## Quick Start Guide

This guide will help you get the Vehicle Problem Detection System up and running.

## Prerequisites

- Laravel 11.x backend running on `http://localhost:8000`
- React frontend properly configured
- Database migrations executed
- Authenticated users with valid API tokens

## Installation Steps

### Step 1: Run Database Migrations

Navigate to the backend directory and run the new migrations:

```bash
cd backend
php artisan migrate
```

This will create:
- `inspection_items` table - stores individual inspection checklist items
- `issue_attachments` table - stores uploaded photos/files for issues

### Step 2: Verify Components Are in Place

Check that these files exist in your frontend:

```
frontend/src/components/
  ├── VehicleInspectionChecklist.jsx
  └── ManualIssueReport.jsx

frontend/src/pages/
  └── DriverDashboard.jsx (updated)

frontend/src/services/
  └── api.js (updated)
```

### Step 3: Update your Backend Configuration

Ensure your Laravel filesystem is properly configured for image storage:

```php
// config/filesystems.php
'disks' => [
    'public' => [
        'driver' => 'local',
        'path' => 'public',
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
],
```

### Step 4: Create Storage Directories

```bash
cd backend
mkdir -p storage/app/public/issues
chmod -R 755 storage/app/public
php artisan storage:link
```

### Step 5: Test the System

1. Start the Laravel development server:
```bash
cd backend
php artisan serve
```

2. Start the React development server (in another terminal):
```bash
cd frontend
npm run dev
```

3. Log in as a driver and navigate to the Driver Dashboard
4. Look for the "Vehicle Maintenance" and "Report Issue" buttons
5. Click "Start Inspection" to begin a pre-trip inspection

---

## Features Overview

### Vehicle Inspection Checklist

Located in the "Vehicle Maintenance" card on the Driver Dashboard.

**Features:**
- 7-item pre-trip inspection checklist
- Visual status indicators (OK/FAIL)
- Optional notes for failed items
- Progress tracking (shows # of OK/FAIL items)
- Automatic issue creation for failed items

**Inspection Items:**
1. **Brakes** 🛑 - Check brake responsiveness and fluid
2. **Tires** 🛞 - Check tread depth and pressure
3. **Lights** 💡 - Verify all lights functioning
4. **Engine** ⚙️ - Check for warning lights
5. **Oil Level** 🛢️ - Verify oil level
6. **Mirrors** 🪞 - Ensure all mirrors present and clean
7. **Horn** 🔔 - Test horn functionality

**Automatic Issue Creation:**
If any item fails, the system automatically creates an issue:
- Multiple inspection failures = Multiple issues created
- Each issue links to the vehicle and driver
- Admin is automatically notified

### Manual Issue Reporting

Located in the "Report Issue" card on the Driver Dashboard.

**Features:**
- Quick problem selection buttons (pre-populated common issues)
- Custom title and detailed description
- Priority level selector with descriptions
- Optional photo upload with preview
- Form validation before submission

**Quick Problem Options:**
- Engine overheating
- Strange noise
- Brake failure
- Flat tire
- Accident
- GPS malfunction
- Battery issue
- Transmission problem
- Electrical issue
- Other

**Priority Levels:**
- **Low** (Green) - Can wait until next service
- **Medium** (Yellow) - Should be addressed soon
- **High** (Orange) - Needs attention before next trip
- **Critical** (Red) - Stop using vehicle immediately

---

## Database Schema

### inspection_items Table

```sql
CREATE TABLE inspection_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inspection_id BIGINT NOT NULL,
  item_name VARCHAR(255),
  status VARCHAR(50), -- 'ok' or 'fail'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
);
```

### issue_attachments Table

```sql
CREATE TABLE issue_attachments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  issue_id BIGINT NOT NULL,
  file_path VARCHAR(255),
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);
```

### issues Table Extensions

```sql
ALTER TABLE issues ADD COLUMN photo_path VARCHAR(255);
ALTER TABLE issues ADD COLUMN resolution_notes TEXT;
ALTER TABLE issues ADD COLUMN assigned_mechanic_id VARCHAR(255);
```

---

## API Usage Examples

### Example 1: Driver Completes Pre-Trip Inspection

```javascript
// Data to send
const inspectionData = {
  vehicle_id: 1,
  driver_id: 2,
  inspection_date: "2026-03-06",
  notes: "Vehicle ready for trip",
  items: [
    { item_name: "brakes", status: "ok" },
    { item_name: "tires", status: "ok" },
    { item_name: "lights", status: "ok" },
    { item_name: "engine", status: "ok" },
    { item_name: "oil level", status: "ok" },
    { item_name: "mirrors", status: "ok" },
    { item_name: "horn", status: "ok" }
  ]
};

// Send to API
const response = await api.createInspection(inspectionData);
// Result: Inspection created with status "pass"
// Admin NOT notified (all items passed)
```

### Example 2: Inspection Has Failed Items

```javascript
// Driver finds issues during inspection
const inspectionData = {
  vehicle_id: 1,
  driver_id: 2,
  inspection_date: "2026-03-06",
  notes: "Found issues during inspection",
  items: [
    { item_name: "brakes", status: "ok" },
    { item_name: "tires", status: "fail", notes: "Left rear tire has puncture" },
    { item_name: "lights", status: "ok" },
    { item_name: "engine", status: "fail", notes: "Check engine light is on" },
    { item_name: "oil level", status: "ok" },
    { item_name: "mirrors", status: "ok" },
    { item_name: "horn", status: "ok" }
  ]
};

const response = await api.createInspection(inspectionData);
// Result:
// 1. Inspection created with status "failed"
// 2. Two issues auto-created:
//    - "Inspection Failed: tires" (high priority)
//    - "Inspection Failed: engine" (high priority)
// 3. Admin notified of both issues
```

### Example 3: Manual Issue Report with Photo

```javascript
// Create FormData for file upload
const formData = new FormData();
formData.append('vehicle_id', 1);
formData.append('driver_id', 2);
formData.append('title', 'Brake failure');
formData.append('description', 'Brake pedal feels soft and goes to the floor. No pressure in brakes.');
formData.append('priority', 'critical');
formData.append('reported_date', '2026-03-06');
formData.append('photo', photoFile); // File input from user

// Send to API
const response = await api.createIssue(formData);
// Result:
// 1. Issue created with priority "critical"
// 2. Photo stored in storage/app/public/issues/
// 3. Admin notified immediately (critical priority)
```

### Example 4: Admin Assigns Mechanic to Issue

```javascript
// Admin updates issue status and assigns mechanic
const updateData = {
  vehicle_id: 1,
  title: 'Brake failure',
  description: 'Brake pedal feels soft and goes to the floor.',
  priority: 'critical',
  status: 'in_progress',
  resolution_notes: 'Identified master cylinder failure. Ordering replacement parts. ETA: 48 hours',
  assigned_mechanic_id: 'mechanic_john_005'
};

const response = await api.updateIssue(issueId, updateData);
// Result: Issue status changed, driver can see mechanic assignment
```

---

## Component Integration

### Adding to Custom Pages

If you want to add the inspection or issue reporting to a custom page:

```jsx
import VehicleInspectionChecklist from '../components/VehicleInspectionChecklist';
import ManualIssueReport from '../components/ManualIssueReport';
import { api } from '../services/api';

export default function CustomPage() {
  const [showInspection, setShowInspection] = useState(false);
  const [showIssueReport, setShowIssueReport] = useState(false);
  
  const handleInspectionSubmit = async (inspectionData) => {
    try {
      await api.createInspection(inspectionData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  const handleIssueSubmit = async (issueData) => {
    try {
      await api.createIssue(issueData); // issueData is FormData
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <button onClick={() => setShowInspection(true)}>
        Start Inspection
      </button>
      
      <button onClick={() => setShowIssueReport(true)}>
        Report Issue
      </button>

      {showInspection && (
        <VehicleInspectionChecklist
          vehicleId={1}
          driverId={2}
          onSubmit={handleInspectionSubmit}
          onCancel={() => setShowInspection(false)}
        />
      )}

      {showIssueReport && (
        <ManualIssueReport
          vehicleId={1}
          driverId={2}
          onSubmit={handleIssueSubmit}
          onCancel={() => setShowIssueReport(false)}
        />
      )}
    </div>
  );
}
```

---

## Admin Dashboard Integration

### Viewing Issues

In the Admin Issues Page, you can now see:

1. **Issue Status:** open, in_progress, resolved, closed
2. **Photo:** Display attached photo if available
3. **Assigned Mechanic:** Who is working on the issue
4. **Priority Level:** visual indicator with color coding
5. **Source:** Whether issue came from inspection or manual report

### Assigning Mechanics

Click on an issue to open details and:
1. Upload additional photos/notes
2. Assign a mechanic
3. Change status as work progresses
4. Add resolution notes
5. Mark as resolved

### Notification Management

Issues trigger notifications when:
1. Created (immediately)
2. Priority changed to critical
3. Status changed to resolved

Admin can view notifications via:
```
GET /api/notifications
```

---

## Workflow Diagram

### Pre-Trip Inspection Workflow

```
Driver Starts Day
    ↓
Opens Driver Dashboard
    ↓
Clicks "Start Inspection"
    ↓
Completes Checklist
(8 items: ok/fail)
    ↓
Any Failures?
    ├─ YES → Auto-create Issue(s)
    │         ↓
    │     Admin Notified
    │         ↓
    │     Admin Reviews & Assigns Mechanic
    │
    └─ NO → Trip can proceed
```

### Manual Issue Reporting Workflow

```
During Trip
    ↓
Problem Detected
    ↓
Opens Driver Dashboard
    ↓
Clicks "Report Problem"
    ↓
Fills Issue Details
(title, description, priority)
    ↓
Optionally Adds Photo
    ↓
Submits Report
    ↓
Issue Created
    ↓
Admin Notified
    ↓
Admin Assigns Mechanic
    ↓
Issue Tracked Until Resolution
```

---

## Troubleshooting

### Issue: Inspection Form Not Showing

**Solution:** 
- Verify vehicle is assigned to driver
- Check driver_id is set correctly
- Inspect browser console for errors

### Issue: Photo Upload Fails

**Solution:**
- Verify file size < 5MB
- Check file type is JPEG, PNG, or GIF
- Ensure `storage/app/public/issues/` directory exists
- Run `php artisan storage:link`

### Issue: Admin Not Receiving Notifications

**Solution:**
- Verify admin user has 'admin' or 'owner' role
- Check admin belongs to same company
- Verify notification table exists
- Check Laravel logs for errors

### Issue: Automatic Issues Not Created from Inspection

**Solution:**
- Check inspection has items array with failures
- Verify InspectionItem model relationship
- Check Issue model has all required fillable fields
- Review Laravel logs

---

## Performance Optimization

### Database Indexes

Add these indexes for better query performance:

```sql
CREATE INDEX idx_inspection_items_inspection_id ON inspection_items(inspection_id);
CREATE INDEX idx_issue_attachments_issue_id ON issue_attachments(issue_id);
CREATE INDEX idx_issues_vehicle_id ON issues(vehicle_id);
CREATE INDEX idx_issues_driver_id ON issues(driver_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
```

### Query Optimization

The API endpoints automatically load relationships:
- Inspections load items
- Issues load attachments, vehicle, and driver
- Optimized with eager loading to prevent N+1 queries

---

## Security Best Practices

1. **Always Validate:** Server-side validation occurs on all endpoints
2. **File Size Limit:** 5MB maximum for photo uploads
3. **File Type Whitelist:** Only JPEG, PNG, GIF accepted
4. **Authentication:** All endpoints require valid API token
5. **Authorization:** Users can only access their own data
6. **Soft Deletes:** Records aren't permanently removed

---

## Testing Checklist

- [ ] Inspection creation with all items passing
- [ ] Inspection creation with items failing
- [ ] Automatic issue creation from failed inspection items
- [ ] Manual issue report creation
- [ ] Photo upload with issue
- [ ] Issue update (status, mechanic assignment)
- [ ] Admin notification reception
- [ ] Issue retrieval (single and all)
- [ ] Inspection retrieval
- [ ] Form validation (missing fields)
- [ ] Photo size validation
- [ ] Role-based authorization

---

## Support Resources

- **API Documentation:** See `VEHICLE_PROBLEM_DETECTION_API.md`
- **Component Code:** Check `frontend/src/components/`
- **Backend Code:** Check `backend/app/Http/Controllers/`
- **Database Migrations:** Check `backend/database/migrations/`

---

## Next Steps

1. Test all features in development
2. Deploy migrations to staging
3. Test with actual users
4. Deploy to production
5. Monitor performance and errors
6. Gather user feedback
7. Iterate and improve

---

## Version
- **Version:** 1.0
- **Last Updated:** March 6, 2026
- **Status:** Production Ready
