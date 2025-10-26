"""Tests for admin allergen management endpoints."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models import UserDB
from src.eatsential.schemas import AllergenCreate, AllergenUpdate
from src.eatsential.services.health_service import HealthProfileService


def test_create_allergen(db: Session):
    """Test creating a new allergen."""
    service = HealthProfileService(db)
    allergen_data = AllergenCreate(
        name="Pineapple",
        category="fruit",
        is_major_allergen=False,
        description="Tropical fruit allergen",
    )

    allergen = service.create_allergen(allergen_data)
    assert allergen.name == "pineapple"  # Should be lowercased
    assert allergen.category == "fruit"
    assert allergen.is_major_allergen is False
    assert allergen.description == "Tropical fruit allergen"
    assert allergen.id is not None


def test_create_duplicate_allergen(db: Session, milk_allergen):
    """Test that creating a duplicate allergen raises an error."""
    service = HealthProfileService(db)
    allergen_data = AllergenCreate(
        name="Milk",  # Already exists
        category="dairy",
        is_major_allergen=True,
    )

    with pytest.raises(ValueError, match=r"already exists"):
        service.create_allergen(allergen_data)


def test_get_allergen_by_id(db: Session, milk_allergen):
    """Test getting an allergen by ID."""
    service = HealthProfileService(db)
    allergen = service.get_allergen_by_id(milk_allergen.id)
    assert allergen is not None
    assert allergen.id == milk_allergen.id
    assert allergen.name == "milk"


def test_get_allergen_by_id_not_found(db: Session):
    """Test getting a non-existent allergen."""
    service = HealthProfileService(db)
    allergen = service.get_allergen_by_id("non-existent-id")
    assert allergen is None


def test_update_allergen(db: Session, milk_allergen):
    """Test updating an allergen."""
    service = HealthProfileService(db)
    update_data = AllergenUpdate(
        description="Updated description for milk allergen",
        is_major_allergen=True,
    )

    updated_allergen = service.update_allergen(milk_allergen.id, update_data)
    assert updated_allergen.description == "Updated description for milk allergen"
    assert updated_allergen.is_major_allergen is True
    assert updated_allergen.name == "milk"  # Name should not change


def test_update_allergen_name(db: Session, milk_allergen):
    """Test updating an allergen's name."""
    service = HealthProfileService(db)
    update_data = AllergenUpdate(name="Dairy")

    updated_allergen = service.update_allergen(milk_allergen.id, update_data)
    assert updated_allergen.name == "dairy"  # Should be lowercased


def test_update_allergen_duplicate_name(db: Session):
    """Test updating an allergen to a name that already exists."""
    service = HealthProfileService(db)

    # Create two allergens
    service.create_allergen(
        AllergenCreate(name="Allergen1", category="food", is_major_allergen=False)
    )
    allergen2 = service.create_allergen(
        AllergenCreate(name="Allergen2", category="food", is_major_allergen=False)
    )

    # Try to update allergen2's name to allergen1's name
    update_data = AllergenUpdate(name="Allergen1")
    with pytest.raises(ValueError, match=r"already exists"):
        service.update_allergen(allergen2.id, update_data)


def test_update_allergen_not_found(db: Session):
    """Test updating a non-existent allergen."""
    service = HealthProfileService(db)
    update_data = AllergenUpdate(description="Test")

    with pytest.raises(ValueError, match=r"not found"):
        service.update_allergen("non-existent-id", update_data)


def test_delete_allergen(db: Session):
    """Test deleting an allergen."""
    service = HealthProfileService(db)

    # Create an allergen
    allergen = service.create_allergen(
        AllergenCreate(name="TestAllergen", category="test", is_major_allergen=False)
    )

    # Delete it
    deleted = service.delete_allergen(allergen.id)
    assert deleted is True

    # Verify it's gone
    allergen = service.get_allergen_by_id(allergen.id)
    assert allergen is None


def test_delete_allergen_not_found(db: Session):
    """Test deleting a non-existent allergen."""
    service = HealthProfileService(db)
    deleted = service.delete_allergen("non-existent-id")
    assert deleted is False


def test_delete_allergen_in_use(db: Session, test_user: UserDB, milk_allergen):
    """Test that deleting an allergen in use raises an error."""
    from src.eatsential.models.models import AllergySeverity
    from src.eatsential.schemas import HealthProfileCreate, UserAllergyCreate

    service = HealthProfileService(db)

    # Create a health profile
    service.create_health_profile(test_user.id, HealthProfileCreate())

    # Add an allergy using the allergen
    service.add_allergy(
        test_user.id,
        UserAllergyCreate(
            allergen_id=milk_allergen.id,
            severity=AllergySeverity.MILD,
            reaction_type="skin rash",
        ),
    )

    # Try to delete the allergen
    with pytest.raises(ValueError, match=r"currently used by"):
        service.delete_allergen(milk_allergen.id)


def test_list_all_allergens(db: Session):
    """Test listing all allergens."""
    service = HealthProfileService(db)

    # Create multiple allergens
    service.create_allergen(
        AllergenCreate(name="Allergen A", category="test", is_major_allergen=False)
    )
    service.create_allergen(
        AllergenCreate(name="Allergen B", category="test", is_major_allergen=True)
    )
    service.create_allergen(
        AllergenCreate(name="Allergen C", category="test", is_major_allergen=False)
    )

    allergens = service.list_all_allergens()
    assert len(allergens) >= 3
    # Verify they're sorted by name
    allergen_names = [a.name for a in allergens]
    assert allergen_names == sorted(allergen_names)
