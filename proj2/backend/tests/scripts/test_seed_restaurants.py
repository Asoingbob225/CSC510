"""Tests for restaurant seed script."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.eatsential.db.database import Base
from src.eatsential.models import MenuItem, Restaurant
from src.eatsential.scripts.seed_restaurants import init_restaurants


def test_seed_restaurants_creates_entries(tmp_path):
    """Seed script should create restaurants and menu items in a fresh DB."""
    db_file = tmp_path / "test_restaurants.db"
    db_url = f"sqlite:///{db_file}"

    # Run seed against temporary sqlite file
    init_restaurants(database_url=db_url)

    # Verify data exists
    engine = create_engine(db_url)
    session_local = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = session_local()
    try:
        restaurants = db.query(Restaurant).all()
        assert len(restaurants) >= 1
        # At least one menu item exists
        items = db.query(MenuItem).all()
        assert len(items) >= 1
    finally:
        db.close()
