"""Tests for enhanced allergen management features (bulk, search, audit logs)."""

import json

from fastapi import status
from sqlalchemy.orm import Session

from src.eatsential.models.models import AllergenAuditLogDB, UserDB
from src.eatsential.schemas import AllergenCreate
from src.eatsential.services.health_service import HealthProfileService


# Bulk Import Tests


def test_bulk_import_allergens_success(
    client, admin_user: UserDB, admin_auth_headers: dict
):
    """Test successful bulk import of allergens."""
    bulk_data = {
        "allergens": [
            {
                "name": "Soy",
                "category": "legumes",
                "is_major_allergen": True,
                "description": "Common allergen",
            },
            {
                "name": "Sesame",
                "category": "seeds",
                "is_major_allergen": True,
                "description": "Growing allergen concern",
            },
            {
                "name": "Mustard",
                "category": "spices",
                "is_major_allergen": False,
                "description": "Common in condiments",
            },
        ]
    }

    response = client.post(
        "/api/health/admin/allergens/bulk",
        json=bulk_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success_count"] == 3
    assert data["failure_count"] == 0
    assert len(data["errors"]) == 0


def test_bulk_import_with_duplicates(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict, milk_allergen
):
    """Test bulk import with some duplicate allergens."""
    bulk_data = {
        "allergens": [
            {
                "name": "Milk",  # Already exists
                "category": "dairy",
                "is_major_allergen": True,
            },
            {
                "name": "Eggs",  # New
                "category": "animal_products",
                "is_major_allergen": True,
            },
        ]
    }

    response = client.post(
        "/api/health/admin/allergens/bulk",
        json=bulk_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success_count"] == 1
    assert data["failure_count"] == 1
    assert len(data["errors"]) == 1
    assert "already exists" in data["errors"][0].lower()


def test_bulk_import_exceeds_limit(client, admin_auth_headers: dict):
    """Test bulk import with more than 100 items."""
    bulk_data = {
        "allergens": [
            {
                "name": f"Allergen_{i}",
                "category": "test",
                "is_major_allergen": False,
            }
            for i in range(101)
        ]
    }

    response = client.post(
        "/api/health/admin/allergens/bulk",
        json=bulk_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success_count"] == 0
    assert data["failure_count"] == 101
    assert any("Maximum 100" in error for error in data["errors"])


def test_bulk_import_requires_admin(client, user_auth_headers: dict):
    """Test that bulk import requires admin privileges."""
    bulk_data = {
        "allergens": [{"name": "Test", "category": "test", "is_major_allergen": False}]
    }

    response = client.post(
        "/api/health/admin/allergens/bulk",
        json=bulk_data,
        headers=user_auth_headers,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


# Search and Filter Tests


def test_search_allergens_by_name(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test searching allergens by name."""
    # Create test allergens
    service = HealthProfileService(db)
    service.create_allergen(
        AllergenCreate(name="Peanuts", category="nuts", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Peas", category="vegetables", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Shellfish", category="seafood", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )

    # Search for "pea" (should match Peanuts and Peas)
    response = client.get(
        "/api/health/admin/allergens/search?name=pea",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    names = [item["name"] for item in data["items"]]
    assert "peanuts" in names
    assert "peas" in names


def test_search_allergens_by_category(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test filtering allergens by category."""
    service = HealthProfileService(db)
    service.create_allergen(
        AllergenCreate(name="Almonds", category="nuts", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Walnuts", category="nuts", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Salmon", category="seafood", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )

    response = client.get(
        "/api/health/admin/allergens/search?category=nuts",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 2
    assert all(item["category"] == "nuts" for item in data["items"])


def test_search_allergens_by_major_status(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test filtering allergens by major allergen status."""
    service = HealthProfileService(db)
    service.create_allergen(
        AllergenCreate(name="Wheat", category="grains", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Rye", category="grains", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )

    response = client.get(
        "/api/health/admin/allergens/search?is_major_allergen=true",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(item["is_major_allergen"] is True for item in data["items"])


def test_search_allergens_pagination(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test pagination in allergen search."""
    service = HealthProfileService(db)

    # Create 5 allergens
    for i in range(5):
        service.create_allergen(
            AllergenCreate(
                name=f"Allergen_{i}",
                category="test",
                is_major_allergen=False,
            ),
            admin_user.id,
            admin_user.username,
        )

    # Get first page (2 items)
    response = client.get(
        "/api/health/admin/allergens/search?skip=0&limit=2",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["skip"] == 0
    assert data["limit"] == 2

    # Get second page
    response = client.get(
        "/api/health/admin/allergens/search?skip=2&limit=2",
        headers=admin_auth_headers,
    )

    data = response.json()
    assert len(data["items"]) == 2
    assert data["skip"] == 2


def test_search_requires_admin(client, user_auth_headers: dict):
    """Test that search requires admin privileges."""
    response = client.get(
        "/api/health/admin/allergens/search",
        headers=user_auth_headers,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


# Export Tests


def test_export_allergens_json(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test exporting allergens as JSON."""
    service = HealthProfileService(db)
    service.create_allergen(
        AllergenCreate(name="Fish", category="seafood", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Corn", category="grains", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )

    response = client.get(
        "/api/health/admin/allergens/export?format=json",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_export_allergens_csv(
    client, db: Session, admin_auth_headers: dict, admin_user: UserDB
):
    """Test exporting allergens as CSV."""
    service = HealthProfileService(db)
    service.create_allergen(
        AllergenCreate(name="Banana", category="fruits", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )

    response = client.get(
        "/api/health/admin/allergens/export?format=csv",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]

    # Verify CSV content
    csv_content = response.text
    assert "id,name,category,is_major_allergen,description" in csv_content
    assert "banana" in csv_content.lower()


def test_export_invalid_format(client, admin_auth_headers: dict):
    """Test export with invalid format parameter."""
    response = client.get(
        "/api/health/admin/allergens/export?format=xml",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_export_requires_admin(client, user_auth_headers: dict):
    """Test that export requires admin privileges."""
    response = client.get(
        "/api/health/admin/allergens/export?format=json",
        headers=user_auth_headers,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


# Audit Log Tests


def test_audit_log_create(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict
):
    """Test that creating an allergen creates an audit log."""
    allergen_data = {
        "name": "Kiwi",
        "category": "fruits",
        "is_major_allergen": False,
        "description": "Tropical fruit",
    }

    response = client.post(
        "/api/health/admin/allergens",
        json=allergen_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED
    allergen_id = response.json()["id"]

    # Check audit log
    audit_logs = (
        db.query(AllergenAuditLogDB)
        .filter(AllergenAuditLogDB.allergen_id == allergen_id)
        .all()
    )

    assert len(audit_logs) == 1
    log = audit_logs[0]
    assert log.action == "create"
    assert log.allergen_name == "kiwi"
    assert log.admin_user_id == admin_user.id
    assert log.admin_username == admin_user.username
    assert log.changes is not None


def test_audit_log_update(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict, milk_allergen
):
    """Test that updating an allergen creates an audit log."""
    update_data = {
        "category": "dairy_products",
        "description": "Updated description",
    }

    response = client.put(
        f"/api/health/admin/allergens/{milk_allergen.id}",
        json=update_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK

    # Check audit log
    audit_logs = (
        db.query(AllergenAuditLogDB)
        .filter(AllergenAuditLogDB.allergen_id == milk_allergen.id)
        .filter(AllergenAuditLogDB.action == "update")
        .all()
    )

    assert len(audit_logs) >= 1
    log = audit_logs[-1]  # Get most recent
    assert log.action == "update"
    assert log.admin_user_id == admin_user.id

    # Verify changes are tracked
    assert log.changes is not None
    changes = json.loads(log.changes)
    assert "category" in changes
    assert changes["category"]["new"] == "dairy_products"


def test_audit_log_delete(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict
):
    """Test that deleting an allergen creates an audit log."""
    # Create an allergen first
    service = HealthProfileService(db)
    allergen = service.create_allergen(
        AllergenCreate(name="Papaya", category="fruits", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    allergen_id = allergen.id

    # Delete it
    response = client.delete(
        f"/api/health/admin/allergens/{allergen_id}",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK

    # Check audit log
    audit_logs = (
        db.query(AllergenAuditLogDB)
        .filter(AllergenAuditLogDB.allergen_id == allergen_id)
        .filter(AllergenAuditLogDB.action == "delete")
        .all()
    )

    assert len(audit_logs) == 1
    log = audit_logs[0]
    assert log.action == "delete"
    assert log.allergen_name == "papaya"


def test_get_audit_logs(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict
):
    """Test retrieving audit logs."""
    # Create some allergens to generate logs
    service = HealthProfileService(db)
    allergen1 = service.create_allergen(
        AllergenCreate(name="Apple", category="fruits", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Orange", category="fruits", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )

    # Get all audit logs
    response = client.get(
        "/api/health/admin/allergens/audit-logs",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) >= 2

    # Get logs for specific allergen
    response = client.get(
        f"/api/health/admin/allergens/audit-logs?allergen_id={allergen1.id}",
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    logs = response.json()
    assert all(log["allergen_id"] == allergen1.id for log in logs)


def test_audit_log_bulk_import(
    client, db: Session, admin_user: UserDB, admin_auth_headers: dict
):
    """Test that bulk import creates audit log."""
    bulk_data = {
        "allergens": [
            {"name": "Carrot", "category": "vegetables", "is_major_allergen": False},
            {"name": "Celery", "category": "vegetables", "is_major_allergen": True},
        ]
    }

    response = client.post(
        "/api/health/admin/allergens/bulk",
        json=bulk_data,
        headers=admin_auth_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED

    # Check audit log for bulk import
    audit_logs = (
        db.query(AllergenAuditLogDB)
        .filter(AllergenAuditLogDB.action == "bulk_import")
        .all()
    )

    assert len(audit_logs) >= 1
    log = audit_logs[-1]
    assert log.action == "bulk_import"
    assert "2 allergens" in log.allergen_name


def test_get_audit_logs_requires_admin(client, user_auth_headers: dict):
    """Test that getting audit logs requires admin privileges."""
    response = client.get(
        "/api/health/admin/allergens/audit-logs",
        headers=user_auth_headers,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


# Service Layer Tests


def test_service_search_allergens(db: Session, admin_user: UserDB):
    """Test service layer search functionality."""
    service = HealthProfileService(db)

    # Create test data
    service.create_allergen(
        AllergenCreate(name="Hazelnut", category="nuts", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Macadamia", category="nuts", is_major_allergen=False),
        admin_user.id,
        admin_user.username,
    )
    service.create_allergen(
        AllergenCreate(name="Lobster", category="seafood", is_major_allergen=True),
        admin_user.id,
        admin_user.username,
    )

    # Search by category
    allergens, total = service.search_allergens(category="nuts")
    assert total == 2
    assert all(a.category == "nuts" for a in allergens)

    # Search by major allergen
    allergens, total = service.search_allergens(is_major_allergen=True)
    assert all(a.is_major_allergen for a in allergens)

    # Search by name
    allergens, total = service.search_allergens(name="nut")
    assert total >= 1  # At least Hazelnut should match
    assert all("nut" in a.name for a in allergens)

    # Test pagination
    allergens, total = service.search_allergens(skip=1, limit=1)
    assert len(allergens) == 1
