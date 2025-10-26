"""Seed script for restaurants and menu items."""

import sys
from pathlib import Path
from typing import Optional
from uuid import uuid4

# Add project src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.eatsential.db.database import DATABASE_URL, Base
from src.eatsential.models.restaurant import Restaurant, MenuItem


SAMPLE_RESTAURANTS = [
    {
        "name": "Green Bowl",
        "cuisine": "Healthy",
        "menu": [
            {"name": "Quinoa Salad", "calories": 420.5, "price": 9.5},
            {"name": "Grilled Tofu", "calories": 350, "price": 10.0},
            {"name": "Kale Smoothie", "calories": 280, "price": 5.5},
        ],
    },
    {
        "name": "Sunny Sushi",
        "cuisine": "Japanese",
        "menu": [
            {"name": "Salmon Roll", "calories": 320, "price": 8.5},
            {"name": "Veg Roll", "calories": 250, "price": 7.0},
        ],
    },
    {
        "name": "Pasta House",
        "cuisine": "Italian",
        "menu": [
            {"name": "Tomato Basil Pasta", "calories": 650, "price": 12.0},
            {"name": "Pesto Penne", "calories": 700, "price": 13.0},
        ],
    },
    {
        "name": "Spice Route",
        "cuisine": "Indian",
        "menu": [
            {"name": "Chickpea Curry", "calories": 520, "price": 11.0},
            {"name": "Saag Paneer", "calories": 610, "price": 12.5},
        ],
    },
    {
        "name": "Taco Corner",
        "cuisine": "Mexican",
        "menu": [
            {"name": "Chicken Taco", "calories": 430, "price": 3.5},
            {"name": "Fish Taco", "calories": 390, "price": 4.0},
        ],
    },
]


def init_restaurants(database_url: Optional[str] = None):
    if database_url is None:
        database_url = DATABASE_URL

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        Base.metadata.create_all(bind=engine)

        added = 0
        for rest in SAMPLE_RESTAURANTS:
            existing = db.query(Restaurant).filter(Restaurant.name == rest["name"]).first()
            if existing:
                continue

            r = Restaurant(id=str(uuid4()), name=rest["name"], cuisine=rest.get("cuisine"))
            db.add(r)
            db.flush()

            for item in rest.get("menu", []):
                mi = MenuItem(
                    id=str(uuid4()),
                    restaurant_id=r.id,
                    name=item["name"],
                    calories=item.get("calories"),
                    price=item.get("price"),
                )
                db.add(mi)
            added += 1

        db.commit()
        print(f"Inserted {added} restaurants (seed).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_restaurants()
