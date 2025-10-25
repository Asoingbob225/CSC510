"""Health profile service for business logic and CRUD operations."""

from typing import Optional
from uuid import uuid4

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from ..models.models import (
    AllergenDB,
    DietaryPreferenceDB,
    HealthProfileDB,
    UserAllergyDB,
)
from ..schemas.schemas import (
    DietaryPreferenceCreate,
    DietaryPreferenceUpdate,
    HealthProfileCreate,
    HealthProfileUpdate,
    UserAllergyCreate,
    UserAllergyUpdate,
)

# FDA Big 9 Major Allergens + Common Food Allergens
APPROVED_ALLERGENS = [
    # FDA Big 9 Major Allergens
    "milk",
    "eggs",
    "fish",
    "shellfish",
    "tree nuts",
    "peanuts",
    "wheat",
    "soybeans",
    "sesame",
    # Specific tree nuts
    "almonds",
    "walnuts",
    "cashews",
    "pistachios",
    "pecans",
    "hazelnuts",
    "macadamia nuts",
    "brazil nuts",
    "pine nuts",
    # Specific shellfish
    "shrimp",
    "crab",
    "lobster",
    "clams",
    "oysters",
    "mussels",
    "scallops",
    # Specific fish
    "salmon",
    "tuna",
    "cod",
    "halibut",
    # Other common allergens
    "gluten",
    "lactose",
    "corn",
    "soy",
    "mustard",
    "celery",
    "lupin",
    "sulfites",
    "nitrates",
]


def validate_allergen(name: str) -> bool:
    """Validate that an allergen name is in the approved list.

    Args:
        name: The allergen name to validate

    Returns:
        True if the allergen is approved

    Raises:
        ValueError: If the allergen is not in the approved list

    """
    allergen_lower = name.lower().strip()
    if allergen_lower not in [a.lower() for a in APPROVED_ALLERGENS]:
        raise ValueError(
            f"Allergen '{name}' is not recognized. "
            f"Please use one of the approved allergens."
        )
    return True


