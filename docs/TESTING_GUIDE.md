# Equipment Management System - Testing Guide

This guide provides comprehensive smoke tests for validating authentication, 2FA, and UX flows in the Equipment Management System.

## Prerequisites

1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:8081` (or configured port)
3. Database initialized with migrations
4. Browser with developer tools open (F12)

---

## 1. Authentication Flow Testing

### 1.1 User Registration

**Test Steps:**
1. Navigate to registration page (`#register`)
2. Fill in form:
   - Username: `testuser1` (3-20 characters)
   - Password: `testpass123` (min 6 characters)
   - First Name: `Test`
   - Last Name: `User`
3. Submit form
4. Verify redirect to dashboard
5. Verify JWT token stored in `sessionStorage.getItem("authentication_token")`
6. Verify user info displayed in dashboard

**Expected Results:**
- ✅ Registration successful
- ✅ JWT token received and stored
- ✅ User redirected to dashboard
- ✅ User role is `USER` by default

**Error Cases to Test:**
- ❌ Username already taken → Should show error message
- ❌ Password too short → Should show validation error
- ❌ Missing required fields → Should show validation errors

---

### 1.2 User Login

**Test Steps:**
1. Navigate to login page (`#login`)
2. Enter credentials:
   - Username: `testuser1`
   - Password: `testpass123`
3. Submit form
4. Verify redirect to dashboard
5. Verify token stored in sessionStorage
6. Verify last login timestamp updated (check API response)

**Expected Results:**
- ✅ Login successful
- ✅ Token received and stored
- ✅ Redirect to dashboard
- ✅ Last login timestamp updated

**Error Cases to Test:**
- ❌ Invalid username → Should show "Invalid credentials"
- ❌ Invalid password → Should show "Invalid credentials"
- ❌ Empty fields → Should show validation errors

---

### 1.3 Password Reset

**Test Steps:**
1. Navigate to forgot password page (`#forgot-password`)
2. Enter username: `testuser1`
3. Enter new password: `newpass123`
4. Submit form
5. Verify success message
6. Try logging in with old password → Should fail
7. Try logging in with new password → Should succeed

**Expected Results:**
- ✅ Password reset successful
- ✅ Old password no longer works
- ✅ New password works

---

### 1.4 Session Management

**Test Steps:**
1. Login successfully
2. Verify token expiration check (24 hours default)
3. Manually expire token in sessionStorage
4. Try to access protected endpoint
5. Verify redirect to login page

**Expected Results:**
- ✅ Expired tokens trigger logout
- ✅ User redirected to login
- ✅ Session cleared

---

## 2. Two-Factor Authentication (2FA) Flow Testing

### 2.1 Enable 2FA

**Test Steps:**
1. Login as user
2. Navigate to profile/settings (if available) or use API directly
3. Call `POST /api/benutzer/2fa/enable`
4. Verify response contains:
   - `secret`: Base32 secret
   - `otpAuthUrl`: QR code URL
5. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
6. Verify secret is stored in database (not enabled yet)

**Expected Results:**
- ✅ 2FA setup initiated
- ✅ Secret and QR code URL received
- ✅ QR code scannable in authenticator app
- ✅ 2FA not yet enabled (requires verification)

---

### 2.2 Verify and Enable 2FA

**Test Steps:**
1. After enabling 2FA setup, get 6-digit code from authenticator app
2. Call `POST /api/benutzer/2fa/verify` with code
3. Verify response contains recovery codes (list of strings)
4. **IMPORTANT:** Save recovery codes securely
5. Verify 2FA is now enabled in database
6. Logout

**Expected Results:**
- ✅ 2FA verification successful
- ✅ Recovery codes returned (save these!)
- ✅ 2FA enabled in database
- ✅ User can logout

**Error Cases to Test:**
- ❌ Invalid TOTP code → Should show error
- ❌ Expired code → Should show error

---

### 2.3 Login with 2FA Enabled

**Test Steps:**
1. Try to login with username/password only
2. Verify error: "Two-factor authentication required"
3. Get current TOTP code from authenticator app
4. Login with username, password, and TOTP code
5. Verify successful login

