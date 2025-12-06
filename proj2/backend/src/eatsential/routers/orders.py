"""API routes for orders (menu items associated with meal logs)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.models import MenuItem, MealDB, Orders, UserDB
from ..schemas.schemas import OrderCreate, OrderResponse, UserResponse
from ..services.auth_service import get_current_user
from uuid import uuid4

router = APIRouter(prefix="/orders", tags=["orders"])

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[UserResponse, Depends(get_current_user)]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    """Create an order linking a menu item to a user's meal log.

    This endpoint associates a restaurant menu item with a logged meal,
    creating an order record. Useful for tracking which specific menu items
    were included in which meals.

    Args:
        order_data: Order creation data (menu_item_id and meal_id)
        current_user: Authenticated user
        db: Database session

    Returns:
        Created order

    Raises:
        HTTPException 400: If menu item or meal not found, or meal doesn't belong to user
        HTTPException 500: If creation fails

    """
    try:
        # Verify that the menu item exists
        menu_item = db.scalars(
            select(MenuItem).filter(MenuItem.id == order_data.menu_item_id)
        ).first()
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{order_data.menu_item_id}' not found",
            )

        # Verify that the meal exists and belongs to the current user
        meal = db.scalars(
            select(MealDB).filter(
                MealDB.id == order_data.meal_id,
                MealDB.user_id == current_user.id,
            )
        ).first()
        if not meal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Meal not found or does not belong to the current user",
            )

        # Create the order
        order = Orders(
            id=str(uuid4()),
            menu_item_id=order_data.menu_item_id,
            meal_id=order_data.meal_id,
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        return OrderResponse.model_validate(order)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {e!s}",
        )