class HealthProfileService:
    """Service class for health profile operations"""

    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db

    def get_health_profile(self, user_id: str) -> Optional[HealthProfileDB]:
        """Get health profile for a user with relationships loaded."""
        return (
            self.db.query(HealthProfileDB)
            .options(
                selectinload(HealthProfileDB.allergies).selectinload(
                    UserAllergyDB.allergen
                ),
                selectinload(HealthProfileDB.dietary_preferences),
            )
            .filter(HealthProfileDB.user_id == user_id)
            .first()
        )

    def create_health_profile(
        self, user_id: str, profile_data: HealthProfileCreate
    ) -> HealthProfileDB:
        """Create a new health profile for a user.

        Args:
            user_id: The user's ID
            profile_data: Health profile creation data

        Returns:
            Created HealthProfileDB object

        Raises:
            ValueError: If health profile already exists for this user

        """
        # Check if health profile already exists
        existing = self.get_health_profile(user_id)
        if existing:
            raise ValueError("Health profile already exists for this user")

        # Create new health profile
        health_profile = HealthProfileDB(
            id=str(uuid4()),
            user_id=user_id,
            height_cm=profile_data.height_cm,
            weight_kg=profile_data.weight_kg,
            activity_level=profile_data.activity_level,
            metabolic_rate=profile_data.metabolic_rate,
        )

        self.db.add(health_profile)
        self.db.commit()
        self.db.refresh(health_profile)

        return health_profile

    def update_health_profile(
        self, user_id: str, profile_data: HealthProfileUpdate
    ) -> HealthProfileDB:
        """Update an existing health profile.

        Args:
            user_id: The user's ID
            profile_data: Health profile update data

        Returns:
            Updated HealthProfileDB object

        Raises:
            ValueError: If health profile doesn't exist

        """
        health_profile = self.get_health_profile(user_id)
        if not health_profile:
            raise ValueError("Health profile not found for this user")

        # Update fields if provided
        if profile_data.height_cm is not None:
            health_profile.height_cm = profile_data.height_cm
        if profile_data.weight_kg is not None:
            health_profile.weight_kg = profile_data.weight_kg
        if profile_data.activity_level is not None:
            health_profile.activity_level = profile_data.activity_level
        if profile_data.metabolic_rate is not None:
            health_profile.metabolic_rate = profile_data.metabolic_rate

        self.db.commit()
        self.db.refresh(health_profile)

        return health_profile

    def delete_health_profile(self, user_id: str) -> bool:
        """Delete a health profile.

        Args:
            user_id: The user's ID

        Returns:
            True if deleted, False if not found

        """
        health_profile = self.get_health_profile(user_id)
        if not health_profile:
            return False

        self.db.delete(health_profile)
        self.db.commit()

        return True

    # Allergy operations

    def get_allergen_by_name(self, name: str) -> Optional[AllergenDB]:
        """Get allergen by name from database"""
        return (
            self.db.query(AllergenDB)
            .filter(AllergenDB.name == name.lower().strip())
            .first()
        )

    def get_or_create_allergen(self, name: str) -> AllergenDB:
        """Get existing allergen or create a new one.

        Args:
            name: Allergen name

        Returns:
            AllergenDB object

        Raises:
            ValueError: If allergen name is not approved

        """
        # Validate allergen
        validate_allergen(name)

        # Check if allergen exists
        allergen = self.get_allergen_by_name(name)
        if allergen:
            return allergen

        # Create new allergen
        allergen = AllergenDB(
            id=str(uuid4()),
            name=name.lower().strip(),
            category="food",  # Default category
            is_major_allergen=name.lower().strip()
            in [
                "milk",
                "eggs",
                "fish",
                "shellfish",
                "tree nuts",
                "peanuts",
                "wheat",
                "soybeans",
                "sesame",
            ],
        )

        self.db.add(allergen)
        self.db.commit()
        self.db.refresh(allergen)

        return allergen

    def add_allergy(
        self, user_id: str, allergy_data: UserAllergyCreate
    ) -> UserAllergyDB:
        """Add a new allergy to user's health profile.

        Args:
            user_id: The user's ID
            allergy_data: Allergy creation data

        Returns:
            Created UserAllergyDB object

        Raises:
            ValueError: If health profile doesn't exist or allergen not found

        """
        # Get health profile
        health_profile = self.get_health_profile(user_id)
        if not health_profile:
            raise ValueError("Health profile not found. Please create one first.")

        # Verify allergen exists
        allergen = (
            self.db.query(AllergenDB)
            .filter(AllergenDB.id == allergy_data.allergen_id)
            .first()
        )
        if not allergen:
            raise ValueError("Allergen not found")

        # Prevent duplicate allergy entries for the same health profile
        existing_allergy = (
            self.db.query(UserAllergyDB)
            .filter(
                UserAllergyDB.health_profile_id == health_profile.id,
                UserAllergyDB.allergen_id == allergy_data.allergen_id,
            )
            .first()
        )
        if existing_allergy:
            raise ValueError("This allergy already exists for this user")

        # Create new allergy
        user_allergy = UserAllergyDB(
            id=str(uuid4()),
            health_profile_id=health_profile.id,
            allergen_id=allergy_data.allergen_id,
            severity=allergy_data.severity,
            diagnosed_date=allergy_data.diagnosed_date,
            reaction_type=allergy_data.reaction_type,
            notes=allergy_data.notes,
            is_verified=allergy_data.is_verified,
        )

        self.db.add(user_allergy)
        try:
            self.db.commit()
            self.db.refresh(user_allergy)
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError("This allergy already exists for this user") from exc

        return user_allergy

    def update_allergy(
        self, allergy_id: str, allergy_data: UserAllergyUpdate
    ) -> UserAllergyDB:
        """Update an existing allergy.

        Args:
            allergy_id: The allergy's ID
            allergy_data: Allergy update data

        Returns:
            Updated UserAllergyDB object

        Raises:
            ValueError: If allergy not found

        """
        user_allergy = (
            self.db.query(UserAllergyDB).filter(UserAllergyDB.id == allergy_id).first()
        )

        if not user_allergy:
            raise ValueError("Allergy not found")

        # Update fields if provided
        if allergy_data.severity is not None:
            user_allergy.severity = allergy_data.severity
        if allergy_data.diagnosed_date is not None:
            user_allergy.diagnosed_date = allergy_data.diagnosed_date
        if allergy_data.reaction_type is not None:
            user_allergy.reaction_type = allergy_data.reaction_type
        if allergy_data.notes is not None:
            user_allergy.notes = allergy_data.notes
        if allergy_data.is_verified is not None:
            user_allergy.is_verified = allergy_data.is_verified

        self.db.commit()
        self.db.refresh(user_allergy)

        return user_allergy

    def delete_allergy(self, allergy_id: str) -> bool:
        """Delete an allergy.

        Args:
            allergy_id: The allergy's ID

        Returns:
            True if deleted, False if not found

        """
        user_allergy = (
            self.db.query(UserAllergyDB).filter(UserAllergyDB.id == allergy_id).first()
        )

        if not user_allergy:
            return False

        self.db.delete(user_allergy)
        self.db.commit()

        return True

    # Dietary preference operations

    def add_dietary_preference(
        self, user_id: str, preference_data: DietaryPreferenceCreate
    ) -> DietaryPreferenceDB:
        """Add a new dietary preference to user's health profile.

        Args:
            user_id: The user's ID
            preference_data: Dietary preference creation data

        Returns:
            Created DietaryPreferenceDB object

        Raises:
            ValueError: If health profile doesn't exist

        """
        # Get health profile
        health_profile = self.get_health_profile(user_id)
        if not health_profile:
            raise ValueError("Health profile not found. Please create one first.")

        # Create new dietary preference
        existing_preference = (
            self.db.query(DietaryPreferenceDB)
            .filter(
                DietaryPreferenceDB.health_profile_id == health_profile.id,
                DietaryPreferenceDB.preference_type == preference_data.preference_type,
                DietaryPreferenceDB.preference_name == preference_data.preference_name,
            )
            .first()
        )
        if existing_preference:
            raise ValueError("This dietary preference already exists for this user")

        dietary_preference = DietaryPreferenceDB(
            id=str(uuid4()),
            health_profile_id=health_profile.id,
            preference_type=preference_data.preference_type,
            preference_name=preference_data.preference_name,
            is_strict=preference_data.is_strict,
            reason=preference_data.reason,
            notes=preference_data.notes,
        )

        self.db.add(dietary_preference)
        try:
            self.db.commit()
            self.db.refresh(dietary_preference)
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError(
                "This dietary preference already exists for this user"
            ) from exc

        return dietary_preference

    def update_dietary_preference(
        self, preference_id: str, preference_data: DietaryPreferenceUpdate
    ) -> DietaryPreferenceDB:
        """Update an existing dietary preference.

        Args:
            preference_id: The dietary preference's ID
            preference_data: Dietary preference update data

        Returns:
            Updated DietaryPreferenceDB object

        Raises:
            ValueError: If dietary preference not found

        """
        dietary_preference = (
            self.db.query(DietaryPreferenceDB)
            .filter(DietaryPreferenceDB.id == preference_id)
            .first()
        )

        if not dietary_preference:
            raise ValueError("Dietary preference not found")

        # Update fields if provided
        if preference_data.preference_name is not None:
            dietary_preference.preference_name = preference_data.preference_name
        if preference_data.is_strict is not None:
            dietary_preference.is_strict = preference_data.is_strict
        if preference_data.reason is not None:
            dietary_preference.reason = preference_data.reason
        if preference_data.notes is not None:
            dietary_preference.notes = preference_data.notes

        self.db.commit()
        self.db.refresh(dietary_preference)

        return dietary_preference

    def delete_dietary_preference(self, preference_id: str) -> bool:
        """Delete a dietary preference.

        Args:
            preference_id: The dietary preference's ID

        Returns:
            True if deleted, False if not found

        """
        dietary_preference = (
            self.db.query(DietaryPreferenceDB)
            .filter(DietaryPreferenceDB.id == preference_id)
            .first()
        )

        if not dietary_preference:
            return False

        self.db.delete(dietary_preference)
        self.db.commit()

        return True

    def list_all_allergens(self) -> list[AllergenDB]:
        """List all available allergens in the database.

        Returns:
            List of AllergenDB objects

        """
        return self.db.query(AllergenDB).order_by(AllergenDB.name).all()
