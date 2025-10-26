"""Health profile router for CRUD operations."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.models import UserDB
from ..schemas.schemas import (
    AllergenCreate,
    AllergenResponse,
    AllergenUpdate,
    DietaryPreferenceCreate,
    DietaryPreferenceResponse,
    DietaryPreferenceUpdate,
    HealthProfileCreate,
    HealthProfileResponse,
    HealthProfileUpdate,
    MessageResponse,
    UserAllergyCreate,
    UserAllergyResponse,
    UserAllergyUpdate,
)
from ..services.auth_service import get_current_admin_user, get_current_user
from ..services.health_service import HealthProfileService

router = APIRouter(
    prefix="/health",
    tags=["health"],
)

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[UserDB, Depends(get_current_user)]
AdminUserDep = Annotated[UserDB, Depends(get_current_admin_user)]


# Health Profile endpoints


@router.post("/profile", response_model=HealthProfileResponse, status_code=201)
async def create_health_profile(
    profile_data: HealthProfileCreate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Create a new health profile for the current user.

    Args:
        profile_data: Health profile creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created health profile

    Raises:
        HTTPException: If health profile already exists or creation fails

    """
    try:
        service = HealthProfileService(db)
        health_profile = service.create_health_profile(current_user.id, profile_data)
        return health_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error creating health profile: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the health profile",
        ) from e


@router.get("/profile", response_model=HealthProfileResponse)
async def get_health_profile(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Get the current user's health profile.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        User's health profile

    Raises:
        HTTPException: If health profile not found

    """
    try:
        service = HealthProfileService(db)
        health_profile = service.get_health_profile(current_user.id)
        if not health_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health profile not found",
            )
        return health_profile
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting health profile: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching the health profile",
        ) from e


@router.put("/profile", response_model=HealthProfileResponse)
async def update_health_profile(
    profile_data: HealthProfileUpdate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Update the current user's health profile.

    Args:
        profile_data: Health profile update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated health profile

    Raises:
        HTTPException: If health profile not found or update fails

    """
    try:
        service = HealthProfileService(db)
        health_profile = service.update_health_profile(current_user.id, profile_data)
        return health_profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error updating health profile: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the health profile",
        ) from e


@router.delete("/profile", response_model=MessageResponse)
async def delete_health_profile(
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Delete the current user's health profile.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If health profile not found

    """
    try:
        service = HealthProfileService(db)
        deleted = service.delete_health_profile(current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health profile not found",
            )
        return MessageResponse(message="Health profile deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting health profile: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the health profile",
        ) from e


# Allergy endpoints


@router.post("/allergies", response_model=UserAllergyResponse, status_code=201)
async def add_allergy(
    allergy_data: UserAllergyCreate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Add a new allergy to the current user's health profile.

    Args:
        allergy_data: Allergy creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created allergy

    Raises:
        HTTPException: If health profile not found or allergy creation fails

    """
    try:
        service = HealthProfileService(db)
        allergy = service.add_allergy(current_user.id, allergy_data)
        return allergy
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error adding allergy: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the allergy",
        ) from e


