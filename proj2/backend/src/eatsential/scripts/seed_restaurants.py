"""Seed script for restaurants (package-aware copy)."""

from typing import Optional
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..db.database import DATABASE_URL, Base
from ..models import MenuItem, Restaurant

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
]


def init_restaurants(database_url: Optional[str] = None):
    """Initialize and seed restaurants into the configured database.

    This will create tables (if missing) and insert sample restaurants when they
    do not already exist.
    """
    if database_url is None:
        database_url = DATABASE_URL

    engine = create_engine(database_url)
    session_local = sessionmaker(bind=engine)
    db = session_local()

    try:
        Base.metadata.create_all(bind=engine)

        added = 0
        for rest in SAMPLE_RESTAURANTS:
            existing = (
                db.query(Restaurant).filter(Restaurant.name == rest["name"]).first()
            )
            if existing:
                continue

            r = Restaurant(
                id=str(uuid4()), name=rest["name"], cuisine=rest.get("cuisine")
            )
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
