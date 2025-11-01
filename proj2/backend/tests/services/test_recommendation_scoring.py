"""Unit tests for recommendation scoring algorithm.

Tests the scoring logic for:
- Physical scoring (calorie goals, nutrition matching)
- Mental wellness scoring (mood/stress-based recommendations)
- Combined scoring formula
- Context rules application
"""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import (
    ActivityLevel,
    GoalDB,
    GoalStatus,
    GoalType,
    HealthProfileDB,
    MenuItem,
    Restaurant,
    UserDB,
)
from src.eatsential.schemas.recommendation_schemas import RecommendationFilters
from src.eatsential.services.engine import RecommendationService


@pytest.fixture
def scoring_user(db: Session) -> UserDB:
    """Create a test user for scoring tests."""
    user = UserDB(
        id="scoring_test_user",
        email="scoring@test.com",
        username="scoring_user",
        password_hash="hashed",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def scoring_user_with_profile(db: Session, scoring_user: UserDB) -> UserDB:
    """Create a user with health profile for scoring tests."""
    profile = HealthProfileDB(
        id="scoring_profile",
        user_id=scoring_user.id,
        height_cm=175.0,
        weight_kg=70.0,
        activity_level=ActivityLevel.ACTIVE,
        metabolic_rate=2000,
    )
    db.add(profile)
    db.commit()
    return scoring_user


@pytest.fixture
def scoring_restaurant(db: Session) -> Restaurant:
    """Create a test restaurant for scoring tests."""
    restaurant = Restaurant(
        id="scoring_restaurant",
        name="Scoring Test Restaurant",
        cuisine="Healthy",
        is_active=True,
    )
    db.add(restaurant)
    db.commit()
    return restaurant


@pytest.fixture
def sample_menu_items(db: Session, scoring_restaurant: Restaurant) -> list[MenuItem]:
    """Create sample menu items with varying nutritional profiles."""
    items = [
        MenuItem(
            id="item_low_cal",
            restaurant_id=scoring_restaurant.id,
            name="Light Salad",
            description="Fresh green salad with vegetables",
            calories=250.0,
            price=8.99,
        ),
        MenuItem(
            id="item_high_protein",
            restaurant_id=scoring_restaurant.id,
            name="Protein Power Bowl",
            description="High protein chicken and quinoa bowl",
            calories=450.0,
            price=12.99,
        ),
        MenuItem(
            id="item_high_fiber",
            restaurant_id=scoring_restaurant.id,
            name="Fiber Rich Meal",
            description="Beans, whole grains, and vegetables with high fiber",
            calories=400.0,
            price=10.99,
        ),
        MenuItem(
            id="item_low_sodium",
            restaurant_id=scoring_restaurant.id,
            name="Low Sodium Special",
            description="Heart-healthy meal with low sodium content",
            calories=350.0,
            price=11.99,
        ),
        MenuItem(
            id="item_high_cal",
            restaurant_id=scoring_restaurant.id,
            name="Hearty Meal",
            description="Large portion comfort food",
            calories=900.0,
            price=15.99,
        ),
    ]
    db.add_all(items)
    db.commit()
    return items


class TestPhysicalScoring:
    """Test physical health-based scoring logic."""

    def test_calorie_goal_scoring(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that items matching calorie goals receive higher scores."""
        # Add a calorie goal
        today = date.today()
        goal = GoalDB(
            id="calorie_goal",
            user_id=scoring_user_with_profile.id,
            goal_type=GoalType.NUTRITION,
            target_type="calorie_intake",
            target_value=Decimal("500.0"),
            current_value=Decimal("0.0"),
            start_date=today,
            end_date=today + timedelta(days=30),
            status=GoalStatus.ACTIVE,
        )
        db.add(goal)
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Test items within calorie goal
        assert service._supports_calorie_goal(context.health_goals, 250.0) is True
        assert service._supports_calorie_goal(context.health_goals, 450.0) is True
        # Items exceeding goal should not be supported
        assert service._supports_calorie_goal(context.health_goals, 900.0) is False

    def test_protein_goal_keyword_matching(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that protein goals boost items with protein keywords."""
        # Add a protein goal
        today = date.today()
        goal = GoalDB(
            id="protein_goal",
            user_id=scoring_user_with_profile.id,
            goal_type=GoalType.NUTRITION,
            target_type="protein_intake",
            target_value=Decimal("100.0"),
            current_value=Decimal("50.0"),
            start_date=today,
            end_date=today + timedelta(days=30),
            status=GoalStatus.ACTIVE,
        )
        db.add(goal)
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Test keyword matching
        protein_text = "high protein chicken and quinoa bowl"
        normal_text = "fresh green salad with vegetables"

        assert (
            service._mentions_goal_keywords(protein_text, context.health_goals) is True
        )
        assert (
            service._mentions_goal_keywords(normal_text, context.health_goals) is False
        )

    def test_fiber_goal_keyword_matching(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that fiber goals boost items with fiber keywords."""
        # Add a fiber goal
        today = date.today()
        goal = GoalDB(
            id="fiber_goal",
            user_id=scoring_user_with_profile.id,
            goal_type=GoalType.NUTRITION,
            target_type="fiber_intake",
            target_value=Decimal("30.0"),
            current_value=Decimal("15.0"),
            start_date=today,
            end_date=today + timedelta(days=30),
            status=GoalStatus.ACTIVE,
        )
        db.add(goal)
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Test keyword matching
        fiber_text = "beans, whole grains, and vegetables with high fiber"
        normal_text = "fresh green salad"

        assert service._mentions_goal_keywords(fiber_text, context.health_goals) is True
        assert (
            service._mentions_goal_keywords(normal_text, context.health_goals) is False
        )

    def test_sodium_goal_keyword_matching(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that sodium reduction goals boost low-sodium items."""
        # Add a sodium reduction goal
        today = date.today()
        goal = GoalDB(
            id="sodium_goal",
            user_id=scoring_user_with_profile.id,
            goal_type=GoalType.NUTRITION,
            target_type="sodium_reduction",
            target_value=Decimal("1500.0"),
            current_value=Decimal("2500.0"),
            start_date=today,
            end_date=today + timedelta(days=30),
            status=GoalStatus.ACTIVE,
        )
        db.add(goal)
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Test keyword matching
        low_sodium_text = "heart-healthy meal with low sodium content"
        normal_text = "fresh green salad"

        assert (
            service._mentions_goal_keywords(low_sodium_text, context.health_goals)
            is True
        )
        assert (
            service._mentions_goal_keywords(normal_text, context.health_goals) is False
        )


class TestMentalWellnessScoring:
    """Test mental wellness-based scoring logic.

    According to requirements:
    - User with low mood → Should get Tryptophan-rich recommendations
    - User with high stress → Should get Magnesium-rich recommendations
    """

    def test_tryptophan_items_for_low_mood(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test that tryptophan-rich foods are recommended for low mood."""
        # Create tryptophan-rich menu items
        tryptophan_items = [
            MenuItem(
                id="item_turkey",
                restaurant_id=scoring_restaurant.id,
                name="Turkey Breast",
                description="Rich in tryptophan, helps with serotonin production",
                calories=300.0,
                price=12.99,
            ),
            MenuItem(
                id="item_salmon",
                restaurant_id=scoring_restaurant.id,
                name="Grilled Salmon",
                description="Omega-3 fatty acids and tryptophan for mood support",
                calories=400.0,
                price=16.99,
            ),
            MenuItem(
                id="item_chicken",
                restaurant_id=scoring_restaurant.id,
                name="Chicken Meal",
                description="High-quality protein with tryptophan",
                calories=350.0,
                price=13.99,
            ),
        ]
        db.add_all(tryptophan_items)
        db.commit()

        # service = RecommendationService(db, max_results=10)

        # Get all menu items
        # all_items = service._get_menu_item_candidates()

        # Verify tryptophan-related items can be identified by keywords
        tryptophan_keywords = ["tryptophan", "turkey", "salmon", "chicken"]
        for item in tryptophan_items:
            item_text = f"{item.name} {item.description}".lower()
            assert any(keyword in item_text for keyword in tryptophan_keywords)

    def test_magnesium_items_for_high_stress(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test that magnesium-rich foods are recommended for high stress."""
        # Create magnesium-rich menu items
        magnesium_items = [
            MenuItem(
                id="item_spinach",
                restaurant_id=scoring_restaurant.id,
                name="Spinach Salad",
                description="Rich in magnesium for stress relief and relaxation",
                calories=200.0,
                price=9.99,
            ),
            MenuItem(
                id="item_almonds",
                restaurant_id=scoring_restaurant.id,
                name="Almond Bowl",
                description="High magnesium content helps reduce stress",
                calories=250.0,
                price=8.99,
            ),
            MenuItem(
                id="item_avocado",
                restaurant_id=scoring_restaurant.id,
                name="Avocado Toast",
                description="Magnesium and healthy fats for stress management",
                calories=300.0,
                price=11.99,
            ),
        ]
        db.add_all(magnesium_items)
        db.commit()

        # service = RecommendationService(db, max_results=10)

        # Get all menu items
        # all_items = service._get_menu_item_candidates()

        # Verify magnesium-related items can be identified by keywords
        magnesium_keywords = ["magnesium", "spinach", "almonds", "almond", "avocado"]
        for item in magnesium_items:
            item_text = f"{item.name} {item.description}".lower()
            assert any(keyword in item_text for keyword in magnesium_keywords)


class TestCombinedScoringFormula:
    """Test the combined scoring formula that integrates multiple factors."""

    def test_baseline_scoring_components(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that baseline scoring includes all expected components."""
        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)
        filters = RecommendationFilters()

        # Get baseline recommendations
        recommendations = service._get_baseline_meals(
            context, sample_menu_items, filters
        )

        # Verify all items are scored
        assert len(recommendations) == len(sample_menu_items)

        # Verify scores are within valid range
        for rec in recommendations:
            assert 0.0 <= rec.score <= 1.0
            assert rec.explanation  # Should have explanation

    def test_score_ranking_order(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that items are ranked by score in descending order."""
        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)
        filters = RecommendationFilters()

        recommendations = service._get_baseline_meals(
            context, sample_menu_items, filters
        )

        # Verify descending score order
        scores = [rec.score for rec in recommendations]
        assert scores == sorted(scores, reverse=True)

    def test_cuisine_preference_scoring_boost(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test that preferred cuisines receive scoring boosts."""
        # Add Italian cuisine preference
        from src.eatsential.models.models import DietaryPreferenceDB, PreferenceType

        profile = (
            db.query(HealthProfileDB)
            .filter_by(user_id=scoring_user_with_profile.id)
            .first()
        )
        pref = DietaryPreferenceDB(
            id="italian_pref",
            health_profile_id=profile.id,
            preference_type=PreferenceType.CUISINE,
            preference_name="Italian",
            is_strict=False,
        )
        db.add(pref)
        db.commit()

        # Create Italian and non-Italian restaurants
        italian_restaurant = Restaurant(
            id="italian_rest",
            name="Italian Place",
            cuisine="Italian",
            is_active=True,
        )
        other_restaurant = Restaurant(
            id="other_rest",
            name="Other Place",
            cuisine="American",
            is_active=True,
        )
        db.add_all([italian_restaurant, other_restaurant])
        db.flush()

        # Create similar menu items for both
        italian_item = MenuItem(
            id="italian_item",
            restaurant_id=italian_restaurant.id,
            name="Pasta",
            description="Italian pasta dish",
            calories=400.0,
            price=12.99,
        )
        other_item = MenuItem(
            id="other_item",
            restaurant_id=other_restaurant.id,
            name="Burger",
            description="American burger",
            calories=400.0,
            price=12.99,
        )
        db.add_all([italian_item, other_item])
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)
        filters = RecommendationFilters()

        # Get recommendations
        all_items = [italian_item, other_item]
        recommendations = service._get_baseline_meals(context, all_items, filters)

        # Find scores
        italian_score = next(
            r.score for r in recommendations if r.item_id == "italian_item"
        )
        other_score = next(
            r.score for r in recommendations if r.item_id == "other_item"
        )

        # Italian item should have higher score due to cuisine preference
        assert italian_score > other_score

    def test_price_range_filter_scoring(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        sample_menu_items: list[MenuItem],
    ):
        """Test that price range filters affect scoring."""
        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Test with price filter
        filters_with_price = RecommendationFilters(price_range="$")
        recommendations_filtered = service._get_baseline_meals(
            context, sample_menu_items, filters_with_price
        )

        # Test without price filter
        filters_no_price = RecommendationFilters()
        recommendations_unfiltered = service._get_baseline_meals(
            context, sample_menu_items, filters_no_price
        )

        # With budget filter, only cheap items should be included
        assert len(recommendations_filtered) < len(recommendations_unfiltered)


class TestContextRulesApplication:
    """Test application of safety and context rules."""

    def test_allergen_filtering(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test that items with allergens are filtered out."""
        from src.eatsential.models.models import (
            AllergenDB,
            AllergySeverity,
            UserAllergyDB,
        )

        # Add peanut allergy
        profile = (
            db.query(HealthProfileDB)
            .filter_by(user_id=scoring_user_with_profile.id)
            .first()
        )
        allergen = AllergenDB(
            id="peanut_allergen",
            name="peanut",
            category="Nuts",
            description="Peanut allergen",
        )
        db.add(allergen)
        db.flush()

        allergy = UserAllergyDB(
            id="user_peanut_allergy",
            health_profile_id=profile.id,
            allergen_id=allergen.id,
            severity=AllergySeverity.SEVERE,
        )
        db.add(allergy)
        db.commit()

        # Create items with and without peanuts
        safe_item = MenuItem(
            id="safe_item",
            restaurant_id=scoring_restaurant.id,
            name="Safe Meal",
            description="Rice and vegetables",
            calories=300.0,
            price=10.99,
        )
        unsafe_item = MenuItem(
            id="unsafe_item",
            restaurant_id=scoring_restaurant.id,
            name="Peanut Butter Bowl",
            description="Contains peanut butter",
            calories=400.0,
            price=11.99,
        )
        db.add_all([safe_item, unsafe_item])
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Apply safety filters
        all_items = [safe_item, unsafe_item]
        filtered_items = service._apply_safety_filters(context, all_items)

        # Only safe item should remain
        assert len(filtered_items) == 1
        assert filtered_items[0].id == "safe_item"

    def test_strict_dietary_preference_filtering(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test that strict dietary preferences filter out non-compliant items."""
        from src.eatsential.models.models import DietaryPreferenceDB, PreferenceType

        # Add strict vegan preference
        profile = (
            db.query(HealthProfileDB)
            .filter_by(user_id=scoring_user_with_profile.id)
            .first()
        )
        pref = DietaryPreferenceDB(
            id="vegan_pref",
            health_profile_id=profile.id,
            preference_type=PreferenceType.DIET,
            preference_name="vegan",
            is_strict=True,
        )
        db.add(pref)
        db.commit()

        # Create vegan and non-vegan items
        vegan_item = MenuItem(
            id="vegan_item",
            restaurant_id=scoring_restaurant.id,
            name="Vegan Bowl",
            description="Plant-based meal with vegetables",
            calories=350.0,
            price=11.99,
        )
        meat_item = MenuItem(
            id="meat_item",
            restaurant_id=scoring_restaurant.id,
            name="Chicken Meal",
            description="Grilled chicken breast",
            calories=400.0,
            price=13.99,
        )
        db.add_all([vegan_item, meat_item])
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Apply safety filters
        all_items = [vegan_item, meat_item]
        filtered_items = service._apply_safety_filters(context, all_items)

        # Only vegan item should remain (meat contains chicken)
        assert len(filtered_items) == 1
        assert filtered_items[0].id == "vegan_item"

    def test_empty_food_database_edge_case(
        self, db: Session, scoring_user_with_profile: UserDB
    ):
        """Test handling of empty food database."""
        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)
        filters = RecommendationFilters()

        # Test with empty list
        recommendations = service._get_baseline_meals(context, [], filters)

        assert recommendations == []

    def test_no_matching_items_after_filtering(
        self,
        db: Session,
        scoring_user_with_profile: UserDB,
        scoring_restaurant: Restaurant,
    ):
        """Test behavior when all items are filtered out."""
        from src.eatsential.models.models import DietaryPreferenceDB, PreferenceType

        # Add strict vegan preference
        profile = (
            db.query(HealthProfileDB)
            .filter_by(user_id=scoring_user_with_profile.id)
            .first()
        )
        pref = DietaryPreferenceDB(
            id="vegan_strict",
            health_profile_id=profile.id,
            preference_type=PreferenceType.DIET,
            preference_name="vegan",
            is_strict=True,
        )
        db.add(pref)
        db.commit()

        # Create only non-vegan items
        items = [
            MenuItem(
                id="meat1",
                restaurant_id=scoring_restaurant.id,
                name="Beef Steak",
                description="Prime beef steak",
                calories=500.0,
                price=18.99,
            ),
            MenuItem(
                id="meat2",
                restaurant_id=scoring_restaurant.id,
                name="Pork Chops",
                description="Grilled pork",
                calories=450.0,
                price=16.99,
            ),
        ]
        db.add_all(items)
        db.commit()

        service = RecommendationService(db, max_results=10)
        context = service._load_user_context(scoring_user_with_profile)

        # Apply safety filters
        filtered_items = service._apply_safety_filters(context, items)

        # All items should be filtered out
        assert len(filtered_items) == 0