@router.put("/allergies/{allergy_id}", response_model=UserAllergyResponse)
async def update_allergy(
    allergy_id: str,
    allergy_data: UserAllergyUpdate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Update an existing allergy.

    Args:
        allergy_id: The allergy's ID
        allergy_data: Allergy update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated allergy

    Raises:
        HTTPException: If allergy not found or update fails

    """
    try:
        service = HealthProfileService(db)
        allergy = service.update_allergy(allergy_id, allergy_data)
        return allergy
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error updating allergy: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the allergy",
        ) from e


@router.delete("/allergies/{allergy_id}", response_model=MessageResponse)
async def delete_allergy(
    allergy_id: str,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Delete an allergy.

    Args:
        allergy_id: The allergy's ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If allergy not found

    """
    try:
        service = HealthProfileService(db)
        deleted = service.delete_allergy(allergy_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allergy not found",
            )
        return MessageResponse(message="Allergy deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting allergy: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the allergy",
        ) from e


# Dietary Preference endpoints


@router.post(
    "/dietary-preferences",
    response_model=DietaryPreferenceResponse,
    status_code=201,
)
async def add_dietary_preference(
    preference_data: DietaryPreferenceCreate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Add a new dietary preference to the current user's health profile.

    Args:
        preference_data: Dietary preference creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created dietary preference

    Raises:
        HTTPException: If health profile not found or preference creation fails

    """
    try:
        service = HealthProfileService(db)
        preference = service.add_dietary_preference(current_user.id, preference_data)
        return preference
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error adding dietary preference: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the dietary preference",
        ) from e


@router.put(
    "/dietary-preferences/{preference_id}",
    response_model=DietaryPreferenceResponse,
)
async def update_dietary_preference(
    preference_id: str,
    preference_data: DietaryPreferenceUpdate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Update an existing dietary preference.

    Args:
        preference_id: The dietary preference's ID
        preference_data: Dietary preference update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated dietary preference

    Raises:
        HTTPException: If dietary preference not found or update fails

    """
    try:
        service = HealthProfileService(db)
        preference = service.update_dietary_preference(preference_id, preference_data)
        return preference
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error updating dietary preference: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the dietary preference",
        ) from e


@router.delete(
    "/dietary-preferences/{preference_id}",
    response_model=MessageResponse,
)
async def delete_dietary_preference(
    preference_id: str,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Delete a dietary preference.

    Args:
        preference_id: The dietary preference's ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If dietary preference not found

    """
    try:
        service = HealthProfileService(db)
        deleted = service.delete_dietary_preference(preference_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dietary preference not found",
            )
        return MessageResponse(message="Dietary preference deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting dietary preference: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the dietary preference",
        ) from e


# Allergen database endpoints


@router.get("/allergens", response_model=list[AllergenResponse])
async def list_allergens(
    db: SessionDep,
):
    """List all available allergens in the database.

    Args:
        db: Database session

    Returns:
        List of allergens

    Raises:
        HTTPException: If listing fails

    """
    try:
        service = HealthProfileService(db)
        allergens = service.list_all_allergens()
        return allergens
    except Exception as e:
        print(f"Error listing allergens: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while listing allergens",
        ) from e


@router.get("/allergens/{allergen_id}", response_model=AllergenResponse)
async def get_allergen(
    allergen_id: str,
    db: SessionDep,
):
    """Get a specific allergen by ID.

    Args:
        allergen_id: The allergen's ID
        db: Database session

    Returns:
        Allergen details

    Raises:
        HTTPException: If allergen not found

    """
    try:
        service = HealthProfileService(db)
        allergen = service.get_allergen_by_id(allergen_id)
        if not allergen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allergen not found",
            )
        return allergen
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching allergen: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching the allergen",
        ) from e


# Admin allergen management endpoints


@router.post("/admin/allergens", response_model=AllergenResponse, status_code=201)
async def create_allergen(
    allergen: AllergenCreate,
    db: SessionDep,
    current_user: AdminUserDep,
):
    """Create a new allergen (admin only).

    Args:
        allergen: Allergen creation data
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Created allergen

    Raises:
        HTTPException: If creation fails or allergen already exists

    """
    try:
        service = HealthProfileService(db)
        new_allergen = service.create_allergen(allergen)
        return new_allergen
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error creating allergen: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the allergen",
        ) from e


@router.put("/admin/allergens/{allergen_id}", response_model=AllergenResponse)
async def update_allergen(
    allergen_id: str,
    allergen: AllergenUpdate,
    db: SessionDep,
    current_user: AdminUserDep,
):
    """Update an allergen (admin only).

    Args:
        allergen_id: The allergen's ID
        allergen: Allergen update data
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Updated allergen

    Raises:
        HTTPException: If allergen not found or update fails

    """
    try:
        service = HealthProfileService(db)
        updated_allergen = service.update_allergen(allergen_id, allergen)
        return updated_allergen
    except ValueError as e:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if "not found" in str(e).lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail=str(e),
        ) from e
    except Exception as e:
        print(f"Error updating allergen: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the allergen",
        ) from e


@router.delete("/admin/allergens/{allergen_id}", response_model=MessageResponse)
async def delete_allergen(
    allergen_id: str,
    db: SessionDep,
    current_user: AdminUserDep,
):
    """Delete an allergen (admin only).

    Args:
        allergen_id: The allergen's ID
        db: Database session
        current_user: Current authenticated admin user

    Returns:
        Success message

    Raises:
        HTTPException: If allergen not found or still in use

    """
    try:
        service = HealthProfileService(db)
        deleted = service.delete_allergen(allergen_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Allergen not found",
            )
        return MessageResponse(message="Allergen deleted successfully")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting allergen: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the allergen",
        ) from e
