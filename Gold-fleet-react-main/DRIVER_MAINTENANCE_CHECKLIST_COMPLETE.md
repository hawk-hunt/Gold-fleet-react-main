# Driver Maintenance Checklist System

## Overview

A complete driver-to-admin inspection reporting system that allows drivers to submit vehicle maintenance checklists, which are automatically reported to company administrators with full notification support.

## Features Implemented

### 1. **Driver Side: Maintenance Checklist Submission**
- **Component**: `DriverMaintenanceChecklist.jsx`
- **Route**: `/driver/maintenance`

#### Functionality:
- Pre-defined inspection items (Brakes, Tires, Lights, Oil, Mirrors, Horn, Wipers, Battery)
- Add/remove custom inspection items
- Check-off items as inspected
- Add per-item notes for issues
- Real-time completion percentage tracker
- General notes for additional observations
- Vehicle selection dropdown
- Submit checklist with one click

#### User Experience:
- Clean, intuitive interface with progress bar
- Visual feedback (green checkmarks for completed items)
- Option to add custom inspection items
- Success message after submission
- Auto-redirect to dashboard after submission

### 2. **Admin Side: Inspection Report Review**
- **Component**: `AdminInspectionReports.jsx`
- **Route**: `/admin/inspection-reports`

#### Functionality:
- View all driver-submitted maintenance checklists
- Filter by status (Pending Review, Reviewed, All)
- Detailed modal view of each inspection
- Review and approve/reject checklists
- Add admin notes during review
- Track review status
- Real-time updates after reviews

#### Review Options:
- ✓ **Approved**: Inspection passed all checks
- ⚠ **Conditionally Approved**: Minor issues noted
- ✗ **Failed**: Issues must be addressed

### 3. **Backend API Endpoints**

#### Driver Endpoints:
- **POST** `/api/inspections/submit-checklist`
  - Submit a new maintenance checklist
  - Required fields: vehicle_id, checklist_items
  - Optional: notes, trip_id
  - Returns: 201 with inspection record

#### Admin Endpoints:
- **GET** `/api/inspections/pending-reviews`
  - Get all pending inspection reviews
  - Returns: Array of unreviewed inspections

- **PATCH** `/api/inspections/{id}/review`
  - Review and approve/reject inspection
  - Body: { result, admin_notes }
  - Returns: Updated inspection record

### 4. **Database Schema**

#### New Columns in `inspections` Table:
```sql
- submitted_by_driver BOOLEAN (driver submitted vs admin created)
- checklist_items JSON (array of inspection items)
- submitted_at TIMESTAMP (when driver submitted)
- admin_reviewed BOOLEAN (whether admin has reviewed)
```

#### Example checklist_items JSON:
```json
[
  {
    "name": "Brakes",
    "checked": true,
    "notes": "All brake pads in good condition"
  },
  {
    "name": "Tires",
    "checked": true,
    "notes": "Pressure good, no visible damage"
  },
  {
    "name": "Engine Oil Level",
    "checked": false,
    "notes": "Oil level low, refilled to proper level"
  }
]
```

### 5. **Notification System**

#### Driver Notifications:
When a driver submits a checklist:
- **Type**: `inspection_checklist`
- **Recipients**: All company admins
- **Message**: "{Driver Name} submitted a maintenance checklist for {Vehicle Make} {Vehicle Model}"
- **Data**: inspection_id, vehicle_id, driver_id, action_url

#### Admin Notifications:
When admin reviews a checklist:
- **Type**: `inspection_reviewed`
- **Recipients**: Driver who submitted
- **Message**: "Your maintenance checklist for {Vehicle} was {Approved/Failed/Conditionally Approved}"
- **Data**: inspection_id, result, action_url

### 6. **Integration Points**

#### Frontend Navigation:
- **Driver Layout**: Added maintenance link in header
  - Dashboard button
  - Maintenance button (new)

#### Route Configuration:
- `/driver/maintenance` → DriverMaintenanceChecklist
- `/admin/inspection-reports` → AdminInspectionReports
- `/driver/dashboard` → DriverDashboard (existing)

#### API Service Methods:
```javascript
// Driver methods
submitMaintenanceChecklist(data)
getPendingInspectionReviews()
reviewInspection(id, data)
```

## Complete Workflow

### Step 1: Driver Initiates Checklist
```
1. Driver navigates to /driver/maintenance
2. Selects vehicle from dropdown
3. Reviews pre-filled inspection items
4. Checks off items as inspected
5. Adds any notes for issues
6. Clicks "Submit Checklist"
```

### Step 2: System Creates Record
```
1. Backend validates submission
2. Creates Inspection record with:
   - submitted_by_driver = true
   - checklist_items = JSON array
   - submitted_at = current timestamp
3. Returns 201 success response
```

### Step 3: Admins Notified
```
1. Notification created for each company admin
2. Type: inspection_checklist
3. Title: "New Maintenance Checklist"
4. Message includes driver name and vehicle
5. Action URL points to inspection review page
```

### Step 4: Admin Reviews
```
1. Admin clicks notification or visits /admin/inspection-reports
2. Opens inspection detail modal
3. Reviews all checklist items
4. Selects pass/fail/conditional result
5. Adds optional admin notes
6. Clicks "Submit Review"
```

### Step 5: Driver Notified
```
1. Notification created for driver
2. Type: inspection_reviewed
3. Title: "Inspection Review Complete"
4. Message includes result (Approved/Failed/etc)
5. Driver can view inspection details
```

## Usage Examples

