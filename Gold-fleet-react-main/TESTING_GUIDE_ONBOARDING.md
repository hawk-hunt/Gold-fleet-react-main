# Onboarding Workflow - Testing Guide

## Quick Test Protocol

### Test Environment Setup
```
- Frontend running on http://localhost:3000
- Backend running on http://localhost:8000
- Browser DevTools Console visible (F12 / Ctrl+Shift+I)
- Fresh browser (clear cache or use Incognito)
```

---

## Test 1: Immediate Banner Rendering

**Objective**: Verify ApprovalBanner appears immediately after signup

**Steps**:
1. Go to login page → Click "Sign up"
2. Select plan (e.g., "Professional")
3. Fill form with:
   - Full Name: `Test User`
   - Email: `test@test.com`
   - Company: `Test Company Ltd`
   - Company Email: `company@test.com`
4. Click "Continue"
5. Verify Step 2 form appears (company details)
6. Click "Continue" again
7. Watch console and page carefully
8. **KEY POINT**: Wait for Step 3 (Payment Simulation) to appear

**Expected Result**:
- Console shows: `[AuthPage] ✓ Company status refreshed after subscription creation`
- Step 3 payment simulation page loads
- No errors in console

---

## Test 2: Dashboard Banner Immediate Display

**Objective**: Verify ApprovalBanner appears instantly on Dashboard load

**Prerequisites**: Completed Test 1, currently on payment simulation page

**Steps**:
1. Create payment simulation (select any method, click "Save")
2. Watch console carefully
3. Click "Complete Setup" button
4. Watch page carefully during redirect
5. **CRITICAL OBSERVATION POINT**: Watch time from redirect until banner visible

**Expected Result**:
- Message shown: "✓ Account created successfully! Redirecting to dashboard..."
- 1.5 second delay (by design)
- Dashboard loads
- **IMMEDIATE** (within 500ms): Header appears
- **IMMEDIATE** (within 500ms): ApprovalBanner appears with message "Pending Admin Approval"
- Console shows:
  ```
  [Dashboard] ✓ Company status refreshed from backend
  [Auth] ✓ Auth refreshed successfully! New company status: pending_approval
  ```

**Lock Verification**:
- Total Vehicles card → opacity-60 (dimmed) + lock icon
- Total Drivers card → opacity-60 (dimmed) + lock icon  
- Total Trips card → opacity-60 (dimmed) + lock icon
- Cards ARE NOT clickable (or navigate returns error)

**Restricted Features List** (visible in banner):
```
✓ Available Now:
  • Notifications
  • Messages
  • Billing & Profile

🔒 Restricted:
  • Vehicles & Drivers
  • Tracking Map
  • Reports & Analytics
  • Fleet Management Tools
```

**NOT Acceptable**:
- ❌ Blank white screen for 3+ seconds
- ❌ Banner appearing when stats load (delay)
- ❌ No banner visible at all
- ❌ Incorrect status message

---

## Test 3: Dashboard Stats Loading

**Objective**: Verify stats load in background without blocking banner

**Prerequisites**: Currently on Dashboard with ApprovalBanner showing

**Steps**:
1. Observe page for 2-3 seconds
2. Watch for KPI cards to appear (Total Vehicles, Total Drivers, etc.)
3. Note the time between banner appearance and cards appearance

**Expected Result**:
- Banner visible: < 1 second
- Loading spinner shows while stats load
- "Loading dashboard data..." message appears
- Stats load gradually (1-2 seconds typically)
- All KPI cards appear within 3 seconds total
- Analytics charts load after KPI cards
- No console errors during loading

---

## Test 4: Back Button Behavior

**Objective**: Verify back button doesn't cause incorrect dashboard unlock

**Prerequisites**: DashboardShowing pending approval (company not approved yet)

**Steps**:
1. From Dashboard, click "Drivers" navigation link
2. Wait for Drivers page to load
3. Press browser back button
4. Watch Dashboard reload
5. Observe console

**Expected Result**:
- Dashboard reloads
- Console shows refreshAuth being called
- ApprovalBanner still visible (status unchanged)
- Lock icons still showing on restricted cards
- Status message still shows "Pending Admin Approval"
- Correct state maintained

**Unacceptable**:
- ❌ Dashboard appears "unlocked" (no banner, no locks)
- ❌ Navigation doesn't work
- ❌ Console errors

---

## Test 5: Admin Approval and Dashboard Unlock

**Objective**: Verify dashboard unlocks when admin approves payment

**Prerequisites**: 
- Dashboard showing pending approval
- Have access to admin/platform dashboard

**Steps**:

### Part A: Admin Approval
1. Open admin platform in different browser tab/window
2. Navigate to "Payments" section
3. Find the test company's payment (just created)
4. Click "Verify Payment" button
5. Wait for success message

### Part B: Company Dashboard Update
1. Return to company dashboard (test company)
2. Press F5 to refresh page
3. OR navigate to Drivers and press back
4. Watch page carefully during reload

**Expected Result**:

Console shows:
```
[Dashboard] ✓ Company status refreshed from backend
[Auth] ✓ Auth refreshed successfully! New company status: approved
```

Dashboard UI changes:
- ApprovalBanner DISAPPEARS
- Lock icons DISAPPEAR from cards
- Card opacity becomes 100% (fully visible)
- All cards become CLICKABLE
- Clicking "Total Vehicles" navigates to /vehicles
- Clicking "Total Drivers" navigates to /drivers
- All modules accessible

