# Sprint Tasks

**Document Version**: 2.0 (Dual-Dimension Health Platform)  
**Last Updated**: October 26, 2025  
**Current Milestone**: v0.3 - Tracking System (60% Complete)

---

## 📋 Document Overview

This document tracks development tasks across all milestones, organized by module (Frontend, Backend, Testing, Admin). Tasks are numbered by milestone (e.g., FE-01-XXX for v0.1, BE-03-XXX for v0.3).

**Purpose**:

- Track task status and dependencies
- Define module constraints and functional requirements
- Link to detailed specifications (FR, UC, API Design)

**Focus**: Module-level organization + functional requirements (no code examples, no file paths, no time estimates)

---

## ✅ Completed Milestones

### v0.1 - Auth & Profile (Issues #41-#43, #48, #50-#51, #54-#55)

- ✅ User registration with email verification
- ✅ JWT authentication
- ✅ Basic health profile CRUD
- ✅ Test coverage: 93% (10 tests)

### v0.2 - Health Data Management (Issues #58, #60-#63, #67-#69, #73-#74)

- ✅ Complete health profile management
- ✅ Allergy and dietary preference CRUD
- ✅ Admin panel foundation
- ✅ Test coverage: 88% (34 tests)

---

## 🚨 Critical Issues (Resolved)

