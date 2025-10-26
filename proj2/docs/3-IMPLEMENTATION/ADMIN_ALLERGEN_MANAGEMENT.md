# Admin Allergen Management API Implementation

## Overview

This implementation adds CRUD API endpoints for managing the allergen database, protected by admin-only access. This replaces the hardcoded list of allergens with a fully database-driven system.

## Changes Made

### 1. Schemas (`schemas.py`)

Added new Pydantic schemas for allergen management:

- **AllergenCreate**: Schema for creating new allergens
  - `name`: Allergen name (required)
  - `category`: Allergen category (required)
  - `is_major_allergen`: Boolean flag for major allergens (default: False)
  - `description`: Optional description

- **AllergenUpdate**: Schema for updating allergens
  - All fields are optional to allow partial updates
  - Fields: `name`, `category`, `is_major_allergen`, `description`

### 2. Service Layer (`health_service.py`)

#### Removed:

- `APPROVED_ALLERGENS` hardcoded list
- `validate_allergen()` function (validation now happens through database)

#### Modified:

- **`get_or_create_allergen()`**: Now only gets existing allergens from database
  - No longer automatically creates allergens
  - Raises `ValueError` if allergen not found
  - Users must contact admin to add new allergens

#### Added Methods:

- **`create_allergen(allergen_data: AllergenCreate)`**: Create a new allergen (admin only)
  - Validates uniqueness by name
  - Automatically lowercases allergen names
  - Returns created AllergenDB object

- **`get_allergen_by_id(allergen_id: str)`**: Get allergen by ID
  - Returns AllergenDB or None

- **`update_allergen(allergen_id: str, allergen_data: AllergenUpdate)`**: Update an allergen
  - Validates name uniqueness if name is being changed
  - Allows partial updates
  - Returns updated AllergenDB object

- **`delete_allergen(allergen_id: str)`**: Delete an allergen
  - Prevents deletion if allergen is in use by any user
  - Returns True if deleted, False if not found
  - Raises ValueError if allergen is in use

### 3. Router Endpoints (`health.py`)

Added public and admin-protected allergen endpoints:

#### Public Allergen Endpoints

##### GET `/health/allergens` (200 OK)

List all available allergens (public access)

- **Response**: Array of AllergenResponse
- **Errors**:
  - 500: Server error

##### GET `/health/allergens/{allergen_id}` (200 OK)

Get a specific allergen by ID (public access)

- **Path Parameters**: allergen_id (string)
- **Response**: AllergenResponse
- **Errors**:
  - 404: Allergen not found
  - 500: Server error

#### Admin-Only Allergen Management Endpoints

Added admin-protected endpoints under `/health/admin/allergens`:

##### POST `/health/admin/allergens` (201 Created)

Create a new allergen (admin only)

- **Request Body**: AllergenCreate schema
- **Response**: AllergenResponse
- **Errors**:
  - 400: Allergen already exists
  - 403: Not an admin user
  - 500: Server error

##### PUT `/health/admin/allergens/{allergen_id}` (200 OK)

Update an allergen (admin only)

- **Path Parameters**: allergen_id (string)
- **Request Body**: AllergenUpdate schema
- **Response**: AllergenResponse
- **Errors**:
  - 400: Duplicate name
  - 404: Allergen not found
  - 403: Not an admin user
  - 500: Server error

##### DELETE `/health/admin/allergens/{allergen_id}` (200 OK)

Delete an allergen (admin only)

- **Path Parameters**: allergen_id (string)
- **Response**: MessageResponse
- **Errors**:
  - 400: Allergen is in use
  - 404: Allergen not found
  - 403: Not an admin user
  - 500: Server error

### 4. Tests

Created comprehensive test suite in `test_admin_allergens.py`:

- ✅ test_create_allergen
- ✅ test_create_duplicate_allergen
- ✅ test_get_allergen_by_id
- ✅ test_get_allergen_by_id_not_found
- ✅ test_update_allergen
- ✅ test_update_allergen_name
- ✅ test_update_allergen_duplicate_name
- ✅ test_update_allergen_not_found
- ✅ test_delete_allergen
- ✅ test_delete_allergen_not_found
- ✅ test_delete_allergen_in_use
- ✅ test_list_all_allergens

Updated `test_health_service.py`:

- Modified `test_get_or_create_allergen` to reflect new behavior

**All 52 health tests pass successfully.**

## Acceptance Criteria ✅

All acceptance criteria have been met:

1. ✅ **CRUD endpoints for allergens under `/admin/allergens`**
   - POST, GET, PUT, DELETE endpoints implemented
   - All endpoints properly documented with docstrings

2. ✅ **Endpoints are protected by `get_current_admin_user` dependency**
   - All admin endpoints use `AdminUserDep` dependency
   - Returns 403 Forbidden for non-admin users

3. ✅ **The `validate_allergen` function is updated to use the new database table**
   - Removed hardcoded `APPROVED_ALLERGENS` list
   - Removed `validate_allergen()` function
   - All validation now happens through database queries
   - `get_or_create_allergen()` updated to only use database allergens

4. ✅ **Direct operations for allergens_db are auth-protected**
   - All allergen creation/modification requires admin authentication
   - Regular users can only read allergen list via GET `/health/allergens`
   - Database integrity maintained with foreign key constraints

## Security Features

1. **Admin-Only Access**: All write operations require admin role
2. **Prevention of Data Loss**: Cannot delete allergens that are in use
3. **Data Validation**:
   - Names are automatically normalized (lowercased)
   - Uniqueness constraints enforced
   - Partial updates supported safely
4. **Error Handling**: Comprehensive error messages for all failure scenarios

## Migration Notes

For existing deployments:

1. Database already has `allergen_database` table (no schema changes needed)
2. Existing allergens can be managed through new admin API
3. Use `init_allergens.py` script to populate initial allergen data if needed
4. Users attempting to add unlisted allergens will see clear error message directing them to contact admin

## API Example Usage

```bash
# Admin creates a new allergen
curl -X POST "http://localhost:8000/api/health/admin/allergens" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kiwi",
    "category": "fruit",
    "is_major_allergen": false,
    "description": "Common fruit allergen"
  }'

# Admin updates an allergen
curl -X PUT "http://localhost:8000/api/health/admin/allergens/{id}" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'

# Admin deletes an allergen (only if not in use)
curl -X DELETE "http://localhost:8000/api/health/admin/allergens/{id}" \
  -H "Authorization: Bearer <admin_token>"
```
