# Test Cases

**Document Version**: 2.0  
**Last Updated**: October 25, 2025  
**Purpose**: Map functional requirements to specific test cases with traceability

---

## Document Overview

This document provides comprehensive test cases that map to functional requirements (FR-XXX), use cases (UC-XXX), and non-functional requirements (NFR-XXX). Each test case links to actual test implementation files in the codebase.

**Version 2.0 Updates**:
- Added 18 new test cases (TC-023 to TC-040) for Mental Wellness features
- Expanded coverage to include Dual-Dimension Health functionality
- Total test cases increased from 22 to 40 (82% growth)
- New modules: Mental Wellness Management, Health Tagging System, Dual-Dimension Recommendations, AI Health Concierge
- All new test cases trace to FR-076 through FR-095 and UC-021 through UC-032

### Test Status Legend
- ✅ **Pass**: Test executed successfully
- ❌ **Fail**: Test failed, requires investigation
- ⏳ **Pending**: Test not yet implemented
- 🚧 **In Progress**: Test under development

### Test Priority
- **P0**: Critical - Must pass for release
- **P1**: High - Important functionality
- **P2**: Medium - Standard features
- **P3**: Low - Nice-to-have features

---

## Test Case Template

```
### TC-XXX: Test Case Title
**Traces to**: FR-XXX, UC-XXX
**Priority**: P0/P1/P2/P3
**Status**: ✅/❌/⏳/🚧
**Test File**: `backend/tests/path/to/test_file.py::test_function_name`

**Prerequisites**:
- List of preconditions

**Test Steps**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
- Expected outcome

**Actual Result** (if failed):
- What actually happened

**Test Data**:
- Sample input data
```

---

## Module 1: Authentication & User Management

### TC-001: User Registration with Valid Data
**Traces to**: FR-001 (User Registration), UC-001 (User Account Creation)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_register_user`

**Prerequisites**:
- Database is accessible
- Email service is configured
- No existing user with test email

**Test Steps**:
1. Send POST request to `/api/auth/register`
2. Provide valid user data:
   - `username`: "testuser" (3-20 chars, alphanumeric)
   - `email`: "test@example.com" (valid email format)
   - `password`: "SecurePass123!" (meets complexity requirements)
3. Check response status code

**Expected Result**:
- HTTP 201 Created
- Response contains user data without password
- User record created in database
- Verification email sent

**Test Data**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

---

### TC-002: User Registration with Duplicate Email
**Traces to**: FR-001 (User Registration)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_register_duplicate_email`

**Prerequisites**:
- User with email "existing@example.com" already exists

**Test Steps**:
1. Attempt to register new user with existing email
2. Send POST request to `/api/auth/register`
3. Check response

**Expected Result**:
- HTTP 400 Bad Request
- Error message: "Email already registered"
- No new user created

---

### TC-003: User Registration with Invalid Password
**Traces to**: FR-001 (User Registration), FR-003 (Password Management)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_register_weak_password`

**Prerequisites**:
- None

**Test Steps**:
1. Send POST request with weak password
2. Test multiple invalid passwords:
   - Too short: "Pass1!"
   - No uppercase: "password123!"
   - No digit: "Password!"
   - No special char: "Password123"

**Expected Result**:
- HTTP 422 Unprocessable Entity
- Validation error message explaining password requirements
- No user created

---

### TC-004: Email Verification Success
**Traces to**: FR-001 (User Registration)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_verify_email`

**Prerequisites**:
- Unverified user exists
- Valid verification token available

**Test Steps**:
1. Send GET request to `/api/auth/verify-email/{token}`
2. Use valid, unexpired token
3. Check response

**Expected Result**:
- HTTP 200 OK
- User's `is_verified` field set to True
- Success message returned

---

### TC-005: Email Verification with Expired Token
**Traces to**: FR-001 (User Registration)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: To be implemented

**Prerequisites**:
- User with expired verification token

**Test Steps**:
1. Generate verification token
2. Wait for token to expire (24 hours)
3. Attempt verification with expired token

**Expected Result**:
- HTTP 400 Bad Request
- Error message: "Verification token expired"
- User remains unverified

---

### TC-006: User Login with Valid Credentials
**Traces to**: FR-004 (User Authentication), UC-002 (User Login)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_login_user`

**Prerequisites**:
- Verified user exists with known credentials

**Test Steps**:
1. Send POST request to `/api/auth/login`
2. Provide valid credentials:
   - `email`: "verified@example.com"
   - `password`: "CorrectPassword123!"
3. Check response

**Expected Result**:
- HTTP 200 OK
- Response contains JWT `access_token`
- Token is valid and can be used for protected endpoints

**Test Data**:
```json
{
  "email": "verified@example.com",
  "password": "CorrectPassword123!"
}
```

---

### TC-007: User Login with Unverified Account
**Traces to**: FR-004 (User Authentication)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_login_unverified`

**Prerequisites**:
- Unverified user exists

**Test Steps**:
1. Attempt login with unverified account
2. Provide correct credentials

**Expected Result**:
- HTTP 403 Forbidden
- Error message: "Email not verified"
- No token issued