**NOT Acceptable**:
- ❌ Banner still shows
- ❌ Cards still locked
- ❌ Navigation still blocked
- ❌ Requires manual browser refresh to see changes

---

## Test 6: Console Output Verification

**Objective**: Verify all logging is correct throughout workflow

**Before Dashboard Appears**:
```javascript
// During signup
✅ Signup successful
✅ Subscription created
[AuthPage] ✓ Company status refreshed after subscription creation

// During redirect
Account created successfully! Redirecting to dashboard...
```

**After Dashboard Loads (Before Approval)**:
```javascript
[Dashboard] ✓ Company status refreshed from backend
[Auth] ✓ Auth refreshed successfully! New company status: pending_approval
```

**After Approval and Refresh**:
```javascript
[Dashboard] ✓ Company status refreshed from backend
[Auth] ✓ Auth refreshed successfully! New company status: approved
```

**Error Messages (Should NOT Appear)**:
```javascript
❌ [Dashboard] Error refreshing company status
❌ [Auth] Auth refresh error
❌ Unexpected token in JSON
❌ 401 Unauthorized
❌ 403 Forbidden
```

---

## Test 7: Network Simulation (Optional Advanced)

**Objective**: Verify behavior with slow network

**Steps**:
1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Repeat Test 2 (Dashboard loading)

**Expected Result**:
- Banner still appears quickly (uses existing AuthContext data)
- Stats load slower but separately
- UI remains responsive
- No timeout errors

---

## Test 8: Multiple Companies (If Available)

**Objective**: Verify each company gets correct approval status

**Setup**:
- Create 2 companies with different approval states
- Company A: awaiting approval
- Company B: already approved

**Steps**:
1. Login as Company A → Dashboard
   - Should show: ApprovalBanner present, locked
2. Logout
3. Login as Company B → Dashboard
   - Should show: No banner, fully unlocked

**Expected Result**:
- Each company sees appropriate status
- No state leakage between companies
- Console shows correct status for each

---

## Test 9: Edge Cases

### Edge Case 1: Session Timeout
```
1. Login and reach Dashboard
2. Wait for token to expire (or manually delete token from sessionStorage)
3. Try to navigate to restricted area
4. Should redirect to login
```

### Edge Case 2: Subscription Failure
```
1. During signup, injection error before subscription completes
2. Should see error message
3. Can retry or start over
4. No orphaned user/company
```

### Edge Case 3: Network Error During Refresh
```
1. Dashboard loads
2. During refreshAuth(), kill backend service
3. Should log warning but not crash
4. Dashboard should still function with existing data
```

---

## Quick Checklist

```
[ ] Test 1: Company status refreshed after subscription (console log visible)
[ ] Test 2: Dashboard banner appears within 500ms
[ ] Test 3: Stats load in background without blocking
[ ] Test 4: Back button maintains correct state
[ ] Test 5: Admin approval unlocks dashboard on refresh
[ ] Test 6: All expected console logs present
[ ] Test 7: No unexpected errors in console
[ ] Test 8: Lock icons and opacity correct
[ ] Test 9: ApprovalBanner text and content correct
[ ] Test 10: Restricted features properly grayed out
[ ] Test 11: Redirect after signup works smoothly
[ ] Test 12: No multiple banner instances
[ ] Test 13: Navigation works when unlocked
[ ] Test 14: Easy to understand for new user
```

---

## Common Issues and Fixes

### Issue: Banner doesn't appear after dashboard loads

**Diagnosis**:
- Check console for errors
- Check company_status in DevTools → Application → SessionStorage

**Fix**:
- Clear browser cache: Ctrl+Shift+Delete
- Check backend is running: curl http://localhost:8000/api/user -H "Auth..."
- Verify AuthContext has company object

### Issue: Dashboard says "Loading..." forever

**Diagnosis**:
- Backend not responding
- Stats API failing
- Network timeout

**Fix**:
- Check backend service: `php artisan serve`
- Check database connection: `mysql -u root`
- Check browser Network tab for failed requests

### Issue: Approval banner appears randomly on refresh

**Diagnosis**:
- AuthContext company object not persisting
- Session data lost

**Fix**:
- Check sessionStorage still has auth_token
- Verify /api/user endpoint returns consistent data
- Check no race conditions in refreshAuth()

### Issue: Back button shows wrong unlock state

**Diagnosis**:
- Component not remounting
- State cache issue
- Old data displayed

**Fix**:
- Force hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check useEffect dependencies are correct

---

## Timeline Expectations

| Stage | Time | Action |
|-------|------|--------|
| Signup to Payment Step | 5-10s | User fills form |
| Payment Simulation | 3-5s | User creates simulation |
| Redirect to Dashboard | 1.5s | (Intentional delay) |
| Header + Banner Render | 0.5s | ✓ INSTANT |
| Dashboard Stats Load | 1-2s | Background loading |
| Total Time | ~3s | User sees banner immediately |

---

## Success Criteria Summary

✅ **Dashboard loads within 1.5s of signup completion**
✅ **Approval banner visible immediately (< 500ms)**
✅ **Stats load in background without blocking UI**
✅ **Admin approval unlocks dashboard within 1 refresh**
✅ **No confusing delays or blank screens**
✅ **Correct approval status always shown**
✅ **Back button maintains state integrity**
✅ **User understands approval process clearly**

---

**Testing Status**: Ready ✓  
**Estimated Test Time**: 15-20 minutes per round  
**QA Sign-off Required**: Yes
