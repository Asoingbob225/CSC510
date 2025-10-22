# System Test Cases

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** System Test Cases  
**Version:** 1.0  
**Date:** October 21, 2025  
**Author:** QA Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Case Format](#2-test-case-format)
3. [Authentication Test Cases](#3-authentication-test-cases)
4. [Health Profile Test Cases](#4-health-profile-test-cases)
5. [Recommendation Test Cases](#5-recommendation-test-cases)
6. [Meal Planning Test Cases](#6-meal-planning-test-cases)
7. [Progress Tracking Test Cases](#7-progress-tracking-test-cases)
8. [Professional Features Test Cases](#8-professional-features-test-cases)
9. [Test Execution Matrix](#9-test-execution-matrix)

---

## 1. Introduction

### 1.1 Purpose

This document contains detailed system test cases mapped to the use cases defined in the SRS. Each test case validates end-to-end functionality from the user's perspective.

### 1.2 Scope

These test cases cover:

- Functional validation of all use cases
- Integration between system components
- User workflows and scenarios
- Error handling and edge cases
- Performance under normal conditions

### 1.3 Test Environment

- **Browser:** Chrome (latest), Firefox (latest), Safari (latest)
- **Database:** PostgreSQL with test data
- **API:** Full backend services running
- **Test Data:** Predefined test users and meal data

## 2. Test Case Format

```
STC-XXX: Test Case Title
Use Case: UC-XXX
Priority: [Critical|High|Medium|Low]
Type: [Positive|Negative|Edge Case]

Prerequisites:
- Condition 1
- Condition 2

Test Steps:
1. Step description
   Expected: Expected result
2. Step description
   Expected: Expected result

Test Data:
- Data item 1
- Data item 2

Pass Criteria:
- Criteria 1
- Criteria 2
```

## 3. Authentication Test Cases

### STC-001: Successful User Registration

**Use Case:** UC-001  
**Priority:** Critical  
**Type:** Positive

**Prerequisites:**

- User is on registration page
- Email not previously registered

**Test Steps:**

1. Enter valid username "testuser123"
   - Expected: Username accepted, no error
2. Enter valid email "test@example.com"
   - Expected: Email accepted, format validated
3. Enter password "SecurePass123!"
   - Expected: Password meets all requirements
4. Click "Register" button
   - Expected: Success message displayed
5. Check email inbox
   - Expected: Verification email received within 5 minutes

**Test Data:**

- Username: testuser123
- Email: test@example.com
- Password: SecurePass123!

**Pass Criteria:**

- User account created in database
- Verification email sent
- User cannot login until verified

---

### STC-002: Registration with Duplicate Email

**Use Case:** UC-001  
**Priority:** High  
**Type:** Negative

**Prerequisites:**

- Email "existing@example.com" already registered

**Test Steps:**

1. Enter new username "newuser456"
   - Expected: Accepted
2. Enter existing email "existing@example.com"
   - Expected: Accepted initially
3. Enter valid password
   - Expected: Accepted
4. Click "Register" button
   - Expected: Error message "Email already registered"

**Pass Criteria:**

- No duplicate account created
- Clear error message displayed
- User can try different email

---

### STC-003: Email Verification Process

**Use Case:** UC-001, UC-002  
**Priority:** Critical  
**Type:** Positive

**Prerequisites:**

- User registered but not verified
- Verification email received

**Test Steps:**

1. Open verification email
   - Expected: Email contains verification link
2. Click verification link
   - Expected: Redirected to verification page
3. Check success message
   - Expected: "Email verified successfully"
4. Try to login
   - Expected: Login successful

**Pass Criteria:**

- User marked as verified in database
- Can access all features after verification
- Verification link only works once

---

### STC-004: Password Reset Flow

**Use Case:** UC-003  
**Priority:** High  
**Type:** Positive

**Prerequisites:**

- User has verified account
- User on login page

**Test Steps:**

1. Click "Forgot Password" link
   - Expected: Password reset page opens
2. Enter registered email
   - Expected: Email accepted
3. Click "Send Reset Link"
   - Expected: Success message displayed
4. Check email for reset link
   - Expected: Email received within 5 minutes
5. Click reset link
   - Expected: Password reset form opens
6. Enter new password "NewSecure456!"
   - Expected: Password accepted
7. Confirm new password
   - Expected: Passwords match
8. Submit form
   - Expected: "Password updated successfully"
9. Login with new password
   - Expected: Login successful

**Pass Criteria:**

- Old password no longer works
- New password meets requirements
- Reset link expires after use

---

## 4. Health Profile Test Cases

### STC-005: Create Comprehensive Health Profile

**Use Case:** UC-004  
**Priority:** Critical  
**Type:** Positive

**Prerequisites:**

- User logged in
- First time creating profile

**Test Steps:**

1. Navigate to Health Profile
   - Expected: Empty profile form displayed
2. Enter height: 170 cm
   - Expected: Accepted, BMI calculated
3. Enter weight: 70 kg
   - Expected: Accepted, BMI updated
4. Select activity level: "Moderate"
   - Expected: Calorie needs calculated
5. Add allergy: "Peanuts" with severity "Severe"
   - Expected: Allergy added to list
6. Add medical condition: "Type 2 Diabetes"
   - Expected: Condition added, dietary adjustments shown
7. Add medication: "Metformin"
   - Expected: Medication recorded
8. Set dietary preference: "Vegetarian"
   - Expected: Preference saved
9. Save profile
   - Expected: Success message, profile saved

**Test Data:**

- Height: 170 cm
- Weight: 70 kg
- Activity: Moderate
- Allergy: Peanuts (Severe)
- Condition: Type 2 Diabetes
- Medication: Metformin
- Diet: Vegetarian

**Pass Criteria:**

- All data saved correctly
- Calculations accurate
- Profile influences recommendations

---

### STC-006: Update Biometric Data

**Use Case:** UC-005  
**Priority:** Medium  
**Type:** Positive

**Prerequisites:**

- User has existing health profile

**Test Steps:**

1. Navigate to Health Profile
   - Expected: Current data displayed
2. Update weight from 70kg to 68kg
   - Expected: BMI recalculated
3. Add new allergy: "Shellfish"
   - Expected: Added to allergy list
4. Save changes
   - Expected: Success message
5. Navigate away and return
   - Expected: Updated data persists

**Pass Criteria:**

- Updates saved to database
- Historical data preserved
- New calculations accurate

---

### STC-007: Manage Multiple Allergies

**Use Case:** UC-006  
**Priority:** Critical  
**Type:** Positive

**Prerequisites:**

- User logged in with profile

**Test Steps:**

1. Go to Allergies section
   - Expected: Current allergies listed
2. Add "Tree nuts" - Severe
   - Expected: Added to list
3. Add "Dairy" - Mild
   - Expected: Added to list
4. Add "Gluten" - Moderate
   - Expected: Added to list
5. Remove "Dairy"
   - Expected: Removed from list
6. Change "Gluten" severity to Severe
   - Expected: Severity updated
7. Save changes
   - Expected: All changes saved

**Pass Criteria:**

- All allergies correctly stored
- Severity levels maintained
- Changes immediately affect recommendations

---

## 5. Recommendation Test Cases

### STC-008: Get Safe Meal Recommendations

**Use Case:** UC-008  
**Priority:** Critical  
**Type:** Positive

**Prerequisites:**

- User has profile with peanut allergy
- Location services enabled

**Test Steps:**

1. Click "Get Recommendations"
   - Expected: Recommendation page opens
2. Select meal type: "Lunch"
   - Expected: Lunch options selected
3. Set location radius: 5 miles
   - Expected: Map shows radius
4. Click "Find Meals"
   - Expected: Loading indicator
5. View results
   - Expected: 10+ meal options displayed
6. Check each meal
   - Expected: NO meals contain peanuts
7. View meal details
   - Expected: Nutrition info displayed
8. Check allergen warnings
   - Expected: "Peanut-free" badge visible

**Pass Criteria:**

- Zero allergen violations
- All meals within distance
- Nutritional requirements met

---

### STC-009: Filter Recommendations

**Use Case:** UC-008, UC-009  
**Priority:** High  
**Type:** Positive

**Prerequisites:**

- Recommendations displayed

**Test Steps:**

1. Apply cuisine filter: "Italian"
   - Expected: Only Italian meals shown
2. Set max calories: 600
   - Expected: High-calorie meals filtered out
3. Set price range: $10-$20
   - Expected: Meals in range only
4. Apply vegetarian filter
   - Expected: Only vegetarian meals
5. Sort by distance
   - Expected: Nearest first
6. Clear all filters
   - Expected: All meals return

**Pass Criteria:**

- Filters work correctly
- Multiple filters combine properly
- Results update immediately

---

### STC-010: View Recommendation Explanation

**Use Case:** UC-008  
**Priority:** Medium  
**Type:** Positive

**Prerequisites:**

- Recommendations displayed

**Test Steps:**

1. Click "Why recommended?" on a meal
   - Expected: Explanation panel opens
2. View matching criteria
   - Expected: Shows "Matches vegetarian preference"
3. View nutritional alignment
   - Expected: Shows goal progress
4. View safety confirmation
   - Expected: "Free from your allergens"
5. Check confidence score
   - Expected: Percentage displayed

**Pass Criteria:**

- Explanations are accurate
- All factors considered
- Easy to understand

---

## 6. Meal Planning Test Cases

### STC-011: Create Weekly Meal Plan

**Use Case:** UC-009  
**Priority:** Medium  
**Type:** Positive

**Prerequisites:**

- User has health profile
- Recommendations available

**Test Steps:**

1. Go to Meal Planning
   - Expected: Weekly calendar view
2. Drag recommended meal to Monday lunch
   - Expected: Meal added to slot
3. Add meals for all weekdays
   - Expected: Each slot filled
4. View weekly nutrition summary
   - Expected: Totals calculated correctly
5. Check allergy safety
   - Expected: All meals safe
6. Save meal plan
   - Expected: Plan saved successfully

**Pass Criteria:**

- Plan respects all restrictions
- Nutritional balance achieved
- Can modify plan later

---

### STC-012: Generate Shopping List

**Use Case:** UC-010  
**Priority:** Medium  
**Type:** Positive

**Prerequisites:**

- Weekly meal plan created

**Test Steps:**

1. Click "Generate Shopping List"
   - Expected: Processing indicator
2. View generated list
   - Expected: All ingredients listed
3. Check quantities
   - Expected: Correctly aggregated
4. Check organization
   - Expected: Grouped by store section
5. Print preview
   - Expected: Printer-friendly format
6. Export to phone
   - Expected: Mobile-friendly version

**Pass Criteria:**

- Complete ingredient list
- Accurate quantities
- No allergens included

---

### STC-013: Track Meal Consumption

**Use Case:** UC-011  
**Priority:** Low  
**Type:** Positive

**Prerequisites:**

- Active meal plan

**Test Steps:**

1. Mark breakfast as consumed
   - Expected: Logged with timestamp
2. Rate meal 4 stars
   - Expected: Rating saved
3. Add notes "Too salty"
   - Expected: Notes saved
4. View daily summary
   - Expected: Shows consumed meals
5. Check nutritional progress
   - Expected: Updates based on consumption

**Pass Criteria:**

- Accurate tracking
- Progress calculations correct
- History maintained

---

## 7. Progress Tracking Test Cases

### STC-014: View Nutritional Analytics

**Use Case:** UC-015  
**Priority:** Medium  
**Type:** Positive

**Prerequisites:**

- User has 7+ days of meal data

**Test Steps:**

1. Go to Progress Analytics
   - Expected: Dashboard opens
2. View calorie trend chart
   - Expected: 7-day graph displayed
3. Check macro breakdown
   - Expected: Pie chart of protein/carbs/fat
4. View goal progress
   - Expected: Progress bars for each goal
5. Generate weekly report
   - Expected: PDF report created
6. Compare to previous week
   - Expected: Comparison stats shown

**Pass Criteria:**

- Accurate calculations
- Clear visualizations
- Exportable reports

---

### STC-015: Share Progress

**Use Case:** UC-016  
**Priority:** Low  
**Type:** Positive

**Prerequisites:**

- Progress data available

**Test Steps:**

1. Click "Share Progress"
   - Expected: Sharing options displayed
2. Select "Share to Community"
   - Expected: Privacy options shown
3. Choose "Share summary only"
   - Expected: Preview displayed
4. Add caption
   - Expected: Text added
5. Confirm share
   - Expected: Posted to community
6. View shared post
   - Expected: Visible to allowed users only

**Pass Criteria:**

- Privacy settings respected
- No sensitive data exposed
- Can delete shared content

---

## 8. Professional Features Test Cases

### STC-016: Connect with Nutritionist

**Use Case:** UC-018  
**Priority:** Low  
**Type:** Positive

**Prerequisites:**

- Premium account
- Nutritionist available

**Test Steps:**

1. Browse nutritionist profiles
   - Expected: List of professionals
2. Filter by specialty: "Diabetes"
   - Expected: Filtered results
3. View nutritionist profile
   - Expected: Credentials displayed
4. Request consultation
   - Expected: Booking calendar shown
5. Select time slot
   - Expected: Slot reserved
6. Receive confirmation
   - Expected: Email and in-app notification

**Pass Criteria:**

- Booking successful
- Calendar synchronized
- Notifications sent

---

## 9. Test Execution Matrix

### Test Priority Matrix

| Priority | Test Cases                  | Execution Frequency |
| -------- | --------------------------- | ------------------- |
| Critical | STC-001, 003, 005, 007, 008 | Every build         |
| High     | STC-002, 004, 006, 009      | Daily               |
| Medium   | STC-010, 011, 012, 014      | Weekly              |
| Low      | STC-013, 015, 016           | Release             |

### Test Coverage Mapping

| Use Case | Test Cases        | Coverage |
| -------- | ----------------- | -------- |
| UC-001   | STC-001, 002, 003 | 100%     |
| UC-002   | STC-003           | 100%     |
| UC-003   | STC-004           | 100%     |
| UC-004   | STC-005           | 100%     |
| UC-005   | STC-006           | 100%     |
| UC-006   | STC-007           | 100%     |
| UC-008   | STC-008, 009, 010 | 100%     |
| UC-009   | STC-011           | 100%     |
| UC-010   | STC-012           | 100%     |
| UC-011   | STC-013           | 100%     |
| UC-015   | STC-014           | 100%     |
| UC-016   | STC-015           | 100%     |
| UC-018   | STC-016           | 100%     |

### Test Environment Requirements

| Component | Requirement                         |
| --------- | ----------------------------------- |
| Database  | 1000+ test meals, 50+ test users    |
| API       | All endpoints functional            |
| External  | Email service, Location service     |
| Browser   | Chrome 90+, Firefox 88+, Safari 14+ |
| Network   | Stable connection, <100ms latency   |

### Risk-Based Test Prioritization

1. **Allergen Safety Tests** (Critical)
   - Must pass 100% before any release
   - No tolerance for failures

2. **Authentication Tests** (Critical)
   - Security implications
   - User access control

3. **Core Functionality** (High)
   - Recommendations
   - Profile management

4. **Enhancement Features** (Medium/Low)
   - Planning tools
   - Social features

---

**Document Status:** COMPLETE  
**Last Review:** October 21, 2025  
**Next Review:** Before Sprint 1 Testing

**Approval:**

- QA Lead: ******\_\_\_****** Date: **\_\_\_\_**
- Development Lead: ******\_\_\_****** Date: **\_\_\_\_**