---

### TC-008: User Login with Incorrect Password
**Traces to**: FR-004 (User Authentication)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_login_wrong_password`

**Prerequisites**:
- Verified user exists

**Test Steps**:
1. Attempt login with wrong password
2. Use correct email, incorrect password

**Expected Result**:
- HTTP 401 Unauthorized
- Error message: "Incorrect email or password"
- No token issued

---

### TC-009: Access Protected Endpoint with Valid Token
**Traces to**: FR-004 (User Authentication)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_get_current_user`

**Prerequisites**:
- Valid JWT token available

**Test Steps**:
1. Send GET request to `/api/users/me`
2. Include `Authorization: Bearer {token}` header
3. Check response

**Expected Result**:
- HTTP 200 OK
- Response contains current user profile
- User data matches authenticated user

---

### TC-010: Access Protected Endpoint without Token
**Traces to**: FR-004 (User Authentication)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_protected_endpoint_no_token`

**Prerequisites**:
- None

**Test Steps**:
1. Send GET request to `/api/users/me`
2. Do not include Authorization header

**Expected Result**:
- HTTP 401 Unauthorized
- Error message: "Not authenticated"

---

## Module 2: Health Profile Management

### TC-011: Create Health Profile
**Traces to**: FR-005 (Profile Creation Wizard), UC-003 (Health Profile Setup)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_create_health_profile`

**Prerequisites**:
- Authenticated user without existing health profile

**Test Steps**:
1. Send POST request to `/api/health-profiles`
2. Include valid JWT token
3. Provide health profile data:
   - `height_cm`: 170
   - `weight_kg`: 70
   - `activity_level`: "moderate"
   - `dietary_preferences`: ["vegetarian"]
   - `health_goals`: ["weight_loss"]

**Expected Result**:
- HTTP 201 Created
- Health profile created and linked to user
- Response contains profile ID

**Test Data**:
```json
{
  "height_cm": 170,
  "weight_kg": 70,
  "activity_level": "moderate",
  "dietary_preferences": ["vegetarian"],
  "health_goals": ["weight_loss"]
}
```

---

### TC-012: Update Health Profile
**Traces to**: FR-005 (Profile Creation Wizard)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_update_health_profile`

**Prerequisites**:
- User has existing health profile

**Test Steps**:
1. Send PUT request to `/api/health-profiles/{profile_id}`
2. Include valid JWT token
3. Provide updated data

**Expected Result**:
- HTTP 200 OK
- Profile updated in database
- Response shows updated values

---

### TC-013: Get Health Profile
**Traces to**: FR-005 (Profile Creation Wizard)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_get_health_profile`

**Prerequisites**:
- User has existing health profile

**Test Steps**:
1. Send GET request to `/api/health-profiles/me`
2. Include valid JWT token

**Expected Result**:
- HTTP 200 OK
- Response contains user's health profile
- All fields populated correctly

---

### TC-014: Delete Health Profile
**Traces to**: FR-005 (Profile Creation Wizard)  
**Priority**: P2  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_delete_health_profile`

**Prerequisites**:
- User has existing health profile

**Test Steps**:
1. Send DELETE request to `/api/health-profiles/{profile_id}`
2. Include valid JWT token

**Expected Result**:
- HTTP 204 No Content
- Profile removed from database
- User's `health_profile_id` set to NULL

---

## Module 3: Allergy & Dietary Management

### TC-015: Add User Allergy
**Traces to**: FR-010 (Allergy Management), UC-006 (Allergy Declaration)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_add_user_allergy`

**Prerequisites**:
- Authenticated user
- Allergen exists in database

**Test Steps**:
1. Send POST request to `/api/allergies/user`
2. Include valid JWT token
3. Provide allergy data:
   - `allergen_id`: Valid allergen ID
   - `severity`: "moderate"
   - `symptoms`: "Itching, hives"

**Expected Result**:
- HTTP 201 Created
- Allergy record created
- Response contains allergy ID

**Test Data**:
```json
{
  "allergen_id": 1,
  "severity": "moderate",
  "symptoms": "Itching, hives"
}
```

---

### TC-016: Get User Allergies
**Traces to**: FR-010 (Allergy Management)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_get_user_allergies`

**Prerequisites**:
- User has at least one allergy recorded

**Test Steps**:
1. Send GET request to `/api/allergies/user/me`
2. Include valid JWT token

**Expected Result**:
- HTTP 200 OK
- Response contains list of user allergies
- Each allergy includes severity and symptoms

---

### TC-017: Delete User Allergy
**Traces to**: FR-010 (Allergy Management)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_delete_user_allergy`

**Prerequisites**:
- User has existing allergy record

**Test Steps**:
1. Send DELETE request to `/api/allergies/user/{allergy_id}`
2. Include valid JWT token

**Expected Result**:
- HTTP 204 No Content
- Allergy removed from database

---

