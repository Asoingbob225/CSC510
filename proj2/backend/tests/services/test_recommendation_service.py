"""Unit tests for RecommendService with health profile integration."""

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import (
    ActivityLevel,
    AllergenDB,
    AllergySeverity,
    DietaryPreferenceDB,
    HealthProfileDB,
    MenuItem,
    PreferenceType,
    Restaurant,
    UserAllergyDB,
    UserDB,
)
from src.eatsential.services.recommend_service import RecommendService


@pytest.fixture
def test_user(db: Session) -> UserDB:
    """Create a test user."""
    user = UserDB(
        id="test_user_rec",
        email="test_rec@example.com",
        username="testuser_rec",
        password_hash="hashed_password",
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_with_health_profile(db: Session, test_user: UserDB):
    """Create test user with health profile and preferences."""
    # Create allergen
    allergen = AllergenDB(
        id="allergen_peanut",
        name="Peanut",
        category="Nuts",
        description="Peanut allergen",
    )
    db.add(allergen)
    db.flush()

    # Create health profile
    health_profile = HealthProfileDB(
        id="health_profile_1",
        user_id=test_user.id,
        height_cm=175.0,
        weight_kg=70.0,
        activity_level=ActivityLevel.MODERATE,
        metabolic_rate=2000,
    )
    db.add(health_profile)
    db.flush()

    # Add allergy
    allergy = UserAllergyDB(
        id="allergy_1",
        health_profile_id=health_profile.id,
        allergen_id=allergen.id,
        severity=AllergySeverity.SEVERE,
    )
    db.add(allergy)

    # Add dietary preference
    preference = DietaryPreferenceDB(
        id="pref_1",
        health_profile_id=health_profile.id,
        preference_type=PreferenceType.DIET,
        preference_name="Vegetarian",
        is_strict=True,
    )
    db.add(preference)

    db.commit()
    return test_user, health_profile


@pytest.fixture
def test_restaurants(db: Session):
    """Create test restaurants and menu items."""
    # Create restaurants
    restaurant1 = Restaurant(
        id="rest_healthy",
        name="Healthy Eats",
        cuisine="Healthy",
        is_active=True,
    )
    restaurant2 = Restaurant(
        id="rest_fast",
        name="Fast Food Place",
        cuisine="Fast Food",
        is_active=True,
    )
    db.add_all([restaurant1, restaurant2])
    db.flush()

    # Add menu items
    items = [
        MenuItem(
            id="item_salad",
            restaurant_id="rest_healthy",
            name="Grilled Chicken Salad",
            description="Healthy grilled chicken with fresh greens",
            calories=350.0,
            price=12.99,
        ),
        MenuItem(
            id="item_quinoa",
            restaurant_id="rest_healthy",
            name="Quinoa Power Bowl",
            description="Nutrient-rich quinoa bowl",
            calories=420.0,
            price=13.50,
        ),
        MenuItem(
            id="item_burger",
            restaurant_id="rest_fast",
            name="Classic Burger",
            description="Beef burger with fries",
            calories=850.0,
            price=9.99,
        ),
        MenuItem(
            id="item_mystery",
            restaurant_id="rest_healthy",
            name="Mystery Special",
            description="Chef's surprise",
            calories=None,
            price=None,
        ),
    ]
    for item in items:
        db.add(item)

    db.commit()
    return restaurant1, restaurant2, items


def test_get_user_context_basic(db: Session, test_user: UserDB):
    """Test getting user context without health profile."""
    service = RecommendService(db)
    context = service.get_user_context(test_user.id)

    assert context["user_id"] == test_user.id
    assert context["has_health_profile"] is False
    assert "height_cm" not in context
    assert "allergies" not in context


def test_get_user_context_with_health_profile(
    db: Session, test_user_with_health_profile
):
    """Test getting user context with complete health profile."""
    test_user, _ = test_user_with_health_profile
    service = RecommendService(db)
    context = service.get_user_context(test_user.id)

    assert context["user_id"] == test_user.id
    assert context["has_health_profile"] is True
    assert context["height_cm"] == 175.0
    assert context["weight_kg"] == 70.0
    assert context["activity_level"] == ActivityLevel.MODERATE
    assert context["metabolic_rate"] == "2000"
    assert len(context["allergies"]) == 1
    assert context["allergies"][0]["name"] == "Peanut"
    assert context["allergies"][0]["severity"] == AllergySeverity.SEVERE
    assert len(context["dietary_preferences"]) == 1
    assert context["dietary_preferences"][0]["preference_type"] == PreferenceType.DIET
    assert context["dietary_preferences"][0]["preference_name"] == "Vegetarian"


def test_get_user_context_user_not_found(db: Session):
    """Test get_user_context raises ValueError for non-existent user."""
    service = RecommendService(db)
    with pytest.raises(ValueError, match="User not found"):
        service.get_user_context("nonexistent_user")


def test_recommend_meals_basic(db: Session, test_user: UserDB, test_restaurants):
    """Test basic meal recommendations without health profile."""
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id)

    assert len(recommendations) > 0
    assert len(recommendations) <= 10

    # Check structure of recommendations
    for rec in recommendations:
        assert hasattr(rec, "menu_item_id")
        assert hasattr(rec, "score")
        assert hasattr(rec, "explanation")
        assert isinstance(rec.score, float)
        assert 0 <= rec.score <= 1
        assert isinstance(rec.explanation, str)
        assert len(rec.explanation) > 0