| Issue                                                   | Description                              | Task ID   | Status   |
| ------------------------------------------------------- | ---------------------------------------- | --------- | -------- |
| [#41](https://github.com/Asoingbob225/CSC510/issues/41) | Password validation doesn't match FR-001 | FE-S1-001 | ✅ Fixed |
| [#42](https://github.com/Asoingbob225/CSC510/issues/42) | Email verification flow missing          | BE-S1-002 | ✅ Fixed |
| [#43](https://github.com/Asoingbob225/CSC510/issues/43) | User registration API missing            | BE-S1-001 | ✅ Fixed |

---

## 📋 Issue Tracking

### ✅ Completed Issues (v0.1 - v0.2)

| Issue                                                   | Title                                                  | Milestone | Status    | Closed |
| ------------------------------------------------------- | ------------------------------------------------------ | --------- | --------- | ------ |
| [#74](https://github.com/Asoingbob225/CSC510/issues/74) | feat(frontend): Admin User Management UI               | v0.2      | ✅ Closed | Oct 26 |
| [#73](https://github.com/Asoingbob225/CSC510/issues/73) | feat: Admin User Management                            | v0.2      | ✅ Closed | Oct 26 |
| [#69](https://github.com/Asoingbob225/CSC510/issues/69) | feat(backend): Admin Role & Protected Routes API       | v0.2      | ✅ Closed | Oct 25 |
| [#68](https://github.com/Asoingbob225/CSC510/issues/68) | feat(frontend): Admin Panel Foundation UI              | v0.2      | ✅ Closed | Oct 25 |
| [#67](https://github.com/Asoingbob225/CSC510/issues/67) | feat: Admin Panel Foundation                           | v0.2      | ✅ Closed | Oct 25 |
| [#63](https://github.com/Asoingbob225/CSC510/issues/63) | feat(backend): Health Profile CRUD                     | v0.2      | ✅ Closed | Oct 23 |
| [#62](https://github.com/Asoingbob225/CSC510/issues/62) | subtask(frontend): Multi-Step Health Profile Wizard UI | v0.2      | ✅ Closed | Oct 24 |
| [#61](https://github.com/Asoingbob225/CSC510/issues/61) | subtask(backend): Health Profile DB Models and Schemas | v0.2      | ✅ Closed | Oct 23 |
| [#60](https://github.com/Asoingbob225/CSC510/issues/60) | feat(frontend): Health Profile Form                    | v0.2      | ✅ Closed | Oct 24 |
| [#58](https://github.com/Asoingbob225/CSC510/issues/58) | refactor(backend): Backend structure refactor          | v0.2      | ✅ Closed | Oct 22 |
| [#55](https://github.com/Asoingbob225/CSC510/issues/55) | fix(frontend): JWT token storage                       | v0.1      | ✅ Closed | Oct 22 |
| [#54](https://github.com/Asoingbob225/CSC510/issues/54) | fix(frontend): JWT login state                         | v0.1      | ✅ Closed | Oct 22 |
| [#51](https://github.com/Asoingbob225/CSC510/issues/51) | feat(frontend): Frontend signup API integration        | v0.1      | ✅ Closed | Oct 21 |
| [#50](https://github.com/Asoingbob225/CSC510/issues/50) | feat(frontend): URL verification page                  | v0.1      | ✅ Closed | Oct 21 |
| [#48](https://github.com/Asoingbob225/CSC510/issues/48) | refactor(backend): Backend API structure               | v0.1      | ✅ Closed | Oct 21 |
| [#43](https://github.com/Asoingbob225/CSC510/issues/43) | feat(backend): User registration API                   | v0.1      | ✅ Closed | Oct 20 |
| [#42](https://github.com/Asoingbob225/CSC510/issues/42) | feat(backend): Email verification flow                 | v0.1      | ✅ Closed | Oct 20 |
| [#41](https://github.com/Asoingbob225/CSC510/issues/41) | fix(frontend): Password validation                     | v0.1      | ✅ Closed | Oct 20 |

**Summary**: 18 issues completed across v0.1 (Authentication) and v0.2 (Health Data Management)

### ✅ Completed Issues (v0.3)

| Issue                                                   | Title                                                      | Milestone | Status    | Closed |
| ------------------------------------------------------- | ---------------------------------------------------------- | --------- | --------- | ------ |
| [#98](https://github.com/Asoingbob225/CSC510/issues/98) | subtask(backend): Mood/Stress/Sleep Logging API            | v0.3      | ✅ Closed | Oct 26 |
| [#97](https://github.com/Asoingbob225/CSC510/issues/97) | subtask(backend): Goal Tracking API                        | v0.3      | ✅ Closed | Oct 26 |
| [#94](https://github.com/Asoingbob225/CSC510/issues/94) | subtask(backend): Meal Logging API                         | v0.3      | ✅ Closed | Oct 26 |
| [#72](https://github.com/Asoingbob225/CSC510/issues/72) | feat(backend): Implement Data Management API for Allergens | v0.3      | ✅ Closed | Oct 26 |
| [#71](https://github.com/Asoingbob225/CSC510/issues/71) | feat(frontend): Implement Data Management UI for Allergens | v0.3      | ✅ Closed | Oct 26 |
| [#70](https://github.com/Asoingbob225/CSC510/issues/70) | feat: Admin Data Management for Allergens                  | v0.3      | ✅ Closed | Oct 26 |

**Summary**: 6 issues completed for v0.3 Tracking System milestone

### 🔄 Open Issues (v0.3)

| Issue                                                     | Title                                        | Priority | Status         |
| --------------------------------------------------------- | -------------------------------------------- | -------- | -------------- |
| [#104](https://github.com/Asoingbob225/CSC510/issues/104) | test: Mental Wellness Tracking Tests         | P0       | 📝 To Do       |
| [#103](https://github.com/Asoingbob225/CSC510/issues/103) | test: Meal & Goal Tracking Tests             | P0       | 📝 To Do       |
| [#102](https://github.com/Asoingbob225/CSC510/issues/102) | feat(frontend): Admin Audit Log Dashboard UI | P1       | ✅ Complete    |
| [#101](https://github.com/Asoingbob225/CSC510/issues/101) | feat(backend): Admin Audit Log System        | P1       | ✅ Complete    |
| [#100](https://github.com/Asoingbob225/CSC510/issues/100) | feat: Admin Audit Log System                 | P1       | ✅ Complete    |
| [#99](https://github.com/Asoingbob225/CSC510/issues/99)   | subtask(frontend): Goal & Mood Tracking UI   | P0       | 🟡 In Progress |
| [#96](https://github.com/Asoingbob225/CSC510/issues/96)   | feat: Mental Wellness Tracking System (M3)   | P0       | 🟡 In Progress |
| [#95](https://github.com/Asoingbob225/CSC510/issues/95)   | subtask(frontend): Meal Logging Interface    | P0       | 🟡 In Progress |

**Summary**: 5 open issues for v0.3 Tracking System milestone (3 in progress, 5 to do)

### 🔄 Open Issues (v0.4 - Future Milestone)

| Issue                                                     | Title                                        | Priority | Status   |
| --------------------------------------------------------- | -------------------------------------------- | -------- | -------- |
| [#109](https://github.com/Asoingbob225/CSC510/issues/109) | test: Recommendation Algorithm Tests         | P1       | 📝 To Do |
| [#108](https://github.com/Asoingbob225/CSC510/issues/108) | subtask(frontend): Recommendation Display UI | P0       | 📝 To Do |
| [#107](https://github.com/Asoingbob225/CSC510/issues/107) | subtask(backend): Recommendation API         | P0       | 📝 To Do |
| [#106](https://github.com/Asoingbob225/CSC510/issues/106) | subtask(backend): Basic Scoring Algorithm    | P0       | 📝 To Do |
| [#105](https://github.com/Asoingbob225/CSC510/issues/105) | feat: Basic Recommendation Engine (M4)       | P0       | 📝 To Do |

**Summary**: 5 issues planned for v0.4 AI Recommendation Engine milestone

---

## 🎯 Current Milestone: v0.3 - Tracking System

**Completed Issues**: #70, #71, #72, #94, #97, #98  
**Status**: 67% Complete (6/9 backend tasks done)  
**Focus**: Physical meal logging + Mental wellness tracking (goals, mood, stress, sleep)

---

## 📊 Task Organization

### Task Status Summary

- **Total Tasks**: 21
- **Completed (v0.1-v0.2)**: 18 tasks
- **In Progress (v0.3)**: 3 tasks
- **Priority P0**: 15 tasks (critical path)
- **Priority P1**: 6 tasks (important)

### Module Breakdown

- **Frontend**: 6 tasks (3 completed, 3 in progress)
- **Backend**: 8 tasks (4 completed, 4 in progress)
- **Admin**: 5 tasks (5 completed)
- **Testing**: 2 tasks (0 completed, 2 not started)

---

## 🚀 Active Tasks (v0.3)

### Frontend Tasks (In Progress)

#### FE-03-004: Meal Logging Interface (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-03-001  
**Module**: `frontend/src/pages`  
**Priority**: P0

**Functional Requirements**:

- Quick meal logging form (meal type, foods, portion sizes)
- Search/autocomplete for food items
- Photo upload capability
- View meal history with filtering

**Key Constraints**:

- API endpoint: `POST /api/meals`
- Support meal types: breakfast, lunch, dinner, snack
- Image size limit: 5MB
- Response time: <2s for logging

**Related**: Issue #70, FR-020 (Meal Tracking)

---

#### FE-03-005: Goal & Mood Tracking UI (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-03-002, BE-03-003  
**Module**: `frontend/src/pages`  
**Priority**: P0

**Functional Requirements**:

- Daily goal setting interface (nutrition targets, mental wellness goals)
- Quick mood/stress/sleep logging widgets
- Dashboard showing both physical and mental wellness data
- Progress visualization (charts for trends)

**Key Constraints**:

- API endpoints: `POST /api/goals`, `POST /api/mood-logs`
- Mood scale: 1-10
- Stress scale: 1-10
- Sleep duration: hours (decimal)

**Related**: FR-025 (Goal Tracking), FR-030 (Mood Logging)

---

#### FE-03-006: Admin Data Management UI (v0.3)

**Status**: ✅ Complete
**Dependencies**: BE-03-004
**Module**: `frontend/src/pages/admin`
**Priority**: P1

**Functional Requirements**:

- Admin interface for allergen database management
- CRUD operations for allergens (name, category, severity)
- Bulk upload/export capabilities (JSON, CSV)
- Search and filtering
- Link to audit history

**Key Constraints**:

- API endpoint: `/api/admin/allergens`
- Role-based access: Admin only
- Audit logging for all changes

**Related**: Issues #70-#72, #100-102, FR-011 (Allergen Management)---

### Backend Tasks (In Progress)

#### BE-03-001: Meal Logging API (v0.3)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Log meals with meal type, foods, portions, timestamp
- Support photo uploads (optional)
- Calculate nutritional values (calories, macros)
- Query meal history with filters (date range, meal type)
- Update/delete existing meal logs

**API Endpoints**:

- `POST /api/meals`
- `GET /api/meals`
- `GET /api/meals/{id}`
- `PUT /api/meals/{id}`
- `DELETE /api/meals/{id}`

**Key Constraints**:

- Photo storage: cloud storage (S3/equivalent)
- Nutritional calculation: integration with food database
- Timestamp validation: must be within last 30 days
- Response time: <2s for POST requests

**Implementation Details**:

- ✅ MealDB and MealFoodItemDB models with relationships
- ✅ MealService with 5 methods (100% coverage)
- ✅ 5 API endpoints (95% coverage)
- ✅ 41 tests (18 unit + 23 integration, all passing)
- ✅ Automatic nutritional totals calculation

**Related**: Issue #94, FR-020 (Meal Tracking), API-010

---

#### BE-03-001-A: Implement POST /api/meals (Assigned: lzdjohn)

**Status**: 🟡 In Progress

**Assignee**: @lzdjohn

**Goal**: Deliver a minimal, production-ready POST endpoint to create a meal log. This task is intentionally scoped small so it can be completed without blocking others.

**Acceptance Criteria**:

- `POST /api/meals` accepts JSON payload with: `user_id`, `meal_type` (breakfast|lunch|dinner|snack), `items` (list of {food_id, portion}), and optional `timestamp` and `photo_url`.
- Validates required fields and returns 201 with created meal object (id, timestamp, nutritional_summary).
- Persists meal into database (basic model) and enqueues nutritional calculation job (can be a stubbed job queue for now).
- Unit tests covering success case and at least two validation failures.

**Implementation Notes / Tasks**:

1. Add router method `create_meal` under `backend/src/eatsential/routers/meals.py`.
2. Add minimal Pydantic schema for request/response under `backend/src/eatsential/schemas/meals.py`.
3. Add DB model migration or simple model in `backend/src/eatsential/models.py` (compatible with current DB layer).
4. Add a basic service `backend/src/eatsential/services/nutrition.py` with a stub `calculate_nutrition` that returns calories/macros (can be mocked in tests).
5. Add tests under `backend/tests/test_meals.py` (pytest) for create success and validation errors.
6. Ensure route is registered and protected (requires authenticated user) — if auth middleware not available, document in PR what auth hook to wire.

**Estimated Size**: Small — aim to complete in one focused session (2-4 hours).

**Notes**: I will not modify other people's branches or files unrelated to this task. All changes will be submitted via a feature branch following `feat/iss<issue-number>-short-description` naming.

---

## Suggested Starter Tasks for lzdjohn (AI Recommendation M4)

Below are four small-to-moderate tasks from the M4 AI Recommendation milestone that are good to start with in sequence. They are ordered from easiest to slightly larger and are intentionally scoped so you can complete them one-by-one and open small PRs.

1. BE-S2-004 / Issue #77 — Create Restaurant DB Schema & Seed Data (Assigned: @lzdjohn)
   - Status: ✅ Complete (PR merged)
   - Goal: Define `Restaurant` and `MenuItem` models and add a small seed script that inserts sample restaurants and menu items into the dev database.
   - Acceptance:
     - SQLAlchemy / ORM models added under `backend/src/eatsential/models/restaurant.py` (or compatible DB layer).
     - A seed script `backend/scripts/seed_restaurants.py` that inserts 5 restaurants with 3-5 menu items each.
     - Basic unit test ensuring seed script runs without errors (mock DB or use test DB).
   - Estimated time: 2–3 hours
   - Completed: October 26, 2025
   - Branch: `feat/iss77-restaurant-schema-lzdjohn`

2. BE-S2-008 / Issue (Add explanation field) — Add `explanation` field to Recommendation API (Assigned: @lzdjohn)
   - Status: ✅ Complete (PR merged)
   - Goal: Extend the recommendation response schema to include a short human-readable `explanation` string (FR-071).
   - Acceptance:
     - API response schema updated (Pydantic / TypeScript types) to include `explanation`.
     - Back-end stub returns a placeholder explanation for now (e.g., "Based on your protein goal and allergy settings").
     - Unit test verifies `explanation` exists and is a non-empty string.
   - Estimated time: 1–2 hours
   - Completed: October 26, 2025
   - Branch: `feat/iss-explanation-field-lzdjohn`

3. BE-S2-005 / Issue #81 — Build Core Recommendation API (stub) (`POST /api/recommend/meal`) (Assigned: @lzdjohn)
   - Status: � In Progress (PR pending review)
   - Goal: Implement a minimal, testable recommendation endpoint that accepts user context and returns a ranked list of recommended menu items (can use a naive scoring function initially).
   - Acceptance:
     - Endpoint `POST /api/recommend/meal` accepts `{user_id, constraints}` and returns list of `{menu_item_id, score, explanation}`.
     - Uses the seeded restaurant/menu data for lookups.
     - Unit tests for happy path and simple allergy filtering.
   - Estimated time: 3–5 hours
   - Branch: `feat/iss81-recommendation-api-lzdjohn`
   - Implementation Notes:
     - Added `RecommendationRequest` schema with `user_id` and optional `constraints`
     - Implemented naive scoring: base 0.5 + 0.3 for calories + 0.2 for price info
     - Returns top 10 recommendations sorted by score
     - Comprehensive test suite with 6 test cases covering happy path, validation, scoring logic

4. FE-S2-007 / Issue — Add Feedback Buttons (Like/Dislike) to Recommendation UI (Assigned: @lzdjohn)
   - Status: 📝 To Do
   - Goal: Add simple like/dislike buttons to recommendation cards that POST feedback to `/api/recommend/feedback`.
   - Acceptance:
     - UI buttons added to recommendation card component (`frontend/src/components/RecommendationCard.tsx` or equivalent).
     - Button click sends a fetch POST to `/api/recommend/feedback` (backend stub can accept and return 200).
     - Basic component test or manual verification instructions included.
   - Estimated time: 1–2 hours

Notes:

- Work sequentially: start with 1 → 2 → 3 → 4. Each task is deliberately small so you can open focused PRs and get early reviews.
- Naming for feature branches: `feat/iss77-restaurant-schema-lzdjohn`, `feat/issX-explanation-field-lzdjohn`, etc.
- If you want, I can scaffold the code stubs for task 1 and 2 on this branch now (models + seed + API schema) and run quick local tests; confirm and I'll proceed.

---

#### BE-03-002: Goal Tracking API (v0.3)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Create daily/weekly goals (nutrition targets, wellness goals)
- Track goal progress
- Update goal status
- Query goals by date range and type
- Calculate goal completion percentage

**API Endpoints**:

- `POST /api/goals`
- `GET /api/goals`
- `PUT /api/goals/{id}`
- `DELETE /api/goals/{id}`
- `GET /api/goals/progress`

**Key Constraints**:

- Goal types: nutrition (calories, protein, etc.), wellness (mood, sleep, stress)
- Progress calculation: automatic based on logged data
- Date validation: goals must be future-dated
- User isolation: users can only access own goals

**Implementation Details**:

- ✅ GoalDB model with 12 fields and 4 indexes
- ✅ GoalService with 7 methods (96% coverage)
- ✅ 6 API endpoints (91% coverage)
- ✅ 54 tests (26 unit + 28 integration, all passing)
- ✅ Comprehensive Pydantic validation

**Related**: Issue #97, FR-025 (Goal Tracking), API-012

---

#### BE-03-003: Mood/Stress/Sleep Logging API (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-S1-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Log daily mood (1-10 scale, optional notes)
- Log stress levels (1-10 scale, triggers)
- Log sleep duration (hours, quality 1-10)
- Encrypt sensitive mental wellness data
- Query logs by date range
- Generate trend analysis

**API Endpoints**:

- `POST /api/mood-logs`
- `POST /api/stress-logs`
- `POST /api/sleep-logs`
- `GET /api/wellness-logs`

**Key Constraints**:

- Data encryption: AES-256 for mental wellness data
- Scale validation: 1-10 integer range
- Timestamp: must be within last 7 days
- Privacy: highly sensitive data, strict access control

**Related**: FR-030 (Mood Logging), FR-031 (Stress Logging), API-013

---

#### BE-03-004: Admin Allergen Management API (v0.3)

**Status**: ✅ Complete
**Dependencies**: BE-S1-001
**Module**: `backend/src/eatsential/routers/admin`
**Priority**: P1

**Functional Requirements**:

- CRUD operations for allergen database
- Bulk import/export allergens (JSON, CSV)
- Search allergens by name or category
- Audit logging for all changes (allergens and users)
- Role-based access control (admin only)

**API Endpoints**:

- `POST /api/admin/allergens/bulk`
- `GET /api/admin/allergens/export`
- `GET /api/admin/audit-logs/allergens`
- `GET /api/admin/audit-logs/users`

**Key Constraints**:

- Admin role required (403 if not admin)
- Audit log: track who, what, when
- Cannot delete allergen if referenced by user profiles
- Bulk operations: max 100 items per request

**Related**: Issues #70-#72, #100-102, FR-011 (Allergen Management), API-020---

### Testing Tasks (Not Started)

#### TEST-03-001: Meal & Goal Tracking Tests (v0.3)

**Status**: ⏳ Not Started  
**Dependencies**: BE-03-001, BE-03-002, FE-03-004, FE-03-005  
**Module**: `backend/tests`, `frontend/src/__tests__`  
**Priority**: P0

**Functional Requirements**:

- Unit tests for meal logging API (CRUD operations)
- Unit tests for goal tracking API (create, update, progress)
- Integration tests for meal-to-nutrition calculation
- Frontend component tests for meal logging UI
- Frontend component tests for goal tracking UI

**Key Constraints**:

- Test coverage: >85% for new code
- Mock external services (food database, cloud storage)
- Test edge cases (invalid inputs, boundary conditions)
- Performance tests: API response time <2s

**Related**: STP-Unit-Test-Plan, STP-Integration-Test-Plan

---

#### TEST-03-002: Mental Wellness Tracking Tests (v0.3)

**Status**: ⏳ Not Started  
**Dependencies**: BE-03-003, FE-03-005  
**Module**: `backend/tests`, `frontend/src/__tests__`  
**Priority**: P0

**Functional Requirements**:

- Unit tests for mood/stress/sleep logging APIs
- Test data encryption for mental wellness data
- Integration tests for trend analysis
- Frontend tests for quick log widgets
- Privacy and security tests

**Key Constraints**:

- Test coverage: >85% for new code
- Verify encryption is applied correctly
- Test privacy controls (data isolation)
- Validate scale ranges (1-10)

**Related**: STP-Unit-Test-Plan, Security Test Plan

---

## 📦 Completed Tasks Archive (v0.1 - v0.2)

### Frontend Tasks (Completed)

#### FE-S1-001: Password Validation (v0.1)

**Status**: ✅ Complete  
**Dependencies**: None  
**Module**: `frontend/src/pages`

**Functional Requirements**:

- Validate password strength (min 8 chars, uppercase, lowercase, number, special char)
- Display clear error messages for validation failures
- Real-time validation feedback as user types

**Related**: Issue #41, FR-001 (Authentication)

---

#### FE-S1-002: Email Verification UI (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-002  
**Module**: `frontend/src/pages`

**Functional Requirements**:

- Display pending verification message after registration
- Provide resend email button with rate limiting
- Show verification success page after token confirmation
- Handle expired token errors gracefully

**Related**: Issue #42, UC-002 (Email Verification)

---

#### FE-S1-003: Health Profile Form (v0.2)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-003  
**Module**: `frontend/src/pages`

**Functional Requirements**:

- Multi-step wizard for health profile creation
- Allergy input with severity selection (MILD, MODERATE, SEVERE, LIFE_THREATENING)
- Visual warnings based on allergy severity
- Dietary preference selection (vegetarian, vegan, pescatarian, etc.)

**Related**: Issues #60-#62, FR-010 (Health Profile)

---

### Backend Tasks (Completed)

#### BE-S1-001: User Registration API (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-004  
**Module**: `backend/src/eatsential/routers`

**Functional Requirements**:

- Register new users with email validation
- Hash passwords securely (bcrypt)
- Generate email verification tokens
- Send verification emails
- Return user data without password

**API Endpoint**: `POST /auth/register`

**Related**: Issue #43, FR-001 (Registration), API-001

---

#### BE-S1-002: Email Verification System (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-001  
**Module**: `backend/src/eatsential/services`

**Functional Requirements**:

- Generate secure verification tokens
- Send verification emails via email service
- Validate tokens on verification endpoint
- Mark users as verified in database
- Handle token expiry

**API Endpoint**: `POST /auth/verify-email`

**Related**: Issue #42, FR-002 (Email Verification), API-002

---

#### BE-S1-003: Health Profile CRUD (v0.2)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-001  
**Module**: `backend/src/eatsential/routers`

**Functional Requirements**:

- Create/update health profile (age, height, weight, activity level)
- Manage allergies with severity levels
- Set dietary preferences
- Validate allergen names against approved list
- Return complete profile data

**API Endpoints**:

- `POST /api/health-profile`
- `GET /api/health-profile`
- `PUT /api/health-profile`
- `POST /api/allergies`

**Related**: Issues #60-#63, FR-010 (Health Profile), API-005

---

#### BE-S1-004: Database Setup (v0.1)

**Status**: ✅ Complete  
**Dependencies**: None  
**Module**: `backend/alembic`, `backend/src/eatsential/database.py`

**Functional Requirements**:

- Database connection management
- Migration system setup
- Initial schema creation (12 tables)
- Development/production environment configs

**Related**: Technical Setup Documentation

---

### Admin Tasks (All Completed in v0.2)

#### ADMIN-02-001: Admin Panel Foundation (v0.2)

**Status**: ✅ Complete  
**Module**: `frontend/src/pages/admin`, `backend/src/eatsential/routers/admin`  
**Related**: Issue #67

#### ADMIN-02-002: Admin Role & Protected Routes (v0.2)

**Status**: ✅ Complete  
**Module**: `backend/src/eatsential/middleware`  
**Related**: Issue #69

#### ADMIN-02-003: Admin Panel UI (v0.2)

**Status**: ✅ Complete  
**Module**: `frontend/src/pages/admin`  
**Related**: Issue #68

#### ADMIN-02-004: Admin User Management (v0.2)

**Status**: ✅ Complete  
**Module**: `backend/src/eatsential/routers/admin`  
**Related**: Issue #73

#### ADMIN-02-005: Admin User Management UI (v0.2)

**Status**: ✅ Complete  
**Module**: `frontend/src/pages/admin`  
**Related**: Issue #74

---

### FE-S1-002: Email Verification UI (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-002  
**Module**: `frontend/src/pages`

**Functional Requirements**:

- Display pending verification message after registration
- Provide resend email button with rate limiting
- Show verification success page after token confirmation
- Handle expired token errors gracefully

**Key Constraints**:

- Must integrate with backend verification endpoint
- Rate limiting: 1 resend per 60 seconds
- Token expiry: 24 hours

**Related**: Issue #42, UC-002 (Email Verification)

---

### FE-S1-003: Health Profile Form (v0.2)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-003  
**Module**: `frontend/src/pages`

**Functional Requirements**:

- Multi-step wizard for health profile creation
- Allergy input with severity selection (MILD, MODERATE, SEVERE, LIFE_THREATENING)
- Visual warnings based on allergy severity
- Dietary preference selection (vegetarian, vegan, pescatarian, etc.)

**Key Constraints**:

- Allergen validation against approved list
- Severity-based UI warnings (color coding)
- Form state persistence across steps

**Related**: Issues #60-#62, FR-010 (Health Profile)

---

### FE-03-004: Meal Logging Interface (v0.3)

---

### FE-03-004: Meal Logging Interface (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-03-001  
**Module**: `frontend/src/pages`  
**Priority**: P0

**Functional Requirements**:

- Quick meal logging form (meal type, foods, portion sizes)
- Search/autocomplete for food items
- Photo upload capability
- View meal history with filtering

**Key Constraints**:

- API endpoint: `POST /api/meals`
- Support meal types: breakfast, lunch, dinner, snack
- Image size limit: 5MB
- Response time: <2s for logging

**Related**: Issue #70, FR-020 (Meal Tracking)

---

### FE-03-005: Goal & Mood Tracking UI (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-03-002, BE-03-003  
**Module**: `frontend/src/pages`  
**Priority**: P0

**Functional Requirements**:

- Daily goal setting interface (nutrition targets, mental wellness goals)
- Quick mood/stress/sleep logging widgets
- Dashboard showing both physical and mental wellness data
- Progress visualization (charts for trends)

**Key Constraints**:

- API endpoints: `POST /api/goals`, `POST /api/mood-logs`
- Mood scale: 1-10
- Stress scale: 1-10
- Sleep duration: hours (decimal)

**Related**: FR-025 (Goal Tracking), FR-030 (Mood Logging)

---

### FE-03-006: Admin Data Management UI (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-03-003  
**Module**: `frontend/src/pages/admin`  
**Priority**: P1

**Functional Requirements**:

- Admin interface for allergen database management
- CRUD operations for allergens (name, category, severity)
- Bulk upload/export capabilities
- Search and filtering

**Key Constraints**:

- API endpoint: `/api/admin/allergens`
- Role-based access: Admin only
- Audit logging for all changes

**Related**: Issues #70-#72, FR-011 (Allergen Management)

---

## Backend Tasks

### BE-S1-001: User Registration API (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-004  
**Module**: `backend/src/eatsential/routers`

**Functional Requirements**:

- Register new users with email validation
- Hash passwords securely (bcrypt)
- Generate email verification tokens
- Send verification emails
- Return user data without password

**API Endpoint**: `POST /auth/register`

**Key Constraints**:

- Email must be unique
- Password hashing: bcrypt with salt rounds = 12
- Token expiry: 24 hours
- Email service: SMTP or third-party API

**Related**: Issue #43, FR-001 (Registration), API-001

---

### BE-S1-002: Email Verification System (v0.1)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-001  
**Module**: `backend/src/eatsential/services`

**Functional Requirements**:

- Generate secure verification tokens
- Send verification emails via email service
- Validate tokens on verification endpoint
- Mark users as verified in database
- Handle token expiry

**API Endpoint**: `POST /auth/verify-email`

**Key Constraints**:

- Token generation: secure random (32 bytes)
- Email template: branded, mobile-responsive
- Token storage: database with expiry timestamp
- Resend rate limit: 1 per 60 seconds

**Related**: Issue #42, FR-002 (Email Verification), API-002

---

### BE-S1-003: Health Profile CRUD (v0.2)

**Status**: ✅ Complete  
**Dependencies**: BE-S1-001  
**Module**: `backend/src/eatsential/routers`

**Functional Requirements**:

- Create/update health profile (age, height, weight, activity level)
- Manage allergies with severity levels
- Set dietary preferences
- Validate allergen names against approved list
- Return complete profile data

**API Endpoints**:

- `POST /api/health-profile`
- `GET /api/health-profile`
- `PUT /api/health-profile`
- `POST /api/allergies`

**Key Constraints**:

- Approved allergens list: 12 common allergens
- Severity validation: MILD, MODERATE, SEVERE, LIFE_THREATENING
- BMI calculation: automatic based on height/weight
- User must be authenticated

**Related**: Issues #60-#63, FR-010 (Health Profile), API-005

---

### BE-S1-004: Database Setup (v0.1)

**Status**: ✅ Complete  
**Dependencies**: None  
**Module**: `backend/alembic`, `backend/src/eatsential/database.py`

**Functional Requirements**:

- Database connection management
- Migration system setup
- Initial schema creation (12 tables)
- Development/production environment configs

**Key Constraints**:

- SQLite for development
- PostgreSQL for production
- Alembic for migrations
- Connection pooling configured

**Related**: Technical Setup Documentation

---

### BE-03-001: Meal Logging API (v0.3)

**Status**: � In Progress  
**Dependencies**: BE-02-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Log meals with meal type, foods, portions, timestamp
- Support photo uploads (optional)
- Calculate nutritional values (calories, macros)
- Query meal history with filters (date range, meal type)
- Update/delete existing meal logs

**API Endpoints**:

- `POST /api/meals`
- `GET /api/meals`
- `PUT /api/meals/{id}`
- `DELETE /api/meals/{id}`

**Key Constraints**:

- Photo storage: cloud storage (S3/equivalent)
- Nutritional calculation: integration with food database
- Timestamp validation: must be within last 30 days
- Response time: <2s for POST requests

**Related**: Issue #70, FR-020 (Meal Tracking), API-010

---

### BE-03-002: Goal Tracking API (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-02-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Create daily/weekly goals (nutrition targets, wellness goals)
- Track goal progress
- Update goal status
- Query goals by date range and type
- Calculate goal completion percentage

**API Endpoints**:

- `POST /api/goals`
- `GET /api/goals`
- `PUT /api/goals/{id}`
- `GET /api/goals/progress`

**Key Constraints**:

- Goal types: nutrition (calories, protein, etc.), wellness (mood, sleep, stress)
- Progress calculation: automatic based on logged data
- Date validation: goals must be future-dated
- User isolation: users can only access own goals

**Related**: FR-025 (Goal Tracking), API-012

---

### BE-03-003: Mood/Stress/Sleep Logging API (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-02-003  
**Module**: `backend/src/eatsential/routers`  
**Priority**: P0

**Functional Requirements**:

- Log daily mood (1-10 scale, optional notes)
- Log stress levels (1-10 scale, triggers)
- Log sleep duration (hours, quality 1-10)
- Encrypt sensitive mental wellness data
- Query logs by date range
- Generate trend analysis

**API Endpoints**:

- `POST /api/mood-logs`
- `POST /api/stress-logs`
- `POST /api/sleep-logs`
- `GET /api/wellness-logs`

**Key Constraints**:

- Data encryption: AES-256 for mental wellness data
- Scale validation: 1-10 integer range
- Timestamp: must be within last 7 days
- Privacy: highly sensitive data, strict access control

**Related**: FR-030 (Mood Logging), FR-031 (Stress Logging), API-013

---

### BE-03-004: Admin Allergen Management API (v0.3)

**Status**: 🟡 In Progress  
**Dependencies**: BE-01-001  
**Module**: `backend/src/eatsential/routers/admin`  
**Priority**: P1

**Functional Requirements**:

- CRUD operations for allergen database
- Bulk import/export allergens
- Search allergens by name or category
- Audit logging for all changes
- Role-based access control (admin only)

**API Endpoints**:

- `POST /api/admin/allergens`
- `GET /api/admin/allergens`
- `PUT /api/admin/allergens/{id}`
- `DELETE /api/admin/allergens/{id}`

**Key Constraints**:

- Admin role required (403 if not admin)
- Audit log: track who, what, when
- Cannot delete allergen if referenced by user profiles
- Bulk operations: max 100 items per request

**Related**: Issues #70-#72, FR-011 (Allergen Management), API-020

---

## Admin Tasks (All Completed in v0.2)

### ADMIN-02-001: Admin Panel Foundation (v0.2)

**Status**: ✅ Complete  
**Related**: Issue #67

### ADMIN-02-002: Admin Role & Protected Routes (v0.2)

**Status**: ✅ Complete  
**Related**: Issue #69

### ADMIN-02-003: Admin Panel UI (v0.2)

**Status**: ✅ Complete  
**Related**: Issue #68

### ADMIN-02-004: Admin User Management (v0.2)

**Status**: ✅ Complete  
**Related**: Issue #73

### ADMIN-02-005: Admin User Management UI (v0.2)

**Status**: ✅ Complete  
**Related**: Issue #74

---

## Testing Tasks

### TEST-03-001: Meal & Goal Tracking Tests (v0.3)

**Status**: ⏳ Not Started  
**Dependencies**: BE-03-001, BE-03-002, FE-03-004, FE-03-005  
**Module**: `backend/tests`, `frontend/src/__tests__`  
**Priority**: P0

**Functional Requirements**:

- Unit tests for meal logging API (CRUD operations)
- Unit tests for goal tracking API (create, update, progress)
- Integration tests for meal-to-nutrition calculation
- Frontend component tests for meal logging UI
- Frontend component tests for goal tracking UI

**Key Constraints**:

- Test coverage: >85% for new code
- Mock external services (food database, cloud storage)
- Test edge cases (invalid inputs, boundary conditions)
- Performance tests: API response time <2s

**Related**: STP-Unit-Test-Plan, STP-Integration-Test-Plan

---

### TEST-03-002: Mental Wellness Tracking Tests (v0.3)

**Status**: ⏳ Not Started  
**Dependencies**: BE-03-003, FE-03-005  
**Module**: `backend/tests`, `frontend/src/__tests__`  
**Priority**: P0

**Functional Requirements**:

- Unit tests for mood/stress/sleep logging APIs
- Test data encryption for mental wellness data
- Integration tests for trend analysis
- Frontend tests for quick log widgets
- Privacy and security tests

**Key Constraints**:

- Test coverage: >85% for new code
- Verify encryption is applied correctly
- Test privacy controls (data isolation)
- Validate scale ranges (1-10)

**Related**: STP-Unit-Test-Plan, Security Test Plan

---

## Definition of Done

### For ALL Tasks:

- [ ] Code implements functional requirements
- [ ] Unit tests written (coverage >85%)
- [ ] Integration tests pass
- [ ] No linting errors
- [ ] API documentation updated
- [ ] PR approved by reviewer

### For Health & Wellness Tasks:

- [ ] Data validation tested (allergens, scales, ranges)
- [ ] Privacy controls verified
- [ ] Error states handled gracefully
- [ ] Audit logging implemented (where required)

---

## Performance Targets

| Metric              | Target | Current (v0.2) |
| ------------------- | ------ | -------------- |
| API Response Time   | <2s    | 1.2s           |
| Test Coverage       | >85%   | 88%            |
| Page Load Time      | <3s    | 2.5s           |
| Database Query Time | <500ms | 350ms          |
| Uptime              | >99%   | N/A (dev)      |

---

## Related Documentation

- **Functional Requirements**: `docs/2-SRS/3-specific-requirements/FR.md`
- **Use Cases**: `docs/2-SRS/3-specific-requirements/UC.md`
- **API Design**: `docs/3-DESIGN/3.2-SDD/API-DESIGN.md`
- **Database Schema**: `docs/3-DESIGN/3.2-SDD/DATABASE-SCHEMA.md`
- **Milestones**: `docs/5-PROJECT-MANAGEMENT/milestones.md`
- **Test Plans**: `docs/5-STP/` (Unit, Integration, System, Acceptance)

---

**Last Updated**: October 26, 2025  
**Next Review**: End of v0.3 milestone