### For Drivers:
```javascript
// Submit a maintenance checklist
const checklistData = {
  vehicle_id: 5,
  checklist_items: [
    { name: "Brakes", checked: true, notes: "Good condition" },
    { name: "Tires", checked: true, notes: "Pressure OK" },
    { name: "Oil Level", checked: false, notes: "Low, refilled" }
  ],
  notes: "Routine pre-trip inspection completed",
  trip_id: null
};

const response = await api.submitMaintenanceChecklist(checklistData);
```

### For Admins:
```javascript
// Get pending reviews
const pendingReviews = await api.getPendingInspectionReviews();

// Review an inspection
const reviewData = {
  result: 'pass', // or 'fail', 'conditional_pass'
  admin_notes: 'Vehicle is ready for operation'
};

const response = await api.reviewInspection(inspectionId, reviewData);
```

## Database Queries

### Get pending inspection reviews:
```sql
SELECT * FROM inspections 
WHERE submitted_by_driver = true 
  AND admin_reviewed = false
ORDER BY submitted_at DESC;
```

### Get inspection completion status:
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN admin_reviewed = true THEN 1 ELSE 0 END) as reviewed,
  SUM(CASE WHEN admin_reviewed = false THEN 1 ELSE 0 END) as pending
FROM inspections
WHERE submitted_by_driver = true
  AND company_id = ?;
```

## Files Created/Modified

### Backend Files:
1. **Migration**: `2026_03_09_add_checklist_to_inspections.php`
   - Adds: submitted_by_driver, checklist_items, submitted_at, admin_reviewed

2. **Model**: `app/Models/Inspection.php`
   - Updated fillable array
   - Updated casts for new fields
   - Added trip relationship
   - Added scopes: submittedByDriver(), unreviewed()

3. **Controller**: `app/Http/Controllers/InspectionController.php`
   - Added: submitChecklist() - POST /api/inspections/submit-checklist
   - Added: getPendingReviews() - GET /api/inspections/pending-reviews
   - Added: reviewChecklist() - PATCH /api/inspections/{id}/review
   - Added: notifyAdminsOfChecklist() - private helper
   - Added: notifyDriverOfReview() - private helper

4. **Routes**: `routes/api.php`
   - POST /api/inspections/submit-checklist
   - GET /api/inspections/pending-reviews
   - PATCH /api/inspections/{id}/review

### Frontend Files:
1. **Components**:
   - `DriverMaintenanceChecklist.jsx` - Driver checklist form
   - `AdminInspectionReports.jsx` - Admin review dashboard

2. **Components Updated**:
   - `DriverLayout.jsx` - Added maintenance navigation link

3. **Services**:
   - `api.js` - Added three new methods:
     - submitMaintenanceChecklist()
     - getPendingInspectionReviews()
     - reviewInspection()

4. **Routes**:
   - `App.jsx` - Added routes and imports

## Testing Checklist

- [ ] Create test data with seeder if needed
- [ ] Driver can submit maintenance checklist
- [ ] Checklist items are stored as JSON
- [ ] Admins receive notification when driver submits
- [ ] Admin can view pending inspections
- [ ] Admin can approve/fail inspection
- [ ] Driver receives notification when reviewed
- [ ] Failed inspections create issues (if configured)
- [ ] Filter by status works on admin page
- [ ] Custom items can be added and removed
- [ ] Notes are properly stored and displayed
- [ ] Completion percentage updates in real-time
- [ ] Logged-in driver only sees their vehicle's data
- [ ] Only admins can access review page

## Future Enhancements

1. **Automatic Issue Creation**
   - Create issues in system when driver notes problems
   - Auto-assign to maintenance team

2. **Email Notifications**
   - Send emails when checklists submitted
   - Email summary to admin daily

3. **Scheduling**
   - Auto-generate required inspections on schedule
   - Pre-trip/post-trip mandatory checklists

4. **History & Analytics**
   - Track inspection compliance over time
   - Generate compliance reports
   - Analytics on common issues found

5. **Mobile Integration**
   - Mobile app for drivers
   - Real-time location with inspection data
   - Photo uploads for documented issues

6. **Integration with Maintenance**
   - Link failed inspections to service tickets
   - Track time to resolution

## API Response Examples

### Submit Checklist Response:
```json
{
  "success": true,
  "message": "Maintenance checklist submitted successfully",
  "data": {
    "id": 42,
    "company_id": 1,
    "vehicle_id": 5,
    "driver_id": 3,
    "inspection_date": "2026-03-09",
    "submitted_by_driver": true,
    "checklist_items": [...],
    "submitted_at": "2026-03-09T14:30:00Z",
    "admin_reviewed": false,
    "vehicle": {...},
    "driver": {...}
  }
}
```

### Get Pending Reviews Response:
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

### Review Inspection Response:
```json
{
  "success": true,
  "message": "Inspection reviewed successfully",
  "data": {
    "id": 42,
    "result": "pass",
    "admin_reviewed": true,
    "vehicle": {...},
    "driver": {...}
  }
}
```

## Error Handling

### Validation Errors (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "vehicle_id": ["The vehicle_id field is required"],
    "checklist_items": ["At least one checklist item is required"]
  }
}
```

### Authorization Errors (403):
```json
{
  "success": false,
  "message": "Only drivers can submit checklists"
}
```

## Notes

- Checklist is JSON format for flexibility (add new item types easily)
- Submitted timestamp automatic, no manipulation allowed
- Admin review creates notification for driver automatically
- System tracks who reviewed what when
- Supports custom inspection items per company
- Full audit trail via created_at/updated_at timestamps