def test_recommend_meals_with_health_profile(
    db: Session, test_user_with_health_profile, test_restaurants
):
    """Test meal recommendations with health profile."""
    test_user, _ = test_user_with_health_profile
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id)

    assert len(recommendations) > 0
    # Recommendations should be sorted by score
    scores = [rec.score for rec in recommendations]
    assert scores == sorted(scores, reverse=True)


def test_recommend_meals_with_calorie_constraint(
    db: Session, test_user: UserDB, test_restaurants
):
    """Test meal recommendations with calorie constraint."""
    service = RecommendService(db)
    constraints = {"max_calories": 500}
    recommendations = service.recommend_meals(test_user.id, constraints=constraints)

    # Should only include items with calories <= 500
    # Note: items without calorie info are filtered out by constraint
    assert len(recommendations) > 0
    for rec in recommendations:
        # Verify by checking the returned items
        item = db.query(MenuItem).filter(MenuItem.id == rec.menu_item_id).first()
        assert item is not None
        if item.calories is not None:
            assert item.calories <= 500


def test_recommend_meals_with_price_constraint(
    db: Session, test_user: UserDB, test_restaurants
):
    """Test meal recommendations with price constraint."""
    service = RecommendService(db)
    constraints = {"max_price": 13.00}
    recommendations = service.recommend_meals(test_user.id, constraints=constraints)

    # Should only include items with price <= 13.00
    assert len(recommendations) > 0
    for rec in recommendations:
        item = db.query(MenuItem).filter(MenuItem.id == rec.menu_item_id).first()
        assert item is not None
        if item.price is not None:
            assert item.price <= 13.00


def test_recommend_meals_with_multiple_constraints(
    db: Session, test_user: UserDB, test_restaurants
):
    """Test meal recommendations with multiple constraints."""
    service = RecommendService(db)
    constraints = {"max_calories": 500, "max_price": 15.00}
    recommendations = service.recommend_meals(test_user.id, constraints=constraints)

    assert len(recommendations) > 0
    for rec in recommendations:
        item = db.query(MenuItem).filter(MenuItem.id == rec.menu_item_id).first()
        assert item is not None
        if item.calories is not None:
            assert item.calories <= 500
        if item.price is not None:
            assert item.price <= 15.00


def test_recommend_meals_limit(db: Session, test_user: UserDB, test_restaurants):
    """Test that recommendation limit is respected."""
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id, limit=2)

    assert len(recommendations) <= 2


def test_recommend_meals_empty_results(db: Session, test_user: UserDB):
    """Test recommendations when no menu items available."""
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id)

    assert recommendations == []


def test_recommend_meals_user_not_found(db: Session, test_restaurants):
    """Test recommendations for non-existent user."""
    service = RecommendService(db)
    with pytest.raises(ValueError, match="User not found"):
        service.recommend_meals("nonexistent_user")


