"""Tests for the health service."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models import UserDB
from src.eatsential.models.models import AllergySeverity, PreferenceType
from src.eatsential.schemas import (
    DietaryPreferenceCreate,
    DietaryPreferenceUpdate,
    HealthProfileCreate,
    UserAllergyCreate,
    UserAllergyUpdate,
)
from src.eatsential.services.health_service import HealthProfileService


def test_get_or_create_allergen(db: Session):
    """Test getting or creating an allergen."""
    service = HealthProfileService(db)
    allergen = service.get_or_create_allergen("milk")
    assert allergen.name == "milk"

    # Test getting the same allergen
    allergen2 = service.get_or_create_allergen("milk")
    assert allergen2.id == allergen.id


def test_add_allergy_exception(db: Session, test_user: UserDB):
    """Test exception handling when adding an allergy."""
    service = HealthProfileService(db)
    with pytest.raises(
        ValueError, match=r"Health profile not found. Please create one first."
    ):
        service.add_allergy(
            test_user.id,
            UserAllergyCreate(
                allergen_id="milk_id",
                severity=AllergySeverity.MILD,
                reaction_type="other",
            ),
        )


def test_add_dietary_preference_exception(db: Session, test_user: UserDB):
    """Test exception handling when adding a dietary preference."""
    service = HealthProfileService(db)
    with pytest.raises(
        ValueError, match=r"Health profile not found. Please create one first."
    ):
        service.add_dietary_preference(
            test_user.id,
            DietaryPreferenceCreate(
                preference_type=PreferenceType.DIET, preference_name="vegetarian"
            ),
        )


def test_update_allergy_if_conditions(db: Session, test_user: UserDB, milk_allergen):
    """Test the if conditions in the update_allergy function."""
    service = HealthProfileService(db)
    service.create_health_profile(test_user.id, HealthProfileCreate())
    user_allergy = service.add_allergy(
        test_user.id,
        UserAllergyCreate(
            allergen_id=milk_allergen.id,
            severity=AllergySeverity.MILD,
            reaction_type="other",
        ),
    )

    updated_allergy = service.update_allergy(
        user_allergy.id,
        UserAllergyUpdate(
            severity=AllergySeverity.SEVERE, notes="test notes", reaction_type="other"
        ),
    )
    assert updated_allergy.severity == AllergySeverity.SEVERE
    assert updated_allergy.notes == "test notes"


def test_update_dietary_preference_if_conditions(db: Session, test_user: UserDB):
    """Test the if conditions in the update_dietary_preference function."""
    service = HealthProfileService(db)
    service.create_health_profile(test_user.id, HealthProfileCreate())
    dietary_preference = service.add_dietary_preference(
        test_user.id,
        DietaryPreferenceCreate(
            preference_type=PreferenceType.DIET, preference_name="vegetarian"
        ),
    )

    updated_preference = service.update_dietary_preference(
        dietary_preference.id,
        DietaryPreferenceUpdate(preference_name="vegan", is_strict=False),
    )
    assert updated_preference.preference_name == "vegan"
    assert not updated_preference.is_strict


def test_list_all_allergens(db: Session, milk_allergen):
    """Test listing all allergens."""
    service = HealthProfileService(db)
    allergens = service.list_all_allergens()
    assert len(allergens) > 0
    assert allergens[0].name == "milk"