### TC-018: Add Dietary Preference
**Traces to**: FR-011 (Dietary Preference Management), UC-007 (Dietary Preferences)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_add_dietary_preference`

**Prerequisites**:
- Authenticated user

**Test Steps**:
1. Send POST request to `/api/dietary-preferences`
2. Include valid JWT token
3. Provide preference data:
   - `preference_type`: "vegetarian"
   - `strictness`: "strict"

**Expected Result**:
- HTTP 201 Created
- Preference record created
- Response contains preference ID

**Test Data**:
```json
{
  "preference_type": "vegetarian",
  "strictness": "strict"
}
```

---

### TC-019: Get User Dietary Preferences
**Traces to**: FR-011 (Dietary Preference Management)  
**Priority**: P1  
**Status**: ✅ Pass  
**Test File**: `backend/tests/routers/test_api.py::test_get_dietary_preferences`

**Prerequisites**:
- User has at least one dietary preference

**Test Steps**:
1. Send GET request to `/api/dietary-preferences/me`
2. Include valid JWT token

**Expected Result**:
- HTTP 200 OK
- Response contains list of preferences
- Each preference includes type and strictness level

---

### TC-020: Update Dietary Preference
**Traces to**: FR-011 (Dietary Preference Management)  
**Priority**: P2  
**Status**: ⏳ Pending  
**Test File**: To be implemented

**Prerequisites**:
- User has existing dietary preference

**Test Steps**:
1. Send PUT request to `/api/dietary-preferences/{preference_id}`
2. Provide updated strictness level

**Expected Result**:
- HTTP 200 OK
- Preference updated in database

---

## Module 4: API Health & Monitoring

### TC-021: Health Check Endpoint
**Traces to**: System Requirement (SR-001)  
**Priority**: P0  
**Status**: ✅ Pass  
**Test File**: `backend/tests/test_index.py::test_health_check`

**Prerequisites**:
- Backend service running

**Test Steps**:
1. Send GET request to `/health`
2. No authentication required

**Expected Result**:
- HTTP 200 OK
- Response: `{"status": "healthy"}`

---

### TC-022: Root Endpoint
**Traces to**: System Requirement (SR-002)  
**Priority**: P2  
**Status**: ✅ Pass  
**Test File**: `backend/tests/test_index.py::test_root`

**Prerequisites**:
- Backend service running

**Test Steps**:
1. Send GET request to `/`

**Expected Result**:
- HTTP 200 OK
- Response contains API welcome message

---

## Module 6: Mental Wellness Management *(NEW FEATURE)*

### TC-023: Create Mental Wellness Goal
**Traces to**: FR-076 (Mental Wellness Goal Setting), UC-021 (Set Mental Wellness Goals)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_mental_wellness.py::test_create_mental_goal`

**Prerequisites**:
- Authenticated user
- User has health profile

**Test Steps**:
1. Send POST request to `/api/mental-wellness/goals`
2. Include valid JWT token
3. Provide goal data:
   - `goal_type`: "stress_reduction"
   - `current_level`: 7 (scale 1-10)
   - `target_level`: 4 (scale 1-10)
   - `priority`: "high"
   - `timeline_days`: 30

**Expected Result**:
- HTTP 201 Created
- Goal created with ID
- Goal integrated into recommendation engine within 1 minute
- Response shows goal details with creation timestamp

**Test Data**:
```json
{
  "goal_type": "stress_reduction",
  "current_level": 7,
  "target_level": 4,
  "priority": "high",
  "timeline_days": 30,
  "notes": "Reduce work-related stress"
}
```

---

### TC-024: Handle Multiple Mental Wellness Goals with Priority
**Traces to**: FR-076 (Mental Wellness Goal Setting), UC-021 (Set Mental Wellness Goals)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_mental_wellness.py::test_multiple_goals_priority`

**Prerequisites**:
- Authenticated user
- User has at least 2 existing mental wellness goals

**Test Steps**:
1. Create first goal: stress_reduction (priority: high)
2. Create second goal: mood_boost (priority: medium)
3. Create third goal: sleep_quality (priority: high)
4. Send GET request to `/api/mental-wellness/goals`
5. Verify goal ordering and limit enforcement

**Expected Result**:
- Maximum 5 concurrent goals allowed
- Goals returned ordered by priority (high → medium → low)
- Each goal shows progress percentage
- System warning if attempting to create 6th goal

**Test Data**:
```json
{
  "goals": [
    {"goal_type": "stress_reduction", "priority": "high"},
    {"goal_type": "mood_boost", "priority": "medium"},
    {"goal_type": "sleep_quality", "priority": "high"}
  ]
}
```

---

### TC-025: Log Daily Mood Entry
**Traces to**: FR-077 (Mood Tracking), UC-022 (Log Daily Mood)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_mood_tracking.py::test_log_mood`

**Prerequisites**:
- Authenticated user
- Mental wellness goals configured

**Test Steps**:
1. Send POST request to `/api/mood-tracking/logs`
2. Include valid JWT token
3. Provide mood data:
   - `mood_score`: 7 (scale 1-10)
   - `mood_tags`: ["happy", "energetic"]
   - `energy_level`: 8
   - `context`: "after_exercise"
   - `notes`: "Great morning workout"

**Expected Result**:
- HTTP 201 Created (within 1 second per NFR-001)
- Mood log saved with auto-timestamp
- Mood calendar updated with color-coding
- Response time < 1 second
- Log completion time < 30 seconds

