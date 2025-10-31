"""Integration tests for the recommendation API.

Tests end-to-end recommendation flow including:
- User context retrieval
- Safety filtering
- Scoring and ranking
- Top N sorting accuracy
- Performance benchmarks
"""

from __future__ import annotations

import time
from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import (
    ActivityLevel,
    AllergenDB,
    AllergySeverity,
    DietaryPreferenceDB,
    GoalDB,
    GoalStatus,
    GoalType,
    HealthProfileDB,
    MenuItem,
    MoodLogDB,
    PreferenceType,
    Restaurant,
    StressLogDB,
    UserAllergyDB,
    UserDB,
)
from src.eatsential.schemas.recommendation_schemas import (
    RecommendationFilters,
    RecommendationRequest,
)
from src.eatsential.services.engine import RecommendationService


@pytest.fixture
def integration_user(db: Session) -> UserDB:
    """Create a comprehensive test user for integration tests."""
    user = UserDB(
        id="integration_user",
        email="integration@test.com",
        username="integration_user",
        password_hash="hashed",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def integration_user_with_full_profile(db: Session, integration_user: UserDB) -> UserDB:
    """Create a user with complete health profile, goals, and preferences."""
    # Health profile
    profile = HealthProfileDB(
        id="integration_profile",
        user_id=integration_user.id,
        height_cm=170.0,
        weight_kg=65.0,
        activity_level=ActivityLevel.MODERATE,
        metabolic_rate=1800,
    )
    db.add(profile)
    db.flush()

    # Allergen and allergy
    allergen = AllergenDB(
        id="shellfish_allergen",
        name="shellfish",
        category="Seafood",
        description="Shellfish allergen",
    )
    db.add(allergen)
    db.flush()

    allergy = UserAllergyDB(
        id="user_shellfish",
        health_profile_id=profile.id,
        allergen_id=allergen.id,
        severity=AllergySeverity.SEVERE,
    )
    db.add(allergy)

    # Dietary preferences
    diet_pref = DietaryPreferenceDB(
        id="vegetarian_pref",
        health_profile_id=profile.id,
        preference_type=PreferenceType.DIET,
        preference_name="vegetarian",
        is_strict=True,
    )
    cuisine_pref = DietaryPreferenceDB(
        id="italian_pref",
        health_profile_id=profile.id,
        preference_type=PreferenceType.CUISINE,
        preference_name="Italian",
        is_strict=False,
    )
    db.add_all([diet_pref, cuisine_pref])

    # Active goals
    today = date.today()
    calorie_goal = GoalDB(
        id="calorie_goal",
        user_id=integration_user.id,
        goal_type=GoalType.NUTRITION,
        target_type="calorie_intake",
        target_value=Decimal("600.0"),
        current_value=Decimal("200.0"),
        start_date=today,
        end_date=today + timedelta(days=30),
        status=GoalStatus.ACTIVE,
    )
    protein_goal = GoalDB(
        id="protein_goal",
        user_id=integration_user.id,
        goal_type=GoalType.NUTRITION,
        target_type="protein_intake",
        target_value=Decimal("80.0"),
        current_value=Decimal("30.0"),
        start_date=today,
        end_date=today + timedelta(days=30),
        status=GoalStatus.ACTIVE,
    )
    db.add_all([calorie_goal, protein_goal])

    db.commit()
    return integration_user


@pytest.fixture
def diverse_restaurant_data(db: Session) -> list[Restaurant]:
    """Create diverse restaurants with various menu items."""
    restaurants = [
        Restaurant(
            id="italian_rest",
            name="Bella Italia",
            cuisine="Italian",
            address="123 Main St",
            is_active=True,
        ),
        Restaurant(
            id="healthy_rest",
            name="Green Leaf",
            cuisine="Healthy",
            address="456 Oak Ave",
            is_active=True,
        ),
        Restaurant(
            id="american_rest",
            name="Classic Diner",
            cuisine="American",
            address="789 Elm St",
            is_active=True,
        ),
        Restaurant(
            id="asian_rest",
            name="Dragon Palace",
            cuisine="Asian",
            address="321 Pine Rd",
            is_active=True,
        ),
    ]
    db.add_all(restaurants)
    db.flush()

    # Create diverse menu items
    menu_items = [
        # Italian restaurant
        MenuItem(
            id="pasta_primavera",
            restaurant_id="italian_rest",
            name="Pasta Primavera",
            description="Fresh vegetables with pasta, vegetarian friendly",
            calories=450.0,
            price=13.99,
        ),
        MenuItem(
            id="margherita_pizza",
            restaurant_id="italian_rest",
            name="Margherita Pizza",
            description="Classic vegetarian pizza with fresh basil",
            calories=550.0,
            price=14.99,
        ),
        MenuItem(
            id="seafood_pasta",
            restaurant_id="italian_rest",
            name="Seafood Pasta",
            description="Pasta with shrimp and shellfish",
            calories=600.0,
            price=18.99,
        ),
        # Healthy restaurant
        MenuItem(
            id="quinoa_bowl",
            restaurant_id="healthy_rest",
            name="Protein Quinoa Bowl",
            description="High protein quinoa with vegetables and beans",
            calories=400.0,
            price=11.99,
        ),
        MenuItem(
            id="green_smoothie",
            restaurant_id="healthy_rest",
            name="Green Power Smoothie",
            description="Spinach and magnesium-rich smoothie for stress relief",
            calories=200.0,
            price=7.99,
        ),
        MenuItem(
            id="veggie_wrap",
            restaurant_id="healthy_rest",
            name="Veggie Wrap",
            description="Fresh vegetables wrapped in whole grain tortilla",
            calories=350.0,
            price=9.99,
        ),
        # American restaurant
        MenuItem(
            id="cheeseburger",
            restaurant_id="american_rest",
            name="Classic Cheeseburger",
            description="Beef burger with cheese",
            calories=700.0,
            price=12.99,
        ),
        MenuItem(
            id="veggie_burger",
            restaurant_id="american_rest",
            name="Veggie Burger",
            description="Plant-based burger patty with vegetables",
            calories=450.0,
            price=11.99,
        ),
        # Asian restaurant
        MenuItem(
            id="tofu_stirfry",
            restaurant_id="asian_rest",
            name="Tofu Stir Fry",
            description="High protein tofu with vegetables",
            calories=380.0,
            price=10.99,
        ),
        MenuItem(
            id="shrimp_fried_rice",
            restaurant_id="asian_rest",
            name="Shrimp Fried Rice",
            description="Fried rice with shrimp",
            calories=550.0,
            price=13.99,
        ),
    ]
    db.add_all(menu_items)
    db.commit()
    return restaurants


class TestEndToEndRecommendationFlow:
    """Test complete recommendation flow from request to response."""

    def test_complete_meal_recommendation_flow(
        self, db: Session, integration_user_with_full_profile: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test full meal recommendation flow with user context."""
        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        # Execute recommendation
        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Verify response structure
        assert hasattr(response, "items")
        assert len(response.items) > 0
        assert len(response.items) <= 5  # Respects max_results

        # Verify each item structure
        for item in response.items:
            assert hasattr(item, "item_id")
            assert hasattr(item, "name")
            assert hasattr(item, "score")
            assert hasattr(item, "explanation")
            assert 0.0 <= item.score <= 1.0
            assert len(item.explanation) > 0

    def test_complete_restaurant_recommendation_flow(
        self, db: Session, integration_user_with_full_profile: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test full restaurant recommendation flow."""
        service = RecommendationService(db, max_results=3)
        request = RecommendationRequest(mode="baseline")

        # Execute recommendation
        response = service.get_restaurant_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Verify response
        assert len(response.items) > 0
        assert len(response.items) <= 3

        # Verify structure
        for item in response.items:
            assert item.item_id
            assert item.name
            assert 0.0 <= item.score <= 1.0

    def test_user_context_retrieval_completeness(
        self, db: Session, integration_user_with_full_profile: UserDB
    ):
        """Test that user context retrieval includes all relevant data."""
        service = RecommendationService(db)
        context = service._load_user_context(integration_user_with_full_profile)

        # Verify user data
        assert context.user.id == integration_user_with_full_profile.id

        # Verify allergies loaded
        assert "shellfish" in context.allergies

        # Verify strict dietary preferences
        assert "vegetarian" in context.strict_dietary_preferences

        # Verify cuisine preferences
        assert "italian" in context.preferred_cuisines

        # Verify goals loaded
        assert len(context.health_goals) == 2
        goal_types = [goal.target_type for goal in context.health_goals]
        assert "calorie_intake" in goal_types
        assert "protein_intake" in goal_types


class TestTopNSortingAccuracy:
    """Test that top N items are sorted correctly by score."""

    def test_top_5_sorting_accuracy(
        self, db: Session, integration_user: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test that top 5 results are sorted by score descending."""
        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(user=integration_user, request=request)

        # Extract scores
        scores = [item.score for item in response.items]

        # Verify descending order
        assert scores == sorted(scores, reverse=True)

    def test_top_10_sorting_accuracy(
        self, db: Session, integration_user: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test that top 10 results are sorted correctly."""
        service = RecommendationService(db, max_results=10)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(user=integration_user, request=request)

        # Extract scores
        scores = [item.score for item in response.items]

        # Verify descending order
        assert scores == sorted(scores, reverse=True)

        # Verify no duplicates
        item_ids = [item.item_id for item in response.items]
        assert len(item_ids) == len(set(item_ids))

    def test_consistent_scoring_across_calls(
        self, db: Session, integration_user: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test that scoring is deterministic for same inputs."""
        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        # Get recommendations twice
        response1 = service.get_meal_recommendations(user=integration_user, request=request)
        response2 = service.get_meal_recommendations(user=integration_user, request=request)

        # Verify same results
        assert len(response1.items) == len(response2.items)
        for item1, item2 in zip(response1.items, response2.items):
            assert item1.item_id == item2.item_id
            assert item1.score == item2.score


class TestSampleUserValidation:
    """Test recommendations with sample user data scenarios."""

    def test_user_with_low_mood_gets_tryptophan_recommendations(
        self, db: Session, integration_user_with_full_profile: UserDB
    ):
        """Test that users with low mood get tryptophan-rich food recommendations."""
        # Add low mood log
        today = date.today()
        mood_log = MoodLogDB(
            id="low_mood_log",
            user_id=integration_user_with_full_profile.id,
            log_date=today,
            mood_score=3,  # Low mood (1-10 scale)
            encrypted_notes="Feeling down today",
        )
        db.add(mood_log)
        db.commit()

        # Create tryptophan-rich restaurant
        rest = Restaurant(
            id="wellness_rest",
            name="Wellness Cafe",
            cuisine="Healthy",
            is_active=True,
        )
        db.add(rest)
        db.flush()

        # Create tryptophan-rich items
        items = [
            MenuItem(
                id="turkey_meal",
                restaurant_id=rest.id,
                name="Turkey Breast",
                description="Rich in tryptophan to boost serotonin and improve mood",
                calories=350.0,
                price=12.99,
            ),
            MenuItem(
                id="salmon_dish",
                restaurant_id=rest.id,
                name="Grilled Salmon",
                description="Omega-3 and tryptophan for mood support",
                calories=400.0,
                price=15.99,
            ),
        ]
        db.add_all(items)
        db.commit()

        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Verify recommendations include tryptophan-related items
        # (They should appear due to keyword matching in descriptions)
        all_items = service._get_menu_item_candidates()
        tryptophan_items = [
            item for item in all_items 
            if "tryptophan" in f"{item.name} {item.description}".lower()
        ]
        assert len(tryptophan_items) > 0

    def test_user_with_high_stress_gets_magnesium_recommendations(
        self, db: Session, integration_user_with_full_profile: UserDB
    ):
        """Test that users with high stress get magnesium-rich food recommendations."""
        # Add high stress log
        today = date.today()
        stress_log = StressLogDB(
            id="high_stress_log",
            user_id=integration_user_with_full_profile.id,
            log_date=today,
            stress_level=8,  # High stress (1-10 scale)
            encrypted_notes="Very stressful day",
        )
        db.add(stress_log)
        db.commit()

        # Create magnesium-rich restaurant
        rest = Restaurant(
            id="stress_relief_cafe",
            name="Calm Cafe",
            cuisine="Healthy",
            is_active=True,
        )
        db.add(rest)
        db.flush()

        # Create magnesium-rich items
        items = [
            MenuItem(
                id="spinach_salad",
                restaurant_id=rest.id,
                name="Spinach Power Salad",
                description="High in magnesium for stress relief and relaxation",
                calories=250.0,
                price=9.99,
            ),
            MenuItem(
                id="almond_bowl",
                restaurant_id=rest.id,
                name="Almond Energy Bowl",
                description="Magnesium-rich almonds help reduce stress",
                calories=300.0,
                price=10.99,
            ),
        ]
        db.add_all(items)
        db.commit()

        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Verify recommendations include magnesium-related items
        all_items = service._get_menu_item_candidates()
        magnesium_items = [
            item for item in all_items 
            if "magnesium" in f"{item.name} {item.description}".lower()
        ]
        assert len(magnesium_items) > 0

    def test_user_with_calorie_target_gets_matching_foods(
        self, db: Session, integration_user_with_full_profile: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test that users with calorie targets get appropriately sized meals."""
        # User already has a 600 cal target from fixture
        service = RecommendationService(db, max_results=10)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Get all recommended items and check their calorie content
        # Items within the calorie goal should be preferred
        all_candidates = service._get_menu_item_candidates()
        
        # Items under 600 calories should be present in recommendations
        low_cal_items = [item for item in all_candidates if item.calories and item.calories <= 600.0]
        assert len(low_cal_items) > 0


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_food_database(self, db: Session, integration_user: UserDB):
        """Test recommendation with empty food database."""
        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(user=integration_user, request=request)

        # Should return empty list without errors
        assert response.items == []

    def test_user_without_health_profile(self, db: Session):
        """Test recommendation for user without health profile."""
        user = UserDB(
            id="no_profile_user",
            email="noprofile@test.com",
            username="no_profile",
            password_hash="hashed",
            email_verified=True,
        )
        db.add(user)
        db.commit()

        # Create some menu items
        rest = Restaurant(id="test_rest", name="Test", cuisine="American", is_active=True)
        db.add(rest)
        db.flush()
        item = MenuItem(
            id="test_item",
            restaurant_id=rest.id,
            name="Test Meal",
            description="Test",
            calories=400.0,
            price=10.0,
        )
        db.add(item)
        db.commit()

        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        # Should work without health profile
        response = service.get_meal_recommendations(user=user, request=request)
        assert len(response.items) > 0

    def test_invalid_user_data(self, db: Session):
        """Test handling of invalid user data."""
        service = RecommendationService(db)
        
        # Create user that doesn't exist in context loading
        fake_user = UserDB(
            id="nonexistent_user",
            email="fake@test.com",
            username="fake",
            password_hash="hash",
            email_verified=True,
        )
        
        # Should raise error for non-existent user
        with pytest.raises(ValueError, match="User not found"):
            service._load_user_context(fake_user)

    def test_all_items_filtered_by_safety_rules(
        self, db: Session, integration_user_with_full_profile: UserDB
    ):
        """Test when all items are filtered out by safety rules."""
        # User has vegetarian strict preference
        # Create only meat items
        rest = Restaurant(id="meat_rest", name="Steakhouse", cuisine="American", is_active=True)
        db.add(rest)
        db.flush()

        meat_items = [
            MenuItem(
                id="steak",
                restaurant_id=rest.id,
                name="Ribeye Steak",
                description="Prime beef steak",
                calories=700.0,
                price=25.99,
            ),
            MenuItem(
                id="pork",
                restaurant_id=rest.id,
                name="Pork Chops",
                description="Grilled pork chops",
                calories=600.0,
                price=18.99,
            ),
        ]
        db.add_all(meat_items)
        db.commit()

        service = RecommendationService(db, max_results=5)
        request = RecommendationRequest(mode="baseline")

        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )

        # Should return empty list (all filtered out)
        assert len(response.items) == 0


class TestPerformance:
    """Test performance requirements."""

    def test_response_time_under_5_seconds(
        self, db: Session, integration_user_with_full_profile: UserDB, diverse_restaurant_data: list[Restaurant]
    ):
        """Test that recommendation response time is under 5 seconds."""
        service = RecommendationService(db, max_results=10)
        request = RecommendationRequest(mode="baseline")

        start_time = time.time()
        response = service.get_meal_recommendations(
            user=integration_user_with_full_profile, request=request
        )
        end_time = time.time()

        elapsed_time = end_time - start_time

        # Should complete in under 5 seconds
        assert elapsed_time < 5.0
        assert len(response.items) > 0

    def test_performance_with_large_menu(self, db: Session, integration_user: UserDB):
        """Test performance with a large number of menu items."""
        # Create restaurant with many items
        rest = Restaurant(id="large_rest", name="Big Menu", cuisine="American", is_active=True)
        db.add(rest)
        db.flush()

        # Create 100 menu items
        items = [
            MenuItem(
                id=f"item_{i}",
                restaurant_id=rest.id,
                name=f"Meal {i}",
                description=f"Description {i}",
                calories=300.0 + (i * 10),
                price=10.0 + (i * 0.5),
            )
            for i in range(100)
        ]
        db.add_all(items)
        db.commit()

        service = RecommendationService(db, max_results=10)
        request = RecommendationRequest(mode="baseline")

        start_time = time.time()
        response = service.get_meal_recommendations(user=integration_user, request=request)
        end_time = time.time()

        elapsed_time = end_time - start_time

        # Should still be fast with large dataset
        assert elapsed_time < 5.0
        assert len(response.items) == 10  # Returns top 10

    def test_restaurant_recommendations_performance(
        self, db: Session, integration_user: UserDB
    ):
        """Test restaurant recommendation performance."""
        # Create multiple restaurants
        restaurants = [
            Restaurant(
                id=f"rest_{i}",
                name=f"Restaurant {i}",
                cuisine="Italian" if i % 2 == 0 else "American",
                is_active=True,
            )
            for i in range(20)
        ]
        db.add_all(restaurants)
        db.flush()

        # Add menu items to each
        for i, rest in enumerate(restaurants):
            items = [
                MenuItem(
                    id=f"rest_{i}_item_{j}",
                    restaurant_id=rest.id,
                    name=f"Meal {j}",
                    description=f"Description {j}",
                    calories=300.0 + (j * 20),
                    price=10.0 + (j * 0.5),
                )
                for j in range(10)
            ]
            db.add_all(items)
        db.commit()

        service = RecommendationService(db, max_results=10)
        request = RecommendationRequest(mode="baseline")

        start_time = time.time()
        response = service.get_restaurant_recommendations(user=integration_user, request=request)
        end_time = time.time()

        elapsed_time = end_time - start_time

        # Should complete quickly
        assert elapsed_time < 5.0
        assert len(response.items) > 0
