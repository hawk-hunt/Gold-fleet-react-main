# Vehicle Problem Detection & Inspection System - API Documentation

## Overview
This document provides comprehensive API documentation for the manual vehicle problem detection system integrated into the Driver Dashboard. The system allows drivers to perform pre-trip inspections and manually report issues with their vehicles.

## System Features

### 1. Vehicle Inspection Checklist
Drivers perform mandatory pre-trip inspections by checking items:
- Brakes
- Tires
- Lights
- Engine
- Oil Level
- Mirrors
- Horn

Each item can be marked as **OK** or **FAIL**. Failed items automatically create issues in the system.

### 2. Manual Issue Reporting
Drivers can manually report problems at any time during their trip with:
- Issue title (can select from predefined problems)
- Detailed description
- Priority level (Low, Medium, High, Critical)
- Optional photo upload

### 3. Admin Notifications
When an issue is created (either from inspection failure or manual report), the company admin/owner receives an automatic notification with:
- Issue title
- Vehicle information
- Driver information
- Priority level

---

## API Endpoints

### Inspection Endpoints

#### Create Inspection with Checklist
**Endpoint:** `POST /api/inspections`

**Description:** Create a new vehicle inspection with checklist items

**Request Headers:**
```
Authorization: Bearer {api_token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "vehicle_id": 1,
  "driver_id": 2,
  "inspection_date": "2026-03-06",
  "notes": "Pre-trip inspection completed",
  "result": "pass",
  "next_due_date": "2026-04-06",
  "items": [
    {
      "item_name": "brakes",
      "status": "ok",
      "notes": null
    },
    {
      "item_name": "tires",
      "status": "ok",
      "notes": "Tread depth good"
    },
    {
      "item_name": "lights",
      "status": "ok",
      "notes": null
    },
    {
      "item_name": "engine",
      "status": "fail",
      "notes": "Engine light is on"
    },
    {
      "item_name": "oil level",
      "status": "ok",
      "notes": "Oil level normal"
    },
    {
      "item_name": "mirrors",
      "status": "ok",
      "notes": null
    },
    {
      "item_name": "horn",
      "status": "ok",
      "notes": null
    }
  ]
}
```

**Valid Item Names:**
- `brakes`
- `tires`
- `lights`
- `engine`
- `oil level`
- `mirrors`
- `horn`

**Valid Item Status:**
- `ok` - Item passed inspection
- `fail` - Item failed inspection

**Valid Result Values:**
- `pass` - All items passed
- `fail` - One or more items failed
- `conditional_pass` - Passed with conditions

**Response (201 Created):**
```json
{
  "data": {
    "id": 5,
    "company_id": 1,
    "vehicle_id": 1,
    "driver_id": 2,
    "inspection_date": "2026-03-06",
    "notes": "Pre-trip inspection completed",
    "status": "failed",
    "result": "fail",
    "next_due_date": "2026-04-06",
    "created_at": "2026-03-06T10:30:00.000000Z",
    "updated_at": "2026-03-06T10:30:00.000000Z",
    "vehicle": {
      "id": 1,
      "make": "Toyota",
      "model": "Camry",
      "license_plate": "ABC-1234",
      "status": "active"
    },
    "driver": {
      "id": 2,
      "name": "John Driver",
      "user": {
        "id": 45,
        "name": "John Driver",
        "email": "john@example.com"
      }
    },
    "items": [
      {
        "id": 12,
        "inspection_id": 5,
        "item_name": "brakes",
        "status": "ok",
        "notes": null,
        "created_at": "2026-03-06T10:30:00.000000Z",
        "updated_at": "2026-03-06T10:30:00.000000Z"
      },
      {
        "id": 13,
        "inspection_id": 5,
        "item_name": "engine",
        "status": "fail",
        "notes": "Engine light is on",
        "created_at": "2026-03-06T10:30:00.000000Z",
        "updated_at": "2026-03-06T10:30:00.000000Z"
      }
    ]
  }
}
```

**Error Responses:**