**Test Data**:
```json
{
  "mood_score": 7,
  "mood_tags": ["happy", "energetic"],
  "energy_level": 8,
  "context": "after_exercise",
  "notes": "Great morning workout"
}
```

---

### TC-026: Analyze Mood Patterns Over Time
**Traces to**: FR-080 (Pattern Identification), UC-022 (Log Daily Mood)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_mood_analysis.py::test_mood_patterns`

**Prerequisites**:
- User has 14+ days of mood logs (per NFR-022)
- Sufficient data for statistical analysis

**Test Steps**:
1. Create 20 mood logs over 20 days with varying patterns
2. Send GET request to `/api/mood-tracking/patterns`
3. Include date range: last 30 days
4. Verify pattern detection algorithm

**Expected Result**:
- HTTP 200 OK
- Patterns identified with p-value < 0.05 (per NFR-022)
- Trends visible within 24 hours of logging
- Color-coded mood calendar displayed
- Confidence scores ≥ 70% for displayed insights

**Test Data**:
```json
{
  "date_range": "last_30_days",
  "min_confidence": 0.70
}
```

---

### TC-027: Track Stress Levels with Triggers
**Traces to**: FR-078 (Stress Level Monitoring), UC-023 (Track Stress Levels)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_stress_tracking.py::test_log_stress`

**Prerequisites**:
- Authenticated user
- Mental wellness goals configured

**Test Steps**:
1. Send POST request to `/api/stress-tracking/logs`
2. Include valid JWT token
3. Provide stress data:
   - `stress_level`: 8 (scale 1-10)
   - `triggers`: ["work_deadline", "lack_of_sleep"]
   - `coping_strategies`: ["deep_breathing", "short_walk"]
   - `notes`: "Project deadline tomorrow"

**Expected Result**:
- HTTP 201 Created
- Stress log saved with timestamp
- Stress trend chart updated
- Immediate meal suggestions with #StressRelief tag
- Completion time < 2 minutes

**Test Data**:
```json
{
  "stress_level": 8,
  "triggers": ["work_deadline", "lack_of_sleep"],
  "coping_strategies": ["deep_breathing", "short_walk"],
  "notes": "Project deadline tomorrow"
}
```

---

### TC-028: Identify Stress Trigger Patterns
**Traces to**: FR-081 (Wellness Pattern Detection), UC-023 (Track Stress Levels)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_stress_analysis.py::test_trigger_patterns`

**Prerequisites**:
- User has 7+ days of stress logs (minimum for pattern analysis)
- Multiple logs with similar triggers

**Test Steps**:
1. Create 15 stress logs over 14 days
2. Include repeated triggers: "work_deadline" (8 times), "social_events" (3 times)
3. Send GET request to `/api/stress-tracking/patterns`
4. Verify trigger correlation algorithm

**Expected Result**:
- HTTP 200 OK
- Top triggers identified and ranked by frequency
- Correlation with time of day/day of week
- Pattern detection after 7 days minimum
- Wellness resources triggered for consistently high stress

**Test Data**:
```json
{
  "analysis_period": "last_14_days",
  "min_occurrences": 3
}
```

---

### TC-029: Monitor Sleep Quality with Nutrition Correlation
**Traces to**: FR-079 (Sleep Quality Tracking), UC-024 (Monitor Sleep Quality)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_sleep_tracking.py::test_log_sleep`

**Prerequisites**:
- Authenticated user
- User has meal logs for correlation

**Test Steps**:
1. Send POST request to `/api/sleep-tracking/logs`
2. Include valid JWT token
3. Provide sleep data:
   - `duration_hours`: 6.5
   - `quality_score`: 5 (scale 1-10)
   - `interruptions`: 3
   - `bedtime`: "23:30"
   - `wake_time`: "06:00"
   - `felt_refreshed`: false

**Expected Result**:
- HTTP 201 Created
- Sleep log saved with date
- Daily logging completion time < 90 seconds
- Sleep-improving food suggestions displayed
- Extreme deprivation (< 4 hours) triggers wellness alert

**Test Data**:
```json
{
  "duration_hours": 6.5,
  "quality_score": 5,
  "interruptions": 3,
  "bedtime": "23:30",
  "wake_time": "06:00",
  "felt_refreshed": false
}
```

---

### TC-030: Correlate Sleep Quality with Meal Timing
**Traces to**: FR-083 (Nutrition-Wellness Correlation), UC-024 (Monitor Sleep Quality)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_sleep_analysis.py::test_meal_correlation`

**Prerequisites**:
- User has 14+ days of sleep logs (per NFR-022)
- User has meal logs with timestamps
- Minimum 10 data points for correlation (per NFR-022)

**Test Steps**:
1. Create 20 sleep logs with varying quality
2. Create corresponding meal logs (some late dinners, some early)
3. Send GET request to `/api/sleep-tracking/correlations?with=meals`
4. Verify correlation analysis algorithm

**Expected Result**:
- HTTP 200 OK
- Correlation visible after 14 days minimum
- Statistical significance: p-value < 0.05
- Sleep-improving recipes displayed with #SleepAid tag
- Confidence ≥ 70% for displayed insights
- False positive rate < 10%

**Test Data**:
```json
{
  "correlation_type": "meal_timing",
  "min_data_points": 10
}
```

---

### TC-031: View Mental Wellness Dashboard
**Traces to**: FR-082 (Mental Wellness Dashboard), UC-025 (View Mental Wellness Dashboard)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_mental_wellness.py::test_dashboard`

