# Health Profile Tests

This directory contains all tests related to the Health Profile feature.

## Test Structure

```
tests/health/
├── __init__.py                    # Package marker
├── conftest.py                    # Shared fixtures for all health tests
├── test_profile.py                # Health profile CRUD tests
├── test_allergies.py              # Allergen and user allergy tests
├── test_dietary_preferences.py    # Dietary preference tests
└── test_integration.py            # Integration and workflow tests
```

## Test Categories

### `test_profile.py`

Tests for health profile CRUD operations:

- Create health profile with various activity levels
- Get health profile
- Update health profile (full and partial updates)
- Delete health profile
- Validation tests (invalid values, unauthorized access)
- BMI calculation verification

### `test_allergies.py`

Tests for allergen database and user allergies:

- Get available allergens list
- Add user allergies with different severity levels
- Update user allergy severity
- Delete user allergies
- Validation tests (invalid allergens, duplicate allergies)

### `test_dietary_preferences.py`

Tests for dietary preferences:

- Add preferences with all types (vegetarian, vegan, halal, etc.)
- Add preferences with different reasons (health, religious, ethical, etc.)
- Update dietary preferences
- Delete dietary preferences
- Validation tests (invalid types/reasons, duplicates)

### `test_integration.py`

Integration tests covering complete workflows:

- Complete health profile setup workflow
- Cascade delete behavior
- Authentication requirements for all endpoints

## Running Tests

Run all health tests:

```bash
pytest tests/health/
```

Run specific test file:

```bash
pytest tests/health/test_profile.py
pytest tests/health/test_allergies.py
pytest tests/health/test_dietary_preferences.py
pytest tests/health/test_integration.py
```

Run with coverage:

```bash
pytest tests/health/ --cov=src/eatsential/routers/health --cov=src/eatsential/services/health_service
```

Run with verbose output:

```bash
pytest tests/health/ -v
```

## Fixtures

All health tests share common fixtures defined in `conftest.py`:

- `client`: TestClient with test database
- `auth_headers`: Authentication headers for a test user
- `db_session`: Direct database session for setup operations
- `mock_send_email`: Mocked email sending function

## Test Coverage

These tests cover:

- ✅ All CRUD operations for health profiles
- ✅ All CRUD operations for user allergies
- ✅ All CRUD operations for dietary preferences
- ✅ All enum values (ActivityLevel, AllergySeverity, PreferenceType, PreferenceReason)
- ✅ Input validation and error handling
- ✅ Authentication requirements
- ✅ Database constraints and relationships
- ✅ Complete user workflows