422 Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "vehicle_id": ["The vehicle_id field is required."],
    "items.0.item_name": ["The items.0.item_name field must be one of: brakes, tires, lights, engine, oil level, mirrors, horn"]
  }
}
```

---

#### Get All Inspections
**Endpoint:** `GET /api/inspections`

**Description:** Retrieve all inspections for the company

**Request Headers:**
```
Authorization: Bearer {api_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 5,
      "company_id": 1,
      "vehicle_id": 1,
      "driver_id": 2,
      "inspection_date": "2026-03-06",
      "notes": "Pre-trip inspection completed",
      "status": "failed",
      "result": "fail",
      "next_due_date": "2026-04-06",
      "created_at": "2026-03-06T10:30:00.000000Z",
      "updated_at": "2026-03-06T10:30:00.000000Z",
      "vehicle": {...},
      "driver": {...},
      "items": [...]
    }
  ]
}
```

---

#### Get Single Inspection
**Endpoint:** `GET /api/inspections/{id}`

**Description:** Retrieve a specific inspection with all its items

**Request Headers:**
```
Authorization: Bearer {api_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 5,
    "company_id": 1,
    "vehicle_id": 1,
    "driver_id": 2,
    "inspection_date": "2026-03-06",
    "notes": "Pre-trip inspection completed",
    "status": "failed",
    "result": "fail",
    "next_due_date": "2026-04-06",
    "created_at": "2026-03-06T10:30:00.000000Z",
    "updated_at": "2026-03-06T10:30:00.000000Z",
    "vehicle": {...},
    "driver": {...},
    "items": [...]
  }
}
```

---

#### Update Inspection
**Endpoint:** `PUT /api/inspections/{id}`

**Description:** Update an inspection and its items

**Request Body:**
```json
{
  "vehicle_id": 1,
  "driver_id": 2,
  "inspection_date": "2026-03-06",
  "notes": "Updated inspection notes",
  "result": "pass",
  "next_due_date": "2026-04-06",
  "items": [
    {
      "item_name": "brakes",
      "status": "ok",
      "notes": null
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": {...}
}
```

---

#### Delete Inspection
**Endpoint:** `DELETE /api/inspections/{id}`

**Description:** Soft delete an inspection

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Inspection deleted successfully."
}
```

---

### Issue Endpoints

#### Create Issue (Manual Report)
**Endpoint:** `POST /api/issues`

**Description:** Create a new issue manually reported by a driver

**Request Headers:**
```
Authorization: Bearer {api_token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body (use FormData for file upload):**
```
vehicle_id: 1
driver_id: 2
title: Engine overheating
description: The engine is running hot, temperature gauge is in the red zone. Started happening about 5 minutes ago during highway driving.
priority: high
reported_date: 2026-03-06
photo: [binary file data]
```

**Valid Priority Values:**
- `low` - Can wait until next service
- `medium` - Should be addressed soon
- `high` - Needs attention before next trip
- `critical` - Stop using vehicle immediately

**Response (201 Created):**
```json
{
  "data": {
    "id": 8,
    "company_id": 1,
    "vehicle_id": 1,
    "driver_id": 2,
    "title": "Engine overheating",
    "description": "The engine is running hot, temperature gauge is in the red zone. Started happening about 5 minutes ago during highway driving.",
    "severity": "high",
    "status": "open",
    "priority": "high",
    "reported_date": "2026-03-06",
    "photo_path": "issues/photo_1234567890.jpg",
    "resolution_notes": null,
    "assigned_mechanic_id": null,
    "created_at": "2026-03-06T10:35:00.000000Z",
    "updated_at": "2026-03-06T10:35:00.000000Z",
    "vehicle": {
      "id": 1,
      "make": "Toyota",
      "model": "Camry",
      "license_plate": "ABC-1234"
    },
    "driver": {
      "id": 2,
      "name": "John Driver"
    },
    "attachments": []
  }
}
```

**Admin Notification Created:**
When an issue is created, all company admins receive a notification:
```json
{
  "id": 15,
  "company_id": 1,
  "user_id": 5,
  "type": "issue_created",
  "title": "New Vehicle Issue",
  "message": "A new issue has been reported: Engine overheating",
  "data": {
    "issue_id": 8,
    "vehicle_id": 1,
    "driver_id": 2,
    "priority": "high"
  },
  "read": false,
  "created_at": "2026-03-06T10:35:00.000000Z",
  "updated_at": "2026-03-06T10:35:00.000000Z"
}
```

---

#### Get All Issues
**Endpoint:** `GET /api/issues`

**Description:** Retrieve all issues for the company

**Request Headers:**
```
Authorization: Bearer {api_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 8,
      "company_id": 1,
      "vehicle_id": 1,
      "driver_id": 2,
      "title": "Engine overheating",
      "description": "...",
      "severity": "high",
      "status": "open",
      "priority": "high",
      "reported_date": "2026-03-06",
      "photo_path": "issues/photo_1234567890.jpg",
      "resolution_notes": null,
      "assigned_mechanic_id": null,
      "created_at": "2026-03-06T10:35:00.000000Z",
      "updated_at": "2026-03-06T10:35:00.000000Z",
      "vehicle": {...},
      "driver": {...},
      "attachments": [...]
    }
  ]
}
```

---

#### Get Single Issue
**Endpoint:** `GET /api/issues/{id}`

**Description:** Retrieve a specific issue with all details and attachments

**Request Headers:**
```
Authorization: Bearer {api_token}
Accept: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 8,
    "company_id": 1,
    "vehicle_id": 1,
    "driver_id": 2,
    "title": "Engine overheating",
    "description": "...",
    "severity": "high",
    "status": "open",
    "priority": "high",
    "reported_date": "2026-03-06",
    "photo_path": "issues/photo_1234567890.jpg",
    "resolution_notes": null,
    "assigned_mechanic_id": null,
    "created_at": "2026-03-06T10:35:00.000000Z",
    "updated_at": "2026-03-06T10:35:00.000000Z",
    "vehicle": {...},
    "driver": {...},
    "attachments": [...]
  }
}
```

---

#### Update Issue (Admin Only)
**Endpoint:** `PUT /api/issues/{id}`

**Description:** Update an issue (assign mechanic, add resolution notes, update status)

**Request Headers:**
```
Authorization: Bearer {api_token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body:**
```
vehicle_id: 1
title: Engine overheating
description: The engine is running hot...
priority: high
status: in_progress
resolution_notes: Ordered replacement radiator, estimated delivery 2 days
assigned_mechanic_id: john_mechanic_123
photo: [optional binary file data]
```

**Valid Status Values:**
- `open` - Issue just created
- `in_progress` - Mechanic is working on it
- `resolved` - Issue has been fixed
- `closed` - Issue is closed and verified

**Response (200 OK):**
```json
{
  "data": {
    "id": 8,
    "company_id": 1,
    "vehicle_id": 1,
    "driver_id": 2,
    "title": "Engine overheating",
    "description": "...",
    "severity": "high",
    "status": "in_progress",
    "priority": "high",
    "reported_date": "2026-03-06",
    "photo_path": "issues/photo_1234567890.jpg",
    "resolution_notes": "Ordered replacement radiator, estimated delivery 2 days",
    "assigned_mechanic_id": "john_mechanic_123",
    "created_at": "2026-03-06T10:35:00.000000Z",
    "updated_at": "2026-03-06T10:45:00.000000Z",
    "vehicle": {...},
    "driver": {...},
    "attachments": [...]
  }
}
```

---

#### Delete Issue
**Endpoint:** `DELETE /api/issues/{id}`

**Description:** Soft delete an issue

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue deleted successfully."
}
```

---

## Integration with Components

### React Inspection Checklist Component
Location: `frontend/src/components/VehicleInspectionChecklist.jsx`

**Usage in Driver Dashboard:**
```jsx
<VehicleInspectionChecklist
  vehicleId={vehicle?.id}
  driverId={driverId}
  onSubmit={handleInspectionSubmit}
  onCancel={() => setShowInspection(false)}