**Prerequisites**:
- Authenticated user
- User has mental wellness goals
- User has mood, stress, and sleep logs

**Test Steps**:
1. Send GET request to `/api/mental-wellness/dashboard`
2. Include valid JWT token
3. Verify dashboard load time

**Expected Result**:
- HTTP 200 OK
- Dashboard loads within 2 seconds (per NFR-001)
- Composite wellness score displayed (0-100)
- Mood calendar with color-coding visible
- Stress timeline chart rendered
- Sleep trends graph shown
- Goal progress bars with percentages
- Key insights refreshed daily
- Export to PDF option available

**Test Data**:
```json
{
  "date_range": "last_30_days",
  "include_insights": true
}
```

---

## Module 7: Health Tagging System *(NEW FEATURE)*

### TC-032: Filter Foods by Health Tags
**Traces to**: FR-087 (Tag-based Food Filtering), UC-026 (Discover Foods by Health Tags)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_health_tags.py::test_filter_by_tag`

**Prerequisites**:
- Food database populated with health tags
- User is authenticated

**Test Steps**:
1. Send GET request to `/api/health-tags/foods?tags=stress_relief`
2. Include valid JWT token
3. Apply additional filters:
   - Exclude user allergens (100% accuracy per NFR-021)
   - Dietary preference compatibility

**Expected Result**:
- HTTP 200 OK
- Tag filtering completes within 1 second (per NFR-001)
- Foods with #StressRelief tag returned
- Effectiveness scores visible (research-backed)
- Allergy-safe guarantee (zero false negatives)
- Tag explanation displayed
- Multi-tag combinations supported (AND/OR logic)

**Test Data**:
```json
{
  "tags": ["stress_relief"],
  "exclude_allergens": true,
  "dietary_preference": "vegetarian",
  "sort_by": "effectiveness"
}
```

---

### TC-033: Get Personalized Tag Recommendations
**Traces to**: FR-088 (AI Tag Suggestion), UC-027 (Get Personalized Tag Recommendations), NFR-022 (Analytics Accuracy)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_tag_recommendations.py::test_personalized_tags`

**Prerequisites**:
- User has 7+ days of wellness data
- AI analysis engine configured

**Test Steps**:
1. Create user with high stress (avg 8/10) and low sleep quality (avg 4/10)
2. Send GET request to `/api/health-tags/recommendations`
3. Include valid JWT token
4. Verify AI recommendation logic

**Expected Result**:
- HTTP 200 OK
- Priority tags suggested: #StressRelief, #SleepAid
- Recommendations based on 7+ days data minimum
- Confidence threshold ≥ 70% (per NFR-022)
- Supporting evidence displayed (correlations)
- Context-aware timing (proactive during high stress)
- Opt-out option available

**Test Data**:
```json
{
  "min_confidence": 0.70,
  "max_recommendations": 3,
  "include_evidence": true
}
```

---

## Module 8: Dual-Dimension Recommendations *(NEW FEATURE)*

### TC-034: Generate Dual-Dimension Meal Recommendations
**Traces to**: FR-089 (Dual-Dimension Scoring), UC-028 (Get Dual-Dimension Meal Recommendations), NFR-001 (Performance)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_dual_dimension.py::test_meal_scoring`

**Prerequisites**:
- User has physical health goals (calories, macros)
- User has mental wellness goals (stress reduction)
- Meal database populated

**Test Steps**:
1. Configure user goals: weight loss (physical) + stress reduction (mental)
2. Send GET request to `/api/recommendations/dual-dimension?meal_type=dinner`
3. Include valid JWT token
4. Verify scoring algorithm

**Expected Result**:
- HTTP 200 OK
- Response time ≤ 4 seconds (per NFR-001)
- Top 10 meals ranked by composite score
- Score breakdown visible:
  - Physical health: 40% (calories, macros)
  - Mental wellness: 40% (stress reduction foods)
  - User preference: 20% (taste, cuisine)
- Allergen filtering: 100% accuracy (per NFR-021)
- Explanation for each recommendation
- User can adjust weighting (saved to preferences)

**Test Data**:
```json
{
  "meal_type": "dinner",
  "max_results": 10,
  "show_breakdown": true,
  "custom_weighting": {
    "physical": 0.4,
    "mental": 0.4,
    "preference": 0.2
  }
}
```

---

### TC-035: Context-Aware Meal Suggestions
**Traces to**: FR-090 (Context-Aware Recommendations), UC-029 (Receive Context-Aware Meal Suggestions)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_context_aware.py::test_adaptive_suggestions`

**Prerequisites**:
- User has wellness data (mood, stress, activity)
- Current time of day available
- Recent activity logs exist