**Expected Results:**
- ✅ Login without 2FA code fails
- ✅ Login with valid TOTP code succeeds
- ✅ Token received and stored

**Alternative: Login with Recovery Code**

**Test Steps:**
1. Use a recovery code instead of TOTP code
2. Login with username, password, and recovery code
3. Verify successful login
4. Verify used recovery code is removed from database

**Expected Results:**
- ✅ Login with recovery code succeeds
- ✅ Recovery code is one-time use (removed after use)

---

### 2.4 Disable 2FA

**Test Steps:**
1. Login with 2FA enabled
2. Call `POST /api/benutzer/2fa/disable`
3. Verify 2FA disabled in database
4. Logout
5. Login again with only username/password (no 2FA code)
6. Verify login succeeds

**Expected Results:**
- ✅ 2FA disabled successfully
- ✅ Login without 2FA code works
- ✅ Secret and recovery codes cleared from database

---

## 3. User Flow Testing

### 3.1 Browse Available Equipment

**Test Steps:**
1. Login as regular user
2. Navigate to dashboard (`#equipments-dashboard`)
3. Verify available equipment list loads
4. Verify equipment cards display:
   - Inventory number
   - Description
   - Status (should be AVAILABLE)
   - Category
   - Condition
5. Check browser console for errors

**Expected Results:**
- ✅ Equipment list loads
- ✅ Only AVAILABLE equipment shown
- ✅ Equipment details displayed correctly
- ✅ No console errors

---

### 3.2 Search and Filter Equipment

**Test Steps:**
1. On dashboard, use search functionality (if implemented)
2. Test search by:
   - Inventory number
   - Description
   - Category
   - Status
   - Location
3. Verify filtered results
4. Test pagination (if multiple pages)

**Expected Results:**
- ✅ Search returns correct results
- ✅ Filters work correctly
- ✅ Pagination works (if applicable)

---

### 3.3 Borrow Equipment

**Test Steps:**
1. Select an available equipment item
2. Click "Borrow" button
3. Optionally set expected return date
4. Verify success message/notification
5. Verify equipment removed from available list
6. Verify equipment appears in "Your Loans" section
7. Verify equipment status changed to BORROWED in database
8. Verify audit log entry created

**Expected Results:**
- ✅ Equipment borrowed successfully
- ✅ Equipment no longer in available list
- ✅ Equipment appears in user's loans
- ✅ Status updated to BORROWED
- ✅ Audit log entry created with action BORROW

**Error Cases to Test:**
- ❌ Try to borrow already borrowed equipment → Should fail
- ❌ Try to borrow equipment with status MAINTENANCE → Should fail

---

### 3.4 Return Equipment

**Test Steps:**
1. Navigate to "Your Loans" section
2. Find borrowed equipment
3. Click "Return" button
4. Verify success message
5. Verify equipment removed from loans list
6. Verify equipment appears back in available list
7. Verify equipment status changed to AVAILABLE
8. Verify audit log entry created with return date

**Expected Results:**
- ✅ Equipment returned successfully
- ✅ Equipment removed from loans
- ✅ Equipment back in available list
- ✅ Status updated to AVAILABLE
- ✅ Audit log entry created with action RETURN

**Error Cases to Test:**
- ❌ Try to return equipment not borrowed by user → Should fail

---

### 3.5 View Profile

**Test Steps:**
1. Navigate to profile page (if available)
2. Verify profile information displayed:
   - Username
   - First Name
   - Last Name
   - Email (if set)
   - Role
   - Account Status
   - Last Login
   - 2FA Status
3. Verify data matches database

**Expected Results:**
- ✅ Profile information displayed correctly
- ✅ All fields match database values

---

### 3.6 Update Profile

**Test Steps:**
1. Navigate to profile page
2. Update:
   - First Name
   - Last Name
   - Email
3. Submit changes
4. Verify success message
5. Verify changes reflected in UI
6. Verify changes saved in database
7. Verify `updatedAt` timestamp updated

**Expected Results:**
- ✅ Profile updated successfully
- ✅ Changes reflected immediately
- ✅ Database updated
- ✅ Timestamp updated

