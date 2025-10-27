#!/usr/bin/env python3
"""Initial database setup script.

This script creates the initial SQLite database file and sets up the basic schema.
Run this script once when setting up your development environment.

Usage:
    python create_init_database.py
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.eatsential.db.database import DATABASE_URL, get_database_path
from src.eatsential.models import MenuItem, Restaurant


def seed_restaurants(session):
    """Seed the database with sample restaurant data."""
    print("\nSeeding restaurant data...")

    restaurants_data = [
        {
            "name": "Green Bowl Cafe",
            "address": "123 Main St, Downtown",
            "cuisine": "Healthy",
            "menu_items": [
                {
                    "name": "Quinoa Power Bowl",
                    "description": "Quinoa with roasted vegetables",
                    "calories": 420.5,
                    "price": 12.99,
                },
                {
                    "name": "Grilled Tofu Salad",
                    "description": "Fresh greens with marinated tofu",
                    "calories": 350.0,
                    "price": 11.50,
                },
                {
                    "name": "Kale & Berry Smoothie",
                    "description": "Nutrient-packed smoothie",
                    "calories": 280.0,
                    "price": 6.99,
                },
                {
                    "name": "Avocado Toast",
                    "description": "Whole grain toast with avocado",
                    "calories": 320.0,
                    "price": 9.99,
                },
            ],
        },
        {
            "name": "Sunny Sushi Bar",
            "address": "456 Oak Ave, Midtown",
            "cuisine": "Japanese",
            "menu_items": [
                {
                    "name": "Salmon Nigiri Set",
                    "description": "Fresh salmon sushi",
                    "calories": 320.0,
                    "price": 15.99,
                },
                {
                    "name": "Vegetable Roll",
                    "description": "Cucumber, avocado, carrot",
                    "calories": 250.0,
                    "price": 8.99,
                },
                {
                    "name": "Miso Soup",
                    "description": "Traditional miso soup",
                    "calories": 80.0,
                    "price": 3.50,
                },
                {
                    "name": "California Roll",
                    "description": "Crab, avocado, cucumber",
                    "calories": 290.0,
                    "price": 10.99,
                },
            ],
        },
        {
            "name": "Mediterranean Delight",
            "address": "789 Elm St, Uptown",
            "cuisine": "Mediterranean",
            "menu_items": [
                {
                    "name": "Falafel Wrap",
                    "description": "Chickpea falafel in pita",
                    "calories": 480.0,
                    "price": 11.99,
                },
                {
                    "name": "Greek Salad",
                    "description": "Fresh vegetables with feta",
                    "calories": 220.0,
                    "price": 9.50,
                },
                {
                    "name": "Hummus Platter",
                    "description": "Homemade hummus with pita",
                    "calories": 350.0,
                    "price": 8.99,
                },
                {
                    "name": "Grilled Lamb Kebab",
                    "description": "Seasoned lamb skewers",
                    "calories": 520.0,
                    "price": 16.99,
                },
            ],
        },
        {
            "name": "Spice Route Indian",
            "address": "321 Maple Dr, Eastside",
            "cuisine": "Indian",
            "menu_items": [
                {
                    "name": "Chicken Tikka Masala",
                    "description": "Creamy tomato curry",
                    "calories": 550.0,
                    "price": 14.99,
                },
                {
                    "name": "Vegetable Biryani",
                    "description": "Aromatic rice with vegetables",
                    "calories": 420.0,
                    "price": 12.50,
                },
                {
                    "name": "Palak Paneer",
                    "description": "Spinach with cottage cheese",
                    "calories": 380.0,
                    "price": 13.50,
                },
                {
                    "name": "Samosa (3 pcs)",
                    "description": "Crispy potato pastries",
                    "calories": 310.0,
                    "price": 6.99,
                },
            ],
        },
        {
            "name": "Taco Fiesta",
            "address": "654 Pine St, Westside",
            "cuisine": "Mexican",
            "menu_items": [
                {
                    "name": "Fish Tacos",
                    "description": "Grilled fish with salsa",
                    "calories": 380.0,
                    "price": 13.99,
                },
                {
                    "name": "Veggie Burrito",
                    "description": "Black beans, rice, vegetables",
                    "calories": 520.0,
                    "price": 11.99,
                },
                {
                    "name": "Guacamole & Chips",
                    "description": "Fresh avocado dip",
                    "calories": 290.0,
                    "price": 7.99,
                },
                {
                    "name": "Chicken Quesadilla",
                    "description": "Grilled chicken & cheese",
                    "calories": 580.0,
                    "price": 12.50,
                },
            ],
        },
        {
            "name": "Pasta Paradise",
            "address": "987 Cedar Ln, North End",
            "cuisine": "Italian",
            "menu_items": [
                {
                    "name": "Spaghetti Carbonara",
                    "description": "Creamy bacon pasta",
                    "calories": 680.0,
                    "price": 15.99,
                },
                {
                    "name": "Margherita Pizza",
                    "description": "Fresh mozzarella & basil",
                    "calories": 720.0,
                    "price": 14.50,
                },
                {
                    "name": "Caesar Salad",
                    "description": "Romaine with parmesan",
                    "calories": 250.0,
                    "price": 8.99,
                },
                {
                    "name": "Penne Arrabbiata",
                    "description": "Spicy tomato sauce",
                    "calories": 450.0,
                    "price": 13.50,
                },
            ],
        },
        {
            "name": "Dragon Wok",
            "address": "147 Bamboo St, Chinatown",
            "cuisine": "Chinese",
            "menu_items": [
                {
                    "name": "Kung Pao Chicken",
                    "description": "Spicy stir-fried chicken",
                    "calories": 520.0,
                    "price": 13.99,
                },
                {
                    "name": "Vegetable Fried Rice",
                    "description": "Wok-fried rice with veggies",
                    "calories": 380.0,
                    "price": 9.99,
                },
                {
                    "name": "Spring Rolls (4 pcs)",
                    "description": "Crispy vegetable rolls",
                    "calories": 240.0,
                    "price": 6.50,
                },
                {
                    "name": "Sweet & Sour Pork",
                    "description": "Crispy pork in tangy sauce",
                    "calories": 610.0,
                    "price": 14.50,
                },
            ],
        },
        {
            "name": "Burger Station",
            "address": "258 Grill Ave, South Park",
            "cuisine": "American",
            "menu_items": [
                {
                    "name": "Classic Cheeseburger",
                    "description": "Beef patty with cheese",
                    "calories": 720.0,
                    "price": 12.99,
                },
                {
                    "name": "Veggie Burger",
                    "description": "Plant-based patty",
                    "calories": 480.0,
                    "price": 11.99,
                },
                {
                    "name": "Sweet Potato Fries",
                    "description": "Crispy sweet potato fries",
                    "calories": 320.0,
                    "price": 5.99,
                },
                {
                    "name": "BBQ Chicken Sandwich",
                    "description": "Grilled chicken with BBQ sauce",
                    "calories": 560.0,
                    "price": 13.50,
                },
            ],
        },
        {
            "name": "Thai Orchid",
            "address": "369 Lotus Blvd, Gateway",
            "cuisine": "Thai",
            "menu_items": [
                {
                    "name": "Pad Thai",
                    "description": "Stir-fried rice noodles",
                    "calories": 520.0,
                    "price": 13.99,
                },
                {
                    "name": "Green Curry",
                    "description": "Coconut curry with vegetables",
                    "calories": 450.0,
                    "price": 12.99,
                },
                {
                    "name": "Tom Yum Soup",
                    "description": "Spicy & sour soup",
                    "calories": 180.0,
                    "price": 7.99,
                },
                {
                    "name": "Mango Sticky Rice",
                    "description": "Sweet coconut rice dessert",
                    "calories": 380.0,
                    "price": 6.99,
                },
            ],
        },
        {
            "name": "Le Croissant",
            "address": "741 Baguette St, French Quarter",
            "cuisine": "French",
            "menu_items": [
                {
                    "name": "Croissant Sandwich",
                    "description": "Ham & cheese croissant",
                    "calories": 420.0,
                    "price": 9.99,
                },
                {
                    "name": "Quiche Lorraine",
                    "description": "Bacon & cheese quiche",
                    "calories": 480.0,
                    "price": 11.50,
                },
                {
                    "name": "French Onion Soup",
                    "description": "Classic onion soup",
                    "calories": 320.0,
                    "price": 8.99,
                },
                {
                    "name": "Crème Brûlée",
                    "description": "Caramelized custard dessert",
                    "calories": 290.0,
                    "price": 7.50,
                },
            ],
        },
        {
            "name": "Seoul Kitchen",
            "address": "852 Kimchi Way, Korea Town",
            "cuisine": "Korean",
            "menu_items": [
                {
                    "name": "Bibimbap",
                    "description": "Mixed rice bowl with vegetables",
                    "calories": 520.0,
                    "price": 14.99,
                },
                {
                    "name": "Korean BBQ Beef",
                    "description": "Marinated grilled beef",
                    "calories": 580.0,
                    "price": 17.99,
                },
                {
                    "name": "Kimchi Fried Rice",
                    "description": "Spicy fermented cabbage rice",
                    "calories": 450.0,
                    "price": 12.50,
                },
                {
                    "name": "Japchae",
                    "description": "Sweet potato noodles",
                    "calories": 380.0,
                    "price": 11.99,
                },
            ],
        },
        {
            "name": "Poke Paradise",
            "address": "963 Ocean Dr, Beach District",
            "cuisine": "Hawaiian",
            "menu_items": [
                {
                    "name": "Ahi Tuna Poke Bowl",
                    "description": "Fresh tuna with rice",
                    "calories": 420.0,
                    "price": 15.99,
                },
                {
                    "name": "Salmon Poke Bowl",
                    "description": "Fresh salmon with edamame",
                    "calories": 450.0,
                    "price": 14.99,
                },
                {
                    "name": "Spam Musubi",
                    "description": "Rice & spam wrapped in seaweed",
                    "calories": 290.0,
                    "price": 6.50,
                },
                {
                    "name": "Hawaiian BBQ Chicken",
                    "description": "Teriyaki glazed chicken",
                    "calories": 520.0,
                    "price": 13.99,
                },
            ],
        },
        {
            "name": "Vegan Heaven",
            "address": "159 Plant St, Green District",
            "cuisine": "Vegan",
            "menu_items": [
                {
                    "name": "Beyond Burger",
                    "description": "Plant-based burger patty",
                    "calories": 480.0,
                    "price": 13.99,
                },
                {
                    "name": "Buddha Bowl",
                    "description": "Chickpeas, quinoa, vegetables",
                    "calories": 420.0,
                    "price": 12.50,
                },
                {
                    "name": "Acai Bowl",
                    "description": "Acai berries with granola",
                    "calories": 320.0,
                    "price": 9.99,
                },
                {
                    "name": "Jackfruit Tacos",
                    "description": "Pulled jackfruit tacos",
                    "calories": 380.0,
                    "price": 11.99,
                },
            ],
        },
        {
            "name": "Steak & Co",
            "address": "357 Ribeye Rd, Business District",
            "cuisine": "Steakhouse",
            "menu_items": [
                {
                    "name": "Ribeye Steak",
                    "description": "12oz premium ribeye",
                    "calories": 780.0,
                    "price": 29.99,
                },
                {
                    "name": "Filet Mignon",
                    "description": "8oz tender filet",
                    "calories": 520.0,
                    "price": 34.99,
                },
                {
                    "name": "Grilled Salmon",
                    "description": "Fresh Atlantic salmon",
                    "calories": 480.0,
                    "price": 24.99,
                },
                {
                    "name": "Baked Potato",
                    "description": "Loaded baked potato",
                    "calories": 320.0,
                    "price": 6.99,
                },
            ],
        },
        {
            "name": "Breakfast Club",
            "address": "753 Morning Ave, Sunrise Heights",
            "cuisine": "Breakfast",
            "menu_items": [
                {
                    "name": "Pancake Stack",
                    "description": "Fluffy buttermilk pancakes",
                    "calories": 620.0,
                    "price": 9.99,
                },
                {
                    "name": "Eggs Benedict",
                    "description": "Poached eggs on English muffin",
                    "calories": 520.0,
                    "price": 12.99,
                },
                {
                    "name": "Avocado Toast Deluxe",
                    "description": "Avocado with poached egg",
                    "calories": 420.0,
                    "price": 11.50,
                },
                {
                    "name": "French Toast",
                    "description": "Classic cinnamon French toast",
                    "calories": 580.0,
                    "price": 10.99,
                },
            ],
        },
    ]

    for rest_data in restaurants_data:
        # Create restaurant
        restaurant = Restaurant(
            id=str(uuid4()),
            name=rest_data["name"],
            address=rest_data.get("address"),
            cuisine=rest_data.get("cuisine"),
            is_active=True,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        session.add(restaurant)

        # Create menu items for this restaurant
        for item_data in rest_data["menu_items"]:
            menu_item = MenuItem(
                id=str(uuid4()),
                restaurant_id=restaurant.id,
                name=item_data["name"],
                description=item_data.get("description"),
                calories=item_data.get("calories"),
                price=item_data.get("price"),
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )
            session.add(menu_item)

    session.commit()

    # Count results
    restaurant_count = session.query(Restaurant).count()
    menu_item_count = session.query(MenuItem).count()

    print(f"✅ Seeded {restaurant_count} restaurants with {menu_item_count} menu items")


def main():
    """Initialize the database."""
    print("Initializing database...")

    # Load environment variables
    load_dotenv()

    # Get database path
    db_path = get_database_path()

    # Check if database already exists
    if os.path.exists(db_path):
        print(f"Database already exists at: {db_path}")
        response = input("Do you want to recreate it? (y/N): ").strip().lower()
        if response in ["y", "yes"]:
            os.remove(db_path)
            print("Existing database removed.")
        else:
            print("Keeping existing database.")
            print("\nNext steps:")
            print("1. Run 'alembic upgrade head' to apply any migrations")
            print("2. Optionally seed data by running this script with --seed flag")
            print("3. Start your FastAPI application")
            return

    try:
        # Create the database file (empty)
        # Tables will be created by Alembic migrations
        print(f"Creating database file at: {db_path}")

        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

        # Create an empty database file
        import sqlite3

        conn = sqlite3.connect(db_path)
        conn.close()

        print("✅ Database file created successfully!")
        print(f"📁 Database location: {db_path}")
        print("\nNext steps:")
        print("1. Run 'alembic upgrade head' to apply any migrations")
        print("2. Optionally seed data by running this script with --seed flag")
        print("3. Start your FastAPI application")

    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)


def seed_data():
    """Seed the database with sample data."""
    print("Seeding database with sample data...")

    # Create engine and session
    engine = create_engine(DATABASE_URL)
    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_local()

    try:
        seed_restaurants(session)
        print("\n✅ Database seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        session.rollback()
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--seed":
        seed_data()
    else:
        main()