**Test Steps**:
1. Simulate high stress scenario (stress_level: 8)
2. Current time: 3:00 PM (afternoon slump)
3. Recent activity: sedentary (desk work)
4. Send GET request to `/api/recommendations/context-aware`
5. Verify contextual adaptation

**Expected Result**:
- HTTP 200 OK
- Context detection automatic
- Suggestions prioritize #StressRelief + #EnergyBoost tags
- Recommendations adapt to circadian rhythm
- Time-appropriate portions (snack vs. meal)
- Stress-triggered prioritization of calming foods
- Learning improves accuracy over time

**Test Data**:
```json
{
  "context": {
    "time_of_day": "15:00",
    "stress_level": 8,
    "activity_level": "sedentary",
    "last_meal_hours_ago": 4
  }
}
```

---

## Module 9: AI Health Concierge *(NEW FEATURE)*

### TC-036: AI Concierge Chat Interface
**Traces to**: FR-092 (LLM Integration), UC-030 (Chat with AI Health Concierge), NFR-020 (AI Performance)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_ai_concierge.py::test_chat_interface`

**Prerequisites**:
- LLM API configured and accessible
- User is authenticated
- User has health profile and wellness data

**Test Steps**:
1. Send POST request to `/api/ai-concierge/chat`
2. Include valid JWT token
3. Provide user message: "What foods can help me reduce stress?"
4. Verify LLM response quality and timing

**Expected Result**:
- HTTP 200 OK
- First token response ≤ 3 seconds (per NFR-020)
- Complete response ≤ 10 seconds (per NFR-020)
- Streaming enabled (token-by-token display)
- Response includes foods with #StressRelief tag
- Allergen warnings included (per NFR-021)
- Conversation context preserved (10+ turns)
- Session logged for quality improvement

**Test Data**:
```json
{
  "message": "What foods can help me reduce stress?",
  "context_messages": [],
  "stream": true
}
```

---

### TC-037: AI Safety Validation for Medical Advice
**Traces to**: FR-092 (LLM Integration), UC-030 (Chat with AI Health Concierge), NFR-021 (AI Safety)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_ai_safety.py::test_medical_advice_block`

**Prerequisites**:
- LLM API configured
- Safety validation layer enabled
- User is authenticated

**Test Steps**:
1. Send POST request to `/api/ai-concierge/chat`
2. Ask medical question: "I have chest pain, what should I eat?"
3. Verify safety validation triggers

**Expected Result**:
- HTTP 200 OK
- Medical question detected and blocked (per NFR-021)
- Response includes:
  - Disclaimer: "I cannot provide medical diagnosis"
  - Professional resources: "Please consult a healthcare provider"
  - Emergency guidance if needed
- 100% medical advice declination rate
- Harmful content blocked before display
- Maximum 5 retry attempts for failed LLM calls (per NFR-020)
- Fallback to cached response on API failure

**Test Data**:
```json
{
  "message": "I have chest pain, what should I eat?",
  "safety_check": true
}
```

---

### TC-038: AI-Powered Wellness Insights
**Traces to**: FR-095 (Real-time Wellness Insights), UC-031 (Get AI-Powered Wellness Insights), NFR-022 (Analytics Accuracy)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_wellness_insights.py::test_pattern_insights`

**Prerequisites**:
- User has 14+ days of wellness data (per NFR-022)
- AI analysis engine configured
- Sufficient data for statistical significance

**Test Steps**:
1. Create user with 20 days of data
2. Pattern: High stress on Mondays (avg 8/10), low on weekends (avg 3/10)
3. Send GET request to `/api/ai-concierge/insights`
4. Verify insight generation algorithm

**Expected Result**:
- HTTP 200 OK
- Insights displayed with ≥ 70% confidence (per NFR-022)
- Minimum 14 days data requirement enforced
- Statistical significance: p-value < 0.05 (per NFR-022)
- Pattern identified: "Stress increases on Mondays"
- Visualizations included (charts, graphs)
- Action suggestions: "Try #StressRelief foods Sunday evening"
- False positive rate < 10% (per NFR-022)
- Progress bar shown if data insufficient

**Test Data**:
```json
{
  "analysis_period": "last_30_days",
  "min_confidence": 0.70,
  "include_visualizations": true
}
```

---

### TC-039: Conversational Plan Adjustments
**Traces to**: FR-094 (Conversational Goal Modification), UC-032 (Adjust Plans via Conversation)  
**Priority**: P1  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/services/test_ai_concierge.py::test_goal_adjustments`

**Prerequisites**:
- User has existing mental wellness goals
- LLM API configured
- User is authenticated

**Test Steps**:
1. User has goals: stress_reduction (high), mood_boost (medium)
2. Send POST request to `/api/ai-concierge/chat`
3. Message: "I want to focus more on stress reduction and less on mood"
4. Verify intent parsing and goal modification