**Error Cases to Test:**
- ❌ Try to use existing email → Should show error
- ❌ Invalid email format → Should show validation error

---

## 4. Admin Flow Testing

### 4.1 Admin Login

**Test Steps:**
1. Login with admin account (role: ADMIN)
2. Verify admin dashboard accessible
3. Verify admin-specific navigation visible
4. Verify regular user endpoints still accessible

**Expected Results:**
- ✅ Admin login successful
- ✅ Admin dashboard accessible
- ✅ Admin features visible

---

### 4.2 User Management

**Test Steps:**
1. Navigate to "User Management" in admin dashboard
2. Verify all users listed
3. Test search users:
   - By username
   - By email
   - By role
   - By account status
4. Test update user:
   - Change role (USER ↔ ADMIN)
   - Change account status (ACTIVE, INACTIVE, SUSPENDED)
5. Test delete user:
   - Try to delete user with active loans → Should fail
   - Delete user without active loans → Should succeed

**Expected Results:**
- ✅ All users displayed
- ✅ Search works correctly
- ✅ User updates successful
- ✅ Cannot delete user with active loans
- ✅ User deletion successful when no active loans

---

### 4.3 Equipment Management

**Test Steps:**
1. Navigate to "Equipment Management"
2. Verify all equipment listed
3. Test add equipment:
   - Fill required fields (inventory number, description)
   - Add optional fields (category, location, serial number, etc.)
   - Submit
   - Verify equipment created
4. Test update equipment:
   - Modify description, category, status, condition, location
   - Submit
   - Verify changes saved
5. Test delete equipment:
   - Delete equipment
   - Verify removed from list
6. Test search/filter equipment (same as user search)

**Expected Results:**
- ✅ Equipment CRUD operations work
- ✅ All fields saved correctly
- ✅ Search/filter works
- ✅ Equipment deletion successful

---

### 4.4 Loan Management

**Test Steps:**
1. Navigate to "Current Loans"
2. Verify all active loans displayed
3. Verify loan information:
   - User name
   - Equipment details
   - Borrow date
   - Expected return date
4. Navigate to "Loan History"
5. Verify all historical loans displayed
6. Verify return dates shown
7. Navigate to "Overdue Loans"
8. Verify only overdue loans shown (expected return date < today)

**Expected Results:**
- ✅ Current loans displayed correctly
- ✅ Loan history displayed correctly
- ✅ Overdue loans filtered correctly
- ✅ All loan details accurate

---

## 5. Error Handling Testing

### 5.1 Network Errors

**Test Steps:**
1. Stop backend server
2. Try to login
3. Try to fetch equipment
4. Verify appropriate error messages shown
5. Restart backend
6. Verify app recovers

**Expected Results:**
- ✅ Network errors handled gracefully
- ✅ User-friendly error messages
- ✅ App recovers when backend available

---

### 5.2 Invalid Token

**Test Steps:**
1. Login successfully
2. Manually corrupt token in sessionStorage
3. Try to access protected endpoint
4. Verify redirect to login
5. Verify session cleared

**Expected Results:**
- ✅ Invalid tokens detected
- ✅ User redirected to login
- ✅ Session cleared

---

### 5.3 Unauthorized Access

**Test Steps:**
1. Login as regular user
2. Try to access admin endpoints directly (via API or URL manipulation)
3. Verify 403 Forbidden or redirect
4. Verify error message shown

**Expected Results:**
- ✅ Unauthorized access blocked
- ✅ Appropriate error response
- ✅ User cannot access admin features

---

## 6. Edge Cases and Boundary Testing

### 6.1 Empty States

**Test Steps:**
1. Create fresh database (no equipment)
2. Login as user
3. Verify empty state message shown
4. Verify UI handles empty states gracefully

**Expected Results:**
- ✅ Empty states displayed with helpful messages
- ✅ No errors or crashes

---

### 6.2 Large Datasets

**Test Steps:**
1. Create 100+ equipment items
2. Create 50+ users
3. Test pagination
4. Test search performance
5. Verify app remains responsive

