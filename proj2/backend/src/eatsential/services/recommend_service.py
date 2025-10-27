"""Meal recommendation service with health profile integration.

This service provides personalized meal recommendations based on:
- User health profile (biometrics, activity level)
- Dietary preferences
- Allergies and dietary restrictions
- Contextual factors (meal type, time of day, etc.)

Future enhancements will integrate LLM/RAG pipeline for advanced recommendations.
"""

from typing import Optional

from sqlalchemy.orm import Session, selectinload

from ..models.models import HealthProfileDB, MenuItem, Restaurant, UserAllergyDB, UserDB
from ..schemas.schemas import RecommendationItem


class RecommendService:
    """Service for generating personalized meal recommendations."""

    def __init__(self, db: Session):
        """Initialize service with database session.

        Args:
            db: SQLAlchemy database session

        """
        self.db = db

    def get_user_context(self, user_id: str) -> dict:
        """Retrieve user's health profile and preferences for recommendation context.

        Args:
            user_id: User ID to fetch context for

        Returns:
            Dictionary containing user context including health profile,
            allergies, and dietary preferences

        Raises:
            ValueError: If user not found

        """
        # Verify user exists
        user = self.db.query(UserDB).filter(UserDB.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Get health profile with related data
        health_profile = (
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

        # Build context dictionary
        context = {
            "user_id": user_id,
            "has_health_profile": health_profile is not None,
        }

        if health_profile:
            context.update(
                {
                    "height_cm": health_profile.height_cm,
                    "weight_kg": health_profile.weight_kg,
                    "activity_level": health_profile.activity_level,
                    "metabolic_rate": health_profile.metabolic_rate,
                    "allergies": [
                        {
                            "name": allergy.allergen.name,
                            "severity": allergy.severity,
                        }
                        for allergy in health_profile.allergies
                    ],
                    "dietary_preferences": [
                        {
                            "preference_type": pref.preference_type,
                            "preference_name": pref.preference_name,
                            "is_strict": pref.is_strict,
                        }
                        for pref in health_profile.dietary_preferences
                    ],
                }
            )

        return context

    def recommend_meals(
        self,
        user_id: str,
        constraints: Optional[dict] = None,
        limit: int = 10,
    ) -> list[RecommendationItem]:
        """Generate personalized meal recommendations for a user.

        This is a core recommendation engine that:
        1. Retrieves user's health profile and preferences
        2. Fetches available menu items from active restaurants
        3. Applies filtering based on allergies and dietary restrictions
        4. Scores items based on nutritional fit and preferences
        5. Returns top recommendations with explanations

        Future enhancement: Integrate LLM/RAG pipeline for semantic matching
        and more sophisticated recommendation logic.

        Args:
            user_id: User ID to generate recommendations for
            constraints: Optional additional constraints (e.g., max_calories, meal_type)
            limit: Maximum number of recommendations to return (default: 10)

        Returns:
            List of RecommendationItem objects sorted by score

        Raises:
            ValueError: If user not found

        """
        # Get user context
        user_context = self.get_user_context(user_id)

        # Get all active menu items from active restaurants
        menu_items = (
            self.db.query(MenuItem)
            .join(Restaurant)
            .filter(Restaurant.is_active)
            .all()
        )

        if not menu_items:
            return []

        # Apply constraints if provided
        if constraints:
            menu_items = self._apply_constraints(menu_items, constraints)

        # Score and rank items
        recommendations = []
        for item in menu_items:
            score, explanation = self._score_menu_item(item, user_context)
            recommendations.append(
                RecommendationItem(
                    menu_item_id=item.id,
                    score=score,
                    explanation=explanation,
                )
            )

        # Sort by score descending and limit results
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]

    def _apply_constraints(
        self, menu_items: list[MenuItem], constraints: dict
    ) -> list[MenuItem]:
        """Apply filtering constraints to menu items.

        Args:
            menu_items: List of menu items to filter
            constraints: Dictionary of constraints (e.g., max_calories, max_price)

        Returns:
            Filtered list of menu items

        """
        filtered_items = menu_items

        # Filter by max calories if specified
        if "max_calories" in constraints and constraints["max_calories"] is not None:
            filtered_items = [
                item
                for item in filtered_items
                if item.calories is not None
                and item.calories <= constraints["max_calories"]
            ]

        # Filter by max price if specified
        if "max_price" in constraints and constraints["max_price"] is not None:
            filtered_items = [
                item
                for item in filtered_items
                if item.price is not None and item.price <= constraints["max_price"]
            ]

        return filtered_items

    def _score_menu_item(
        self,
        item: MenuItem,
        user_context: dict,
    ) -> tuple[float, str]:
        """Score a menu item based on user context and generate explanation.

        Scoring algorithm (v1 - naive implementation):
        - Base score: 0.5
        - Has nutritional data (calories): +0.3
        - Has price: +0.2
        - Matches user preferences: future enhancement with LLM/RAG

        Args:
            item: Menu item to score
            user_context: User context including health profile

        Returns:
            Tuple of (score, explanation)

        """
        score = 0.5
        explanation_parts = [f"Restaurant: {item.restaurant.name}"]

        # Score based on available nutritional data
        if item.calories is not None:
            score += 0.3
            explanation_parts.append(f"{item.calories:.0f} cal")

        if item.price is not None:
            score += 0.2
            explanation_parts.append(f"${item.price:.2f}")

        # Future enhancement: Use LLM/RAG to match against user preferences
        # and provide personalized explanations
        if user_context.get("has_health_profile"):
            # Placeholder for future LLM integration
            # This will analyze user's activity level, dietary preferences,
            # allergies, and provide semantic matching
            pass

        explanation = ", ".join(explanation_parts)
        return score, explanation