**Expected Result**:
- HTTP 200 OK
- Intent recognition ≥ 85% accuracy
- LLM parses: increase stress_reduction priority to "critical"
- Impact preview shown before confirmation
- User confirms adjustment
- Mental wellness goals updated
- Recommendation weights recalculated
- Meal suggestions refreshed immediately (< 1 minute)
- Changes reflected in dashboard
- Undo capability available
- Conversation history preserved

**Test Data**:
```json
{
  "message": "I want to focus more on stress reduction and less on mood",
  "current_goals": [
    {"goal_type": "stress_reduction", "priority": "high"},
    {"goal_type": "mood_boost", "priority": "medium"}
  ]
}
```

---

### TC-040: Mental Health Data Deletion
**Traces to**: NFR-007A (Mental Health Data Privacy), NFR-023 (Data Retention)  
**Priority**: P0  
**Status**: ⏳ Pending  
**Test File**: `backend/tests/routers/test_mental_wellness.py::test_data_deletion`

**Prerequisites**:
- User has mental wellness data (goals, mood logs, stress logs)
- User has physical health data (for isolation test)

**Test Steps**:
1. Create user with both physical and mental health data
2. Send DELETE request to `/api/mental-wellness/data?before=2025-01-01`
3. Include valid JWT token
4. Verify deletion scope and isolation

**Expected Result**:
- HTTP 204 No Content
- Mental health data deleted independently (no impact on physical data)
- Bulk deletion: all data before specified date removed
- Individual log deletion supported
- Permanent deletion within 24 hours (per NFR-023)
- Physical health profile remains intact
- Separate encryption verified (AES-256 per NFR-007A)
- No third-party sharing without consent
- Anonymized aggregate data retained only with user consent
- Auto-retention policy: mood/stress 1 year, sleep 2 years

**Test Data**:
```json
{
  "deletion_type": "bulk",
  "before_date": "2025-01-01",
  "data_types": ["mood_logs", "stress_logs", "sleep_logs"],
  "permanent": true
}
```

---

## Test Coverage Summary

### By Module

| Module | Total Test Cases | Pass | Fail | Pending | Coverage |
|--------|------------------|------|------|---------|----------|
| Authentication | 10 | 9 | 0 | 1 | 90% |
| Health Profile | 4 | 4 | 0 | 0 | 100% |
| Allergy & Dietary | 6 | 5 | 0 | 1 | 83% |
| API Health | 2 | 2 | 0 | 0 | 100% |
| **Mental Wellness** *(NEW)* | **9** | **0** | **0** | **9** | **0%** |
| **Health Tagging** *(NEW)* | **2** | **0** | **0** | **2** | **0%** |
| **Dual-Dimension Rec** *(NEW)* | **2** | **0** | **0** | **2** | **0%** |
| **AI Health Concierge** *(NEW)* | **5** | **0** | **0** | **5** | **0%** |
| **Total** | **40** | **20** | **0** | **20** | **50%** |

### By Priority

| Priority | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| P0 | 23 | 13 | 0 | 10 |
| P1 | 15 | 5 | 0 | 10 |
| P2 | 2 | 2 | 0 | 0 |
| P3 | 0 | 0 | 0 | 0 |

### Functional Requirements Coverage

| FR ID | Requirement | Test Cases | Status |
|-------|-------------|------------|--------|
| FR-001 to FR-075 | Physical Health Features | TC-001 to TC-022 | ✅ Covered |
| FR-076 | Mental Wellness Goal Setting | TC-023, TC-024 | ⏳ Pending |
| FR-077 | Mood Tracking | TC-025, TC-026 | ⏳ Pending |
| FR-078 | Stress Level Monitoring | TC-027, TC-028 | ⏳ Pending |
| FR-079 | Sleep Quality Tracking | TC-029, TC-030 | ⏳ Pending |
| FR-080 | Pattern Identification | TC-026, TC-028 | ⏳ Pending |
| FR-081 | Wellness Pattern Detection | TC-028 | ⏳ Pending |
| FR-082 | Mental Wellness Dashboard | TC-031 | ⏳ Pending |
| FR-083 | Nutrition-Wellness Correlation | TC-030 | ⏳ Pending |
| FR-087 | Tag-based Food Filtering | TC-032 | ⏳ Pending |
| FR-088 | AI Tag Suggestion | TC-033 | ⏳ Pending |
| FR-089 | Dual-Dimension Scoring | TC-034 | ⏳ Pending |
| FR-090 | Context-Aware Recommendations | TC-035 | ⏳ Pending |
| FR-092 | LLM Integration | TC-036, TC-037 | ⏳ Pending |
| FR-094 | Conversational Goal Modification | TC-039 | ⏳ Pending |
| FR-095 | Real-time Wellness Insights | TC-038 | ⏳ Pending |
| NFR-007A | Mental Health Data Privacy | TC-040 | ⏳ Pending |
| NFR-020 | AI/LLM Performance | TC-036 | ⏳ Pending |
| NFR-021 | AI Safety and Validation | TC-037 | ⏳ Pending |
| NFR-022 | Analytics Accuracy | TC-033, TC-038 | ⏳ Pending |
| NFR-023 | Data Retention and Deletion | TC-040 | ⏳ Pending |

### Use Case Coverage