**Expected Results:**
- ✅ Pagination works correctly
- ✅ Search performs well
- ✅ UI remains responsive

---

### 6.3 Concurrent Operations

**Test Steps:**
1. Open app in two browser windows
2. Login as same user in both
3. Borrow equipment in window 1
4. Try to borrow same equipment in window 2
5. Verify appropriate error handling

**Expected Results:**
- ✅ Concurrent operations handled correctly
- ✅ Race conditions prevented
- ✅ Appropriate error messages

---

## 7. Browser Compatibility Testing

**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Steps:**
1. Test all major flows in each browser
2. Verify consistent behavior
3. Check for browser-specific issues

**Expected Results:**
- ✅ Consistent behavior across browsers
- ✅ No browser-specific errors

---

## 8. Mobile Responsiveness Testing

**Test Steps:**
1. Open app on mobile device or use browser dev tools
2. Test all major flows:
   - Registration
   - Login
   - Browse equipment
   - Borrow/return
   - Admin dashboard
3. Verify UI adapts correctly
4. Verify touch interactions work

**Expected Results:**
- ✅ UI responsive on mobile
- ✅ Touch interactions work
- ✅ All features accessible

---

## 9. Performance Testing

### 9.1 Load Time

**Test Steps:**
1. Measure initial page load time
2. Measure API response times
3. Verify acceptable performance (< 2s for initial load)

**Expected Results:**
- ✅ Fast initial load
- ✅ Quick API responses
- ✅ Acceptable performance metrics

---

### 9.2 Memory Leaks

**Test Steps:**
1. Use browser dev tools memory profiler
2. Perform multiple operations (login, browse, borrow, return)
3. Monitor memory usage
4. Verify no memory leaks

**Expected Results:**
- ✅ No memory leaks detected
- ✅ Memory usage stable

---

## 10. Security Testing

### 10.1 XSS Prevention

**Test Steps:**
1. Try to inject scripts in input fields
2. Verify scripts not executed
3. Verify input sanitized

**Expected Results:**
- ✅ XSS attacks prevented
- ✅ Input sanitized

---

### 10.2 CSRF Protection

**Test Steps:**
1. Verify JWT tokens used for authentication
2. Verify tokens not exposed in URLs
3. Verify proper CORS configuration

**Expected Results:**
- ✅ CSRF protection in place
- ✅ Tokens secure
- ✅ CORS configured correctly

---

## Test Checklist Summary

### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Session management
- [ ] Token expiration

### 2FA
- [ ] Enable 2FA
- [ ] Verify 2FA
- [ ] Login with TOTP code
- [ ] Login with recovery code
- [ ] Disable 2FA

### User Flows
- [ ] Browse equipment
- [ ] Search/filter equipment
- [ ] Borrow equipment
- [ ] Return equipment
- [ ] View profile
- [ ] Update profile

### Admin Flows
- [ ] Admin login
- [ ] User management (CRUD, search)
- [ ] Equipment management (CRUD, search)
- [ ] Loan management (current, history, overdue)

### Error Handling
- [ ] Network errors
- [ ] Invalid tokens
- [ ] Unauthorized access
- [ ] Validation errors

### Edge Cases
- [ ] Empty states
- [ ] Large datasets
- [ ] Concurrent operations

### Compatibility
- [ ] Browser compatibility
- [ ] Mobile responsiveness

### Performance
- [ ] Load times
- [ ] Memory usage

### Security
- [ ] XSS prevention
- [ ] CSRF protection

---

## Reporting Issues

When reporting issues, include:
1. **Test case**: Which test failed
2. **Steps to reproduce**: Detailed steps
3. **Expected result**: What should happen
4. **Actual result**: What actually happened
5. **Environment**: Browser, OS, backend version
6. **Console errors**: Any JavaScript errors
7. **Network errors**: Any API errors
8. **Screenshots**: If applicable

---

## Automated Testing (Future)

Consider implementing:
- Unit tests for API endpoints
- Integration tests for flows
- E2E tests with Playwright/Cypress
- Performance tests
- Security scans

---

**Last Updated:** 2024-12-07  
**Version:** 1.0

