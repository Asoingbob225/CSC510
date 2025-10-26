"""Health profile service for business logic and CRUD operations."""

import json
from typing import Optional
from uuid import uuid4

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from ..models.models import (
    AllergenAuditLogDB,
    AllergenDB,
    AuditAction,
    DietaryPreferenceDB,
    HealthProfileDB,
    UserAllergyDB,
)
from ..schemas.schemas import (
    AllergenCreate,
    AllergenUpdate,
    DietaryPreferenceCreate,
    DietaryPreferenceUpdate,
    HealthProfileCreate,
    HealthProfileUpdate,
    UserAllergyCreate,
    UserAllergyUpdate,
)


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
        """Get existing allergen by name from database.

        Note: This method no longer creates allergens automatically.
        Allergens must be managed through the admin API endpoints.

        Args:
            name: Allergen name

        Returns:
            AllergenDB object

        Raises:
            ValueError: If allergen is not found in the database

        """
        # Check if allergen exists
        allergen = self.get_allergen_by_name(name)
        if not allergen:
            raise ValueError(
                f"Allergen '{name}' not found in database. "
                f"Please contact an administrator to add this allergen."
            )

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

    # Admin allergen management operations

    def create_allergen(
        self,
        allergen_data: AllergenCreate,
        admin_user_id: Optional[str] = None,
        admin_username: Optional[str] = None,
    ) -> AllergenDB:
        """Create a new allergen (admin only).

        Args:
            allergen_data: Allergen creation data
            admin_user_id: Optional admin user ID for audit logging
            admin_username: Optional admin username for audit logging

        Returns:
            Created AllergenDB object

        Raises:
            ValueError: If allergen with same name already exists

        """
        # Check if allergen with same name exists
        existing = (
            self.db.query(AllergenDB)
            .filter(AllergenDB.name == allergen_data.name.lower().strip())
            .first()
        )
        if existing:
            raise ValueError(f"Allergen '{allergen_data.name}' already exists")

        # Create new allergen
        allergen = AllergenDB(
            id=str(uuid4()),
            name=allergen_data.name.lower().strip(),
            category=allergen_data.category,
            is_major_allergen=allergen_data.is_major_allergen,
            description=allergen_data.description,
        )

        self.db.add(allergen)
        try:
            self.db.commit()
            self.db.refresh(allergen)

            # Create audit log if admin info provided
            if admin_user_id and admin_username:
                self._create_audit_log(
                    action=AuditAction.CREATE,
                    allergen_name=allergen.name,
                    admin_user_id=admin_user_id,
                    admin_username=admin_username,
                    allergen_id=allergen.id,
                    changes={
                        "category": allergen.category,
                        "is_major_allergen": allergen.is_major_allergen,
                        "description": allergen.description,
                    },
                )
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError(f"Allergen '{allergen_data.name}' already exists") from exc

        return allergen

    def get_allergen_by_id(self, allergen_id: str) -> Optional[AllergenDB]:
        """Get allergen by ID.

        Args:
            allergen_id: The allergen's ID

        Returns:
            AllergenDB object or None if not found

        """
        return self.db.query(AllergenDB).filter(AllergenDB.id == allergen_id).first()

    def update_allergen(
        self,
        allergen_id: str,
        allergen_data: AllergenUpdate,
        admin_user_id: Optional[str] = None,
        admin_username: Optional[str] = None,
    ) -> AllergenDB:
        """Update an allergen (admin only).

        Args:
            allergen_id: The allergen's ID
            allergen_data: Allergen update data
            admin_user_id: Optional admin user ID for audit logging
            admin_username: Optional admin username for audit logging

        Returns:
            Updated AllergenDB object

        Raises:
            ValueError: If allergen not found or name already exists

        """
        allergen = self.get_allergen_by_id(allergen_id)
        if not allergen:
            raise ValueError("Allergen not found")

        # Track changes for audit log
        changes = {}

        # Update fields if provided
        if allergen_data.name is not None:
            # Check if new name is already taken by another allergen
            existing = (
                self.db.query(AllergenDB)
                .filter(
                    AllergenDB.name == allergen_data.name.lower().strip(),
                    AllergenDB.id != allergen_id,
                )
                .first()
            )
            if existing:
                raise ValueError(f"Allergen name '{allergen_data.name}' already exists")
            changes["name"] = {
                "old": allergen.name,
                "new": allergen_data.name.lower().strip(),
            }
            allergen.name = allergen_data.name.lower().strip()

        if allergen_data.category is not None:
            changes["category"] = {
                "old": allergen.category,
                "new": allergen_data.category,
            }
            allergen.category = allergen_data.category

        if allergen_data.is_major_allergen is not None:
            changes["is_major_allergen"] = {
                "old": allergen.is_major_allergen,
                "new": allergen_data.is_major_allergen,
            }
            allergen.is_major_allergen = allergen_data.is_major_allergen

        if allergen_data.description is not None:
            changes["description"] = {
                "old": allergen.description,
                "new": allergen_data.description,
            }
            allergen.description = allergen_data.description

        try:
            self.db.commit()
            self.db.refresh(allergen)

            # Create audit log if admin info provided and changes were made
            if admin_user_id and admin_username and changes:
                self._create_audit_log(
                    action=AuditAction.UPDATE,
                    allergen_name=allergen.name,
                    admin_user_id=admin_user_id,
                    admin_username=admin_username,
                    allergen_id=allergen.id,
                    changes=changes,
                )
        except IntegrityError as exc:
            self.db.rollback()
            raise ValueError("Failed to update allergen") from exc

        return allergen

    def delete_allergen(
        self,
        allergen_id: str,
        admin_user_id: Optional[str] = None,
        admin_username: Optional[str] = None,
    ) -> bool:
        """Delete an allergen (admin only).

        Args:
            allergen_id: The allergen's ID
            admin_user_id: Optional admin user ID for audit logging
            admin_username: Optional admin username for audit logging

        Returns:
            True if deleted, False if not found

        Raises:
            ValueError: If allergen is still in use by users

        """
        allergen = self.get_allergen_by_id(allergen_id)
        if not allergen:
            return False

        # Store allergen name for audit log before deletion
        allergen_name = allergen.name

        # Check if allergen is in use
        user_allergy_count = (
            self.db.query(UserAllergyDB)
            .filter(UserAllergyDB.allergen_id == allergen_id)
            .count()
        )
        if user_allergy_count > 0:
            raise ValueError(
                f"Cannot delete allergen '{allergen.name}' as it is currently "
                f"used by {user_allergy_count} user(s)"
            )

        self.db.delete(allergen)
        self.db.commit()

        # Create audit log if admin info provided
        if admin_user_id and admin_username:
            self._create_audit_log(
                action=AuditAction.DELETE,
                allergen_name=allergen_name,
                admin_user_id=admin_user_id,
                admin_username=admin_username,
                allergen_id=allergen_id,
            )

        return True

    # Audit log operations

    def _create_audit_log(
        self,
        action: str,
        allergen_name: str,
        admin_user_id: str,
        admin_username: str,
        allergen_id: Optional[str] = None,
        changes: Optional[dict] = None,
    ) -> AllergenAuditLogDB:
        """Create an audit log entry for allergen operations.

        Args:
            action: Action type (create, update, delete, bulk_import)
            allergen_name: Name of the allergen
            admin_user_id: ID of the admin user performing the action
            admin_username: Username of the admin user
            allergen_id: Optional allergen ID
            changes: Optional dictionary of changes made

        Returns:
            Created AllergenAuditLogDB object

        """
        audit_log = AllergenAuditLogDB(
            id=str(uuid4()),
            allergen_id=allergen_id,
            allergen_name=allergen_name,
            action=action,
            admin_user_id=admin_user_id,
            admin_username=admin_username,
            changes=json.dumps(changes) if changes else None,
        )

        self.db.add(audit_log)
        self.db.commit()

        return audit_log

    def get_audit_logs(
        self,
        allergen_id: Optional[str] = None,
        limit: int = 100,
    ) -> list[AllergenAuditLogDB]:
        """Get audit logs for allergen operations.

        Args:
            allergen_id: Optional allergen ID to filter logs
            limit: Maximum number of logs to return

        Returns:
            List of AllergenAuditLogDB objects

        """
        query = self.db.query(AllergenAuditLogDB).order_by(
            AllergenAuditLogDB.created_at.desc()
        )

        if allergen_id:
            query = query.filter(AllergenAuditLogDB.allergen_id == allergen_id)

        return query.limit(limit).all()

    # Bulk operations

    def bulk_import_allergens(
        self,
        allergens_data: list[AllergenCreate],
        admin_user_id: str,
        admin_username: str,
    ) -> tuple[int, int, list[str]]:
        """Bulk import allergens (admin only).

        Args:
            allergens_data: List of allergen creation data
            admin_user_id: ID of admin user performing import
            admin_username: Username of admin user

        Returns:
            Tuple of (success_count, failure_count, error_messages)

        """
        success_count = 0
        failure_count = 0
        errors = []

        # Limit to 100 items per request
        if len(allergens_data) > 100:
            errors.append("Maximum 100 allergens can be imported at once")
            return (0, len(allergens_data), errors)

        imported_names = []

        for idx, allergen_data in enumerate(allergens_data):
            try:
                # Check if allergen already exists
                existing = (
                    self.db.query(AllergenDB)
                    .filter(AllergenDB.name == allergen_data.name.lower().strip())
                    .first()
                )
                if existing:
                    errors.append(
                        f"Row {idx + 1}: Allergen '{allergen_data.name}' already exists"
                    )
                    failure_count += 1
                    continue

                # Create allergen
                allergen = AllergenDB(
                    id=str(uuid4()),
                    name=allergen_data.name.lower().strip(),
                    category=allergen_data.category,
                    is_major_allergen=allergen_data.is_major_allergen,
                    description=allergen_data.description,
                )

                self.db.add(allergen)
                imported_names.append(allergen_data.name)
                success_count += 1

            except Exception as e:
                errors.append(f"Row {idx + 1}: {e!s}")
                failure_count += 1
                continue

        # Commit all successful imports
        if success_count > 0:
            try:
                self.db.commit()

                # Create audit log for bulk import
                self._create_audit_log(
                    action=AuditAction.BULK_IMPORT,
                    allergen_name=f"{success_count} allergens",
                    admin_user_id=admin_user_id,
                    admin_username=admin_username,
                    changes={"imported_names": imported_names},
                )
            except IntegrityError as exc:
                self.db.rollback()
                errors.append(f"Database error during commit: {exc!s}")
                return (0, len(allergens_data), errors)

        return (success_count, failure_count, errors)

    def search_allergens(
        self,
        name: Optional[str] = None,
        category: Optional[str] = None,
        is_major_allergen: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AllergenDB], int]:
        """Search and filter allergens with pagination.

        Args:
            name: Optional name filter (partial match)
            category: Optional category filter (exact match)
            is_major_allergen: Optional major allergen filter
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (allergen_list, total_count)

        """
        query = self.db.query(AllergenDB)

        # Apply filters
        if name:
            query = query.filter(AllergenDB.name.ilike(f"%{name.lower()}%"))

        if category:
            query = query.filter(AllergenDB.category == category.lower())

        if is_major_allergen is not None:
            query = query.filter(AllergenDB.is_major_allergen == is_major_allergen)

        # Get total count
        total_count = query.count()

        # Apply pagination and ordering
        allergens = query.order_by(AllergenDB.name).offset(skip).limit(limit).all()

        return (allergens, total_count)
        self.db.commit()

        return True