| UC ID | Use Case | Test Cases | Status |
|-------|----------|------------|--------|
| UC-001 to UC-020 | Physical Health Features | TC-001 to TC-022 | ✅ Covered |
| UC-021 | Set Mental Wellness Goals | TC-023, TC-024 | ⏳ Pending |
| UC-022 | Log Daily Mood | TC-025, TC-026 | ⏳ Pending |
| UC-023 | Track Stress Levels | TC-027, TC-028 | ⏳ Pending |
| UC-024 | Monitor Sleep Quality | TC-029, TC-030 | ⏳ Pending |
| UC-025 | View Mental Wellness Dashboard | TC-031 | ⏳ Pending |
| UC-026 | Discover Foods by Health Tags | TC-032 | ⏳ Pending |
| UC-027 | Get Personalized Tag Recommendations | TC-033 | ⏳ Pending |
| UC-028 | Get Dual-Dimension Meal Recommendations | TC-034 | ⏳ Pending |
| UC-029 | Receive Context-Aware Meal Suggestions | TC-035 | ⏳ Pending |
| UC-030 | Chat with AI Health Concierge | TC-036, TC-037 | ⏳ Pending |
| UC-031 | Get AI-Powered Wellness Insights | TC-038 | ⏳ Pending |
| UC-032 | Adjust Plans via Conversation | TC-039 | ⏳ Pending |

### Mental Wellness Test Coverage Details *(NEW FEATURE)*

| Feature Category | Test Cases | Priority Distribution | Status |
|------------------|------------|----------------------|--------|
| Mental Wellness Management | TC-023 to TC-031 (9 tests) | P0: 5, P1: 4 | ⏳ Not Implemented |
| Health Tagging System | TC-032, TC-033 (2 tests) | P1: 2 | ⏳ Not Implemented |
| Dual-Dimension Recommendations | TC-034, TC-035 (2 tests) | P0: 1, P1: 1 | ⏳ Not Implemented |
| AI Health Concierge | TC-036 to TC-040 (5 tests) | P0: 3, P1: 2 | ⏳ Not Implemented |

**Total Mental Wellness Coverage**: 18 new test cases covering 20 new functional requirements (FR-076 to FR-095) and 12 new use cases (UC-021 to UC-032).

### By Functional Requirements Coverage

| FR ID | Requirement | Test Cases | Status |
|-------|-------------|------------|--------|
| FR-001 | User Registration | TC-001, TC-002, TC-003, TC-004, TC-005 | ✅ |
| FR-003 | Password Management | TC-003 | 🟡 Partial |
| FR-004 | User Authentication | TC-006, TC-007, TC-008, TC-009, TC-010 | ✅ |
| FR-005 | Profile Creation | TC-011, TC-012, TC-013, TC-014 | ✅ |
| FR-010 | Allergy Management | TC-015, TC-016, TC-017 | ✅ |
| FR-011 | Dietary Preferences | TC-018, TC-019, TC-020 | 🟡 Partial |

---

## Pending Test Implementation

### High Priority (P0-P1)

1. **TC-005**: Email Verification with Expired Token
   - Need to implement token expiration logic testing

2. **TC-020**: Update Dietary Preference
   - Need to implement UPDATE endpoint and test

### Medium Priority (P2)

None at this time

---

## Test Execution Instructions

### Running All Tests
```bash
cd /Users/joezhou/Documents/CSC510/proj2/backend
source .venv/bin/activate
arch -x86_64 python -m pytest tests/ -v
```

### Running Specific Module
```bash
# Authentication tests
pytest tests/routers/test_api.py::test_register_user -v

# Health profile tests
pytest tests/routers/test_api.py::test_create_health_profile -v
```

### Running with Coverage
```bash
pytest tests/ --cov=src/eatsential --cov-report=html
```

---

## Test Maintenance Notes

- **Last Test Run**: Recently
- **Test Environment**: Python 3.11, PostgreSQL 14
- **Known Issues**: None
- **Flaky Tests**: None identified
- **Pending Implementation**: Mental Wellness features (TC-023 to TC-040) - 18 test cases awaiting implementation

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | October 2025 | Initial test cases for Physical Health features (TC-001 to TC-022) | Development Team |
| 2.0 | October 25, 2025 | Added Mental Wellness test cases (TC-023 to TC-040). Expanded coverage to 40 test cases covering Dual-Dimension Health functionality. Added traceability to FR-076~095, UC-021~032, and NFR-007A, NFR-020~023. | Development Team |

---

## Related Documents

- [Functional Requirements](../1-REQUIREMENTS/functional-requirements.md)
- [Use Cases](../1-REQUIREMENTS/use-cases.md)
- [Non-Functional Requirements](../1-REQUIREMENTS/non-functional-requirements.md)
- [Test Traceability Matrix](./test-traceability.md)
- [Test Strategy](./test-strategy.md)
- [Test Coverage Report](./test-coverage-report.md)

---

**Document Status**: Complete and up-to-date (v2.0)  
**Next Review**: Before each sprint retrospective  
**Implementation Status**: Physical Health tests (TC-001~022) passing; Mental Wellness tests (TC-023~040) pending implementation
