# Sprint Tasks

**Current Sprint**: Sprint 1 (Oct 19-26, 2025)  
**Theme**: Authentication, Health Profile, & Admin Foundation

---

## 🚨 Critical Issues (Resolved)

| Issue                                                   | Description                              | Task ID   | Status   |
| ------------------------------------------------------- | ---------------------------------------- | --------- | -------- |
| [#41](https://github.com/Asoingbob225/CSC510/issues/41) | Password validation doesn't match FR-001 | FE-S1-001 | ✅ Fixed |
| [#42](https://github.com/Asoingbob225/CSC510/issues/42) | Email verification flow missing          | BE-S1-002 | ✅ Fixed |
| [#43](https://github.com/Asoingbob225/CSC510/issues/43) | User registration API missing            | BE-S1-001 | ✅ Fixed |

---

## Frontend Tasks

### FE-S1-001: Fix Password Validation ⚠️

**Status**: ✅ Complete  
**Estimate**: 2 hours  
**Dependencies**: None  
**Completion**: Implemented in SignupField.tsx and schemas.py

```typescript
// Required Changes in SignupField.tsx
password: z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(48, { message: 'Password must be at most 48 characters' })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number and special character' }
  ),
```

**Acceptance Criteria**:

- [x] Password requires 8+ characters
- [x] Password requires uppercase, lowercase, number, special char
- [x] Error messages are clear
- [x] All tests pass

---

### FE-S1-002: Email Verification UI

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Dependencies**: BE-S1-002  
**Completion**: Implemented in VerifyEmail.tsx

**Files to Create**:

1. `frontend/src/pages/EmailVerification.tsx`
2. `frontend/src/pages/VerificationSuccess.tsx`
3. `frontend/src/components/ResendEmail.tsx`

**Key Features**:

- Show pending verification message
- Resend email button (rate limited)
- Success page after verification
- Handle expired tokens

---

### FE-S1-003: Health Profile Form 🏥

**Status**: ⚡ In Progress (See sub-issues: [#61], [#62])

**Estimate**: 8 hours

**Dependencies**: BE-S1-003

**Sub-issues**:

- [#61] Define Health Profile Data Fields and Validation

- [#62] Implement Multi-Step Health Profile Wizard UI

**Files to Create**:

1. `frontend/src/pages/HealthProfile.tsx`

2. `frontend/src/components/AllergyInput.tsx`

3. `frontend/src/components/AllergySeverityWarning.tsx`

4. `frontend/src/lib/api.ts` (extend with health profile endpoints)

**Critical Requirements**:

```typescript

// Allergen severity levels

enum AllergySeverity {

  MILD = 'MILD',

  MODERATE = 'MODERATE',

  SEVERE = 'SEVERE',

  LIFE_THREATENING = 'LIFE_THREATENING',

}



// Visual warnings based on severity

const severityStyles = {

  MILD: 'bg-yellow-100 border-yellow-500',

  MODERATE: 'bg-orange-100 border-orange-500',

  SEVERE: 'bg-red-100 border-red-500',

  LIFE_THREATENING: 'bg-red-600 text-white animate-pulse',

};

```

---

### FE-S1-004: Admin Panel Foundation UI

**Status**: 📝 To Do
**Estimate**: 6 hours
**Dependencies**: BE-S1-005
**Description**: Create the basic structure for the admin control panel. This includes setting up protected routes accessible only to admin users and building a main layout with navigation for future admin modules.

**Files to Create**:

1.  `frontend/src/pages/admin/AdminDashboard.tsx`
2.  `frontend/src/components/admin/AdminLayout.tsx`
3.  `frontend/src/components/admin/ProtectedRoute.tsx`

**Key Features**:

- A route group for `/admin/*` that requires admin privileges.
- A sidebar or top navigation for admin sections.
- A main dashboard page that can display system stats or links to management pages.

---

### FE-S1-005: Data Management UI (Allergens)

**Status**: 📝 To Do
**Estimate**: 6 hours
**Dependencies**: FE-S1-004, BE-S1-006
**Description**: Within the admin panel, build the interface for managing the central allergen database. This allows admins to add, update, and remove allergens, which will be used for user health profiles.

**Files to Create**:

1.  `frontend/src/pages/admin/AllergenManagement.tsx`
2.  `frontend/src/components/admin/AllergenTable.tsx`
3.  `frontend/src/components/admin/AllergenForm.tsx`

**Key Features**:

- Display all allergens in a table.
- A form to create a new allergen.
- Buttons to edit or delete existing allergens.

---

### FE-S1-006: Admin User Management UI

**Status**: 📝 To Do
**Estimate**: 7 hours
**Dependencies**: FE-S1-004, BE-S1-007
**Description**: Implement the user management interface in the admin panel. This will allow admins to view a list of all users, see their details, and perform administrative actions.

**Files to Create**:

1.  `frontend/src/pages/admin/UserManagement.tsx`
2.  `frontend/src/components/admin/UserTable.tsx`
3.  `frontend/src/components/admin/UserDetails.tsx`

**Key Features**:

- A table displaying all registered users with key information.
- Search and pagination for the user list.
- A details view to inspect a user's profile and activity.

---

## Backend Tasks

### BE-S1-001: User Registration API ⚠️

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Completion**: Implemented in auth.py with /auth/register endpoint  
**Dependencies**: BE-S1-004

**Files Created**:

1. `backend/src/eatsential/routers/auth.py`
2. `backend/src/eatsential/models.py`
3. `backend/src/eatsential/schemas.py`
4. `backend/src/eatsential/services/auth_service.py`

**Endpoint Specification**:

```python
@router.post("/auth/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Validate email uniqueness
    # Hash password with bcrypt
    # Create user with email_verified=False
    # Send verification email
    # Return user data (no password)
```

---

### BE-S1-002: Email Verification System

**Status**: ✅ Complete  
**Estimate**: 6 hours  
**Completion**: Implemented with verify-email endpoint and email service  
**Dependencies**: BE-S1-001

**Files Created**:

1. `backend/src/eatsential/emailer.py` (SMTP)
2. `backend/src/eatsential/emailer_ses.py` (AWS SES)
3. `backend/src/eatsential/auth_util.py` (token handling)

**Key Features**:

```python
# Token generation
def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

# Email template
def send_verification_email(email: str, token: str):
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    # Send email with link
```

---

### BE-S1-003: Health Profile CRUD 🏥

**Status**: ✅ Complete
**Estimate**: 8 hours  
**Dependencies**: BE-S1-001

**Files Created**:

1. `backend/src/eatsential/routers/health.py`
2. `backend/src/eatsential/models/models.py` (extended with health models)
3. `backend/src/eatsential/schemas/schemas.py` (added health schemas)
4. `backend/src/eatsential/services/health_service.py`
5. `backend/tests/health/test_profile.py`
6. `backend/tests/health/test_allergies.py`
7. `backend/tests/health/test_dietary_preferences.py`

**Critical Validation**:

```python
APPROVED_ALLERGENS = [
    "Peanuts", "Tree Nuts", "Milk", "Eggs",
    "Wheat", "Soy", "Fish", "Shellfish",
    "Sesame", "Mustard", "Celery", "Lupin"
]

def validate_allergen(name: str) -> bool:
    if name not in APPROVED_ALLERGENS:
        raise ValueError(f"'{name}' is not a recognized allergen")
    return True
```

---

### BE-S1-004: Database Setup

**Status**: ✅ Complete  
**Estimate**: 4 hours  
**Dependencies**: None  
**Completion**: Database configuration and migrations are set up

**Files Created**:

1. `backend/alembic.ini` ✓
2. `backend/alembic/env.py` ✓
3. `backend/src/eatsential/database.py` ✓

**Initial Migration**:

```bash
# Already completed
# Users table created with proper schema
# SQLite for development, PostgreSQL for production
```

---

### BE-S1-005: Admin Role & Protected Routes API

**Status**: 📝 To Do
**Estimate**: 5 hours
**Dependencies**: BE-S1-004
**Description**: Implement the backend foundation for the admin system. This involves adding a role to the user model to distinguish admins and creating a reusable dependency to protect admin-only API endpoints.

**Files to Modify/Create**:

1.  `backend/src/eatsential/models/models.py` (add role to User)
2.  `backend/src/eatsential/schemas/schemas.py` (update User schema)
3.  `backend/src/eatsential/services/auth_service.py` (create `get_current_admin_user` dependency)
4.  `backend/alembic/versions/` (new migration for user role)

**Key Features**:

- Add a `role` (e.g., 'user', 'admin') or `is_admin` boolean to the `User` model.
- Create a FastAPI dependency that verifies the current authenticated user is an admin.
- Generate a new database migration.

---

### BE-S1-006: Data Management API (Allergens)

**Status**: 📝 To Do
**Estimate**: 5 hours
**Dependencies**: BE-S1-005
**Description**: Create the CRUD API endpoints for managing the allergen database. These endpoints will be protected and only accessible by administrators. This will replace the hardcoded list of allergens.

**Files to Create**:

1.  `backend/src/eatsential/routers/admin.py`
2.  `backend/src/eatsential/services/admin_service.py`
3.  `backend/src/eatsential/models/models.py` (add `Allergen` model)
4.  `backend/tests/routers/test_admin.py`

**Endpoint Specification**:

```python
@router.post("/admin/allergens", response_model=Allergen, status_code=201)
async def create_allergen(
    allergen: AllergenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Logic to create an allergen
    return new_allergen
```

**Acceptance Criteria**:

- CRUD endpoints for allergens under `/admin/allergens`.
- Endpoints are protected by the `get_current_admin_user` dependency.
- The `validate_allergen` function in `health_service` is updated to use the new database table.

---

### BE-S1-007: Admin User Management API

**Status**: 📝 To Do
**Estimate**: 6 hours
**Dependencies**: BE-S1-005
**Description**: Create the API endpoints for administrators to manage users. This includes listing users and viewing detailed information about a specific user.

**Files to Modify/Create**:

1.  `backend/src/eatsential/routers/admin.py` (extend with user endpoints)
2.  `backend/src/eatsential/services/admin_service.py` (add user management logic)
3.  `backend/tests/routers/test_admin.py` (add tests for user management)

**Endpoint Specification**:

```python
@router.get("/admin/users", response_model=list[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Logic to list all users
    return users
```

**Acceptance Criteria**:

- `GET /admin/users` endpoint to list all users.
- `GET /admin/users/{user_id}` endpoint to get a single user's details.
- Endpoints are protected by the `get_current_admin_user` dependency.

---

## Sprint Summary

### Completed Tasks ✅

- FE-S1-001: Password Validation Fixed
- FE-S1-002: Email Verification UI
- BE-S1-001: User Registration API
- BE-S1-002: Email Verification System
- BE-S1-003: Health Profile CRUD
- BE-S1-004: Database Setup

### Remaining Tasks 🔴

- FE-S1-003: Health Profile Form
- FE-S1-004: Admin Panel Foundation UI
- FE-S1-005: Data Management UI (Allergens)
- FE-S1-006: Admin User Management UI
- BE-S1-005: Admin Role & Protected Routes API
- BE-S1-006: Data Management API (Allergens)
- BE-S1-007: Admin User Management API

### Sprint Progress: 46% Complete (6/13 tasks)

## Task Assignment

| Developer | Focus Area       | Tasks                | Status         |
| --------- | ---------------- | -------------------- | -------------- |
| Dev 1     | Frontend Auth    | FE-S1-001, FE-S1-002 | ✅ Complete    |
| Dev 2     | Backend Auth     | BE-S1-001, BE-S1-002 | ✅ Complete    |
| Dev 3     | Health Profile   | FE-S1-003, BE-S1-003 | ⚡ In Progress |
| Dev 4     | Infrastructure   | BE-S1-004            | ✅ Complete    |
| Dev 5     | Admin Foundation | FE-S1-004, BE-S1-005 | 📝 To Do       |
| Dev 6     | Admin Features   | FE-S1-005, BE-S1-006 | 📝 To Do       |
| Dev 7     | Admin User Mgmt  | FE-S1-006, BE-S1-007 | 📝 To Do       |

---

## Definition of Done

### For ALL Tasks:

- [x] Code implements requirements
- [x] Unit tests written (88% coverage)
- [x] Integration tests pass
- [x] No linting errors
- [x] Documentation updated
- [x] PR approved by reviewer

### For Health-Related Tasks:

- [x] Allergen validation tested
- [x] Safety warnings prominent
- [x] Audit logging implemented
- [x] Error states handled

---

## Daily Standup Template

```markdown
**Date**: [DATE]
**Developer**: [NAME]

**Yesterday**:

- Completed [TASK-ID]: [description]

**Today**:

- Working on [TASK-ID]: [description]
- Blocked by: [blocker or "None"]

**Help Needed**:

- [Specific help needed or "None"]
```

---

## Sprint Metrics

| Metric          | Target   | Current |
| --------------- | -------- | ------- |
| Tasks Completed | 13       | 6       |
| Test Coverage   | 80%      | 88%     |
| PR Cycle Time   | <4 hours | 2 hours |
| Critical Bugs   | 0        | 0       |

---