def test_score_menu_item(db: Session, test_user: UserDB, test_restaurants):
    """Test menu item scoring logic."""
    service = RecommendService(db)
    user_context = service.get_user_context(test_user.id)

    # Get a menu item with full data
    item = db.query(MenuItem).filter(MenuItem.id == "item_salad").first()
    assert item is not None
    score, explanation = service._score_menu_item(item, user_context)

    # Item with calories and price should score 1.0 (0.5 base + 0.3 + 0.2)
    assert score == 1.0
    assert "Healthy Eats" in explanation
    assert "350 cal" in explanation
    assert "$12.99" in explanation

    # Get item without nutritional data
    item_mystery = db.query(MenuItem).filter(MenuItem.id == "item_mystery").first()
    assert item_mystery is not None
    score_mystery, explanation_mystery = service._score_menu_item(
        item_mystery, user_context
    )

    # Item without data should score 0.5 (base score only)
    assert score_mystery == 0.5
    assert "Healthy Eats" in explanation_mystery


def test_apply_constraints(db: Session, test_restaurants):
    """Test constraint application logic."""
    service = RecommendService(db)
    menu_items = db.query(MenuItem).all()

    # Test calorie constraint
    constraints = {"max_calories": 500}
    filtered = service._apply_constraints(menu_items, constraints)
    for item in filtered:
        if item.calories is not None:
            assert item.calories <= 500

    # Test price constraint
    constraints = {"max_price": 12.00}
    filtered = service._apply_constraints(menu_items, constraints)
    for item in filtered:
        if item.price is not None:
            assert item.price <= 12.00

    # Test combined constraints
    constraints = {"max_calories": 500, "max_price": 15.00}
    filtered = service._apply_constraints(menu_items, constraints)
    for item in filtered:
        if item.calories is not None:
            assert item.calories <= 500
        if item.price is not None:
            assert item.price <= 15.00


def test_allergen_filtering_basic(db: Session, test_user: UserDB):
    """Test that menu items with user allergens are filtered out."""
    # Create allergen
    peanut_allergen = AllergenDB(
        id="allergen_peanut_test",
        name="Peanut",
        category="Nuts",
        description="Peanut allergen",
    )
    db.add(peanut_allergen)
    db.flush()

    # Create health profile with peanut allergy
    health_profile = HealthProfileDB(
        id="health_profile_allergy_test",
        user_id=test_user.id,
        height_cm=175.0,
        weight_kg=70.0,
        activity_level=ActivityLevel.MODERATE,
        metabolic_rate=2000,
    )
    db.add(health_profile)
    db.flush()

    allergy = UserAllergyDB(
        id="allergy_test",
        health_profile_id=health_profile.id,
        allergen_id=peanut_allergen.id,
        severity=AllergySeverity.SEVERE,
    )
    db.add(allergy)
    db.commit()

    # Create restaurant and menu items
    restaurant = Restaurant(
        id="rest_allergen_test",
        name="Test Restaurant",
        cuisine="Mixed",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    # Safe item (no allergens)
    safe_item = MenuItem(
        id="item_safe",
        restaurant_id=restaurant.id,
        name="Grilled Chicken",
        description="Plain grilled chicken",
        calories=300.0,
        price=10.99,
    )

    # Unsafe item (contains peanut)
    unsafe_item = MenuItem(
        id="item_peanut",
        restaurant_id=restaurant.id,
        name="Peanut Butter Sandwich",
        description="Contains peanut butter",
        calories=400.0,
        price=8.99,
    )
    unsafe_item.allergens.append(peanut_allergen)

    db.add_all([safe_item, unsafe_item])
    db.commit()

    # Get recommendations
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id)

    # Check that unsafe item is not in recommendations
    recommended_ids = [rec.menu_item_id for rec in recommendations]
    assert "item_safe" in recommended_ids, "Safe item should be recommended"
    assert "item_peanut" not in recommended_ids, "Peanut item should be filtered out"