/>
```

**Component Props:**
- `vehicleId`: ID of the vehicle being inspected
- `driverId`: ID of the driver performing inspection
- `onSubmit`: Callback function when inspection is submitted
- `onCancel`: Callback function when inspection is cancelled

**Features:**
- Pre-built checklist with 7 vehicle inspection items
- OK/FAIL status selection for each item
- Optional notes for failed items
- Progress summary showing passed/failed items
- General notes field for additional observations

---

### React Manual Issue Report Component
Location: `frontend/src/components/ManualIssueReport.jsx`

**Usage in Driver Dashboard:**
```jsx
<ManualIssueReport
  vehicleId={vehicle?.id}
  driverId={driverId}
  onSubmit={handleIssueSubmit}
  onCancel={() => setShowIssueReport(false)}
/>
```

**Component Props:**
- `vehicleId`: ID of the vehicle with the issue
- `driverId`: ID of the driver reporting the issue
- `onSubmit`: Callback function when issue is submitted (receives FormData)
- `onCancel`: Callback function when report is cancelled

**Features:**
- Quick problem selection buttons (common problems pre-populated)
- Issue title and detailed description fields
- Priority level selector with descriptions
- Optional photo upload with preview and removal
- Form validation before submission
- File size limit (5MB) enforcement

---

## Automatic Issue Creation from Inspection

When an inspection is submitted with failed items, the system automatically creates issues:

**Automatic Issue Details:**
- **Title:** `Inspection Failed: {item_name}`
- **Description:** Either provided notes or auto-generated message
- **Vehicle & Driver:** Linked to the inspection
- **Priority:** `high`
- **Status:** `open`
- **Reported Date:** Inspection date

**Example:**
If `engine` fails inspection with note "Engine light is on", an issue is automatically created:
```json
{
  "vehicle_id": 1,
  "driver_id": 2,
  "title": "Inspection Failed: engine",
  "description": "Vehicle inspection identified a problem with engine",
  "severity": "medium",
  "priority": "high",
  "status": "open",
  "reported_date": "2026-03-06"
}
```

---

## Database Tables

### inspection_items Table
```sql
CREATE TABLE inspection_items (
  id BIGINT PRIMARY KEY,
  inspection_id BIGINT (foreign key to inspections),
  item_name VARCHAR(255),
  status VARCHAR(50), -- 'ok' or 'fail'
  notes TEXT nullable,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP nullable
);
```

### issue_attachments Table
```sql
CREATE TABLE issue_attachments (
  id BIGINT PRIMARY KEY,
  issue_id BIGINT (foreign key to issues),
  file_path VARCHAR(255),
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP nullable
);
```

### issues Table Extensions
```sql
ALTER TABLE issues ADD COLUMN photo_path VARCHAR(255) nullable;
ALTER TABLE issues ADD COLUMN resolution_notes TEXT nullable;
ALTER TABLE issues ADD COLUMN assigned_mechanic_id VARCHAR(255) nullable;
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid request"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "An error occurred: [error details]"
}
```

---

## Migration & Installation

### Running Migrations
```bash
cd backend
php artisan migrate
```

This will create:
- `inspection_items` table
- `issue_attachments` table
- Add columns to `issues` table

### Database Seeding (Optional)
```bash
php artisan db:seed
```

---

## Testing the API

### cURL Examples

**Create Inspection with Checklist:**
```bash
curl -X POST http://localhost:8000/api/inspections \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 2,
    "inspection_date": "2026-03-06",
    "notes": "Pre-trip inspection",
    "items": [
      {"item_name": "brakes", "status": "ok"},
      {"item_name": "tires", "status": "ok"},
      {"item_name": "lights", "status": "fail", "notes": "Left headlight broken"}
    ]
  }'
```

**Create Manual Issue Report with Photo:**
```bash
curl -X POST http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "vehicle_id=1" \
  -F "driver_id=2" \
  -F "title=Engine overheating" \
  -F "description=Engine temperature is too high" \
  -F "priority=high" \
  -F "reported_date=2026-03-06" \
  -F "photo=@path/to/photo.jpg"
```

**Retrieve All Issues:**
```bash
curl -X GET http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Update Issue Status:**
```bash
curl -X PUT http://localhost:8000/api/issues/8 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "title": "Engine overheating",
    "description": "Engine temperature is too high",
    "priority": "high",
    "status": "in_progress",
    "resolution_notes": "Radiator replacement in progress"
  }'
```

---

## Notification System

### Inspection Failure Notifications
When an inspection contains failed items, admins are automatically notified. The notification includes:
- Issue title and description
- Vehicle and driver information
- Priority level
- Link to view issue details

### Manual Issue Report Notifications
When a driver submits a manual issue report:
1. Issue is created in the system
2. All company admins receive instant notification
3. Notification is visible in admin dashboard
4. Admin can assign mechanic and track resolution

### Notification API Endpoints
```
GET /api/notifications - Get all notifications
PATCH /api/notifications/{id}/read - Mark as read
PATCH /api/notifications/mark-all-read - Mark all as read
```

---

## Security Considerations

1. **Authentication:** All endpoints require valid API token in Authorization header
2. **File Upload:** 
   - Maximum file size: 5MB (enforced on both frontend and backend)
   - Only image files accepted: JPEG, PNG, GIF
   - Files stored in `storage/app/public/issues/` directory
3. **Validation:** All input is validated server-side
4. **Authorization:** Only authenticated users can create issues/inspections
5. **Soft Deletes:** Deleted records are soft-deleted (not permanently removed)

---

## Best Practices

1. **Always include items array** when creating inspections, even if all items pass
2. **Use meaningful notes** for failed items to help mechanics diagnose issues
3. **Attach photos** when possible for better issue documentation
4. **Set appropriate priority** - critical issues should stop vehicle operation
5. **Check notification status** regularly in admin dashboard
6. **Update issue status** as work progresses for better tracking

---

## Support & Troubleshooting

**Issue not creating?**
- Verify vehicle_id exists
- Check driver_id is valid
- Ensure all required fields are provided

**Photo not uploading?**
- Check file size (must be < 5MB)
- Verify file type (JPEG, PNG, GIF only)
- Ensure FormData is used for requests

**Notifications not appearing?**
- Verify admin user has 'admin' or 'owner' role
- Check user's company_id matches issue's company_id
- Review database for notification records

---

## Version Information
- **API Version:** 1.0
- **Laravel Version:** 11.x
- **PHP Version:** 8.1+
- **Last Updated:** March 6, 2026