def test_allergen_filtering_multiple_allergens(db: Session, test_user: UserDB):
    """Test filtering with multiple allergens."""
    # Create multiple allergens
    peanut = AllergenDB(
        id="allergen_peanut_multi",
        name="Peanut",
        category="Nuts",
    )
    shellfish = AllergenDB(
        id="allergen_shellfish",
        name="Shellfish",
        category="Seafood",
    )
    db.add_all([peanut, shellfish])
    db.flush()

    # User allergic to both
    health_profile = HealthProfileDB(
        id="health_profile_multi_allergy",
        user_id=test_user.id,
        height_cm=175.0,
        weight_kg=70.0,
        activity_level=ActivityLevel.MODERATE,
        metabolic_rate=2000,
    )
    db.add(health_profile)
    db.flush()

    allergy1 = UserAllergyDB(
        id="allergy_peanut_multi",
        health_profile_id=health_profile.id,
        allergen_id=peanut.id,
        severity=AllergySeverity.SEVERE,
    )
    allergy2 = UserAllergyDB(
        id="allergy_shellfish",
        health_profile_id=health_profile.id,
        allergen_id=shellfish.id,
        severity=AllergySeverity.MODERATE,
    )
    db.add_all([allergy1, allergy2])
    db.commit()

    # Create restaurant and items
    restaurant = Restaurant(
        id="rest_multi_allergen",
        name="Seafood Restaurant",
        cuisine="Seafood",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    safe_item = MenuItem(
        id="item_chicken_multi",
        restaurant_id=restaurant.id,
        name="Chicken Breast",
        calories=300.0,
        price=12.99,
    )

    peanut_item = MenuItem(
        id="item_peanut_dish",
        restaurant_id=restaurant.id,
        name="Thai Peanut Noodles",
        calories=500.0,
        price=11.99,
    )
    peanut_item.allergens.append(peanut)

    shellfish_item = MenuItem(
        id="item_shrimp",
        restaurant_id=restaurant.id,
        name="Shrimp Scampi",
        calories=450.0,
        price=15.99,
    )
    shellfish_item.allergens.append(shellfish)

    both_allergens_item = MenuItem(
        id="item_pad_thai",
        restaurant_id=restaurant.id,
        name="Pad Thai with Shrimp",
        calories=600.0,
        price=13.99,
    )
    both_allergens_item.allergens.extend([peanut, shellfish])

    db.add_all([safe_item, peanut_item, shellfish_item, both_allergens_item])
    db.commit()

    # Get recommendations
    service = RecommendService(db)
    recommendations = service.recommend_meals(test_user.id)

    # Only safe item should be recommended
    recommended_ids = [rec.menu_item_id for rec in recommendations]
    assert "item_chicken_multi" in recommended_ids
    assert "item_peanut_dish" not in recommended_ids
    assert "item_shrimp" not in recommended_ids
    assert "item_pad_thai" not in recommended_ids


def test_allergen_score_explanation(db: Session, test_user: UserDB):
    """Test that allergen items get score=0 with proper explanation."""
    # Create allergen
    milk_allergen = AllergenDB(
        id="allergen_milk",
        name="Milk",
        category="Dairy",
    )
    db.add(milk_allergen)
    db.flush()

    # Create health profile with milk allergy
    health_profile = HealthProfileDB(
        id="health_profile_milk",
        user_id=test_user.id,
        height_cm=175.0,
        weight_kg=70.0,
        activity_level=ActivityLevel.MODERATE,
        metabolic_rate=2000,
    )
    db.add(health_profile)
    db.flush()

    allergy = UserAllergyDB(
        id="allergy_milk",
        health_profile_id=health_profile.id,
        allergen_id=milk_allergen.id,
        severity=AllergySeverity.MILD,
    )
    db.add(allergy)
    db.commit()

    # Create restaurant and menu item with milk
    restaurant = Restaurant(
        id="rest_dairy",
        name="Dairy Restaurant",
        cuisine="American",
        is_active=True,
    )
    db.add(restaurant)
    db.flush()

    dairy_item = MenuItem(
        id="item_mac_cheese",
        restaurant_id=restaurant.id,
        name="Mac and Cheese",
        calories=450.0,
        price=9.99,
    )
    dairy_item.allergens.append(milk_allergen)
    db.add(dairy_item)
    db.commit()

    # Test scoring
    service = RecommendService(db)
    user_context = service.get_user_context(test_user.id)

    db.refresh(dairy_item)  # Refresh to load allergens relationship
    score, explanation = service._score_menu_item(dairy_item, user_context)

    assert score == 0.0, "Item with allergen should have score 0.0"
    assert "allergen" in explanation.lower(), "Explanation should mention allergen"
    assert "milk" in explanation.lower(), "Explanation should mention milk"
