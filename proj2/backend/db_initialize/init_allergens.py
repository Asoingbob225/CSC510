"""Initialize allergen database with predefined allergens.

This script populates the allergen_database table with FDA Big 9 Major Allergens
and other common food allergens.
"""

import sys
from pathlib import Path
from typing import Optional
from uuid import uuid4

# Add src directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..src.eatsential.db.database import DATABASE_URL, Base
from ..src.eatsential.models.models import AllergenDB

# FDA Big 9 Major Allergens + Common Food Allergens
ALLERGEN_DATA = [
    # FDA Big 9 Major Allergens
    {
        "name": "milk",
        "category": "dairy",
        "is_major_allergen": True,
        "description": (
            "FDA Big 9 Major Allergen - Dairy products containing milk proteins"
        ),
    },
    {
        "name": "eggs",
        "category": "animal_product",
        "is_major_allergen": True,
        "description": (
            "FDA Big 9 Major Allergen - Chicken eggs and egg-containing products"
        ),
    },
    {
        "name": "fish",
        "category": "seafood",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Finned fish species",
    },
    {
        "name": "shellfish",
        "category": "seafood",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Crustaceans and mollusks",
    },
    {
        "name": "tree nuts",
        "category": "nuts",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Tree-grown nuts (excludes peanuts)",
    },
    {
        "name": "peanuts",
        "category": "legume",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Ground nuts (legume family)",
    },
    {
        "name": "wheat",
        "category": "grain",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Wheat and wheat-containing products",
    },
    {
        "name": "soybeans",
        "category": "legume",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Soybeans and soy-derived products",
    },
    {
        "name": "sesame",
        "category": "seed",
        "is_major_allergen": True,
        "description": "FDA Big 9 Major Allergen - Sesame seeds and sesame oil",
    },
    # Specific tree nuts
    {
        "name": "almonds",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Almond nuts from Prunus dulcis",
    },
    {
        "name": "walnuts",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Walnuts from Juglans genus",
    },
    {
        "name": "cashews",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Cashew nuts from Anacardium occidentale",
    },
    {
        "name": "pistachios",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Pistachio nuts from Pistacia vera",
    },
    {
        "name": "pecans",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Pecan nuts from Carya illinoinensis",
    },
    {
        "name": "hazelnuts",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Hazelnuts (filberts) from Corylus genus",
    },
    {
        "name": "macadamia nuts",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Macadamia nuts from Macadamia genus",
    },
    {
        "name": "brazil nuts",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Brazil nuts from Bertholletia excelsa",
    },
    {
        "name": "pine nuts",
        "category": "nuts",
        "is_major_allergen": False,
        "description": "Tree nut - Pine nuts from pine tree cones",
    },
    # Specific shellfish
    {
        "name": "shrimp",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Crustacean shellfish - Shrimp and prawns",
    },
    {
        "name": "crab",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Crustacean shellfish - Crab species",
    },
    {
        "name": "lobster",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Crustacean shellfish - Lobster species",
    },
    {
        "name": "clams",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Mollusk shellfish - Clam species",
    },
    {
        "name": "oysters",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Mollusk shellfish - Oyster species",
    },
    {
        "name": "mussels",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Mollusk shellfish - Mussel species",
    },
    {
        "name": "scallops",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Mollusk shellfish - Scallop species",
    },
    # Specific fish
    {
        "name": "salmon",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Finned fish - Salmon species",
    },
    {
        "name": "tuna",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Finned fish - Tuna species",
    },
    {
        "name": "cod",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Finned fish - Cod species",
    },
    {
        "name": "halibut",
        "category": "seafood",
        "is_major_allergen": False,
        "description": "Finned fish - Halibut species",
    },
    # Other common allergens
    {
        "name": "gluten",
        "category": "protein",
        "is_major_allergen": False,
        "description": "Protein composite found in wheat and related grains",
    },
    {
        "name": "lactose",
        "category": "dairy",
        "is_major_allergen": False,
        "description": "Milk sugar found in dairy products",
    },
    {
        "name": "corn",
        "category": "grain",
        "is_major_allergen": False,
        "description": "Corn/maize and corn-derived products",
    },
    {
        "name": "soy",
        "category": "legume",
        "is_major_allergen": False,
        "description": "Soy products (alternative name for soybeans)",
    },
    {
        "name": "mustard",
        "category": "seed",
        "is_major_allergen": False,
        "description": "Mustard seeds and mustard-containing products",
    },
    {
        "name": "celery",
        "category": "vegetable",
        "is_major_allergen": False,
        "description": "Celery and celeriac (celery root)",
    },
    {
        "name": "lupin",
        "category": "legume",
        "is_major_allergen": False,
        "description": "Lupin beans and lupin flour",
    },
    {
        "name": "sulfites",
        "category": "additive",
        "is_major_allergen": False,
        "description": "Sulfur dioxide and sulfite preservatives",
    },
    {
        "name": "nitrates",
        "category": "additive",
        "is_major_allergen": False,
        "description": "Nitrate and nitrite preservatives",
    },
]


def init_allergens(database_url: Optional[str] = None):
    """Initialize allergen database with predefined allergens.

    Args:
        database_url: Database connection URL. If None, uses default from config.

    """
    # Get database URL
    if database_url is None:
        database_url = DATABASE_URL

    # Create engine and session
    engine = create_engine(database_url)
    session_local = sessionmaker(bind=engine)
    db = session_local()

    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        added_count = 0
        skipped_count = 0

        print("Starting allergen initialization...")
        print(f"Total allergens to process: {len(ALLERGEN_DATA)}\n")

        for allergen_data in ALLERGEN_DATA:
            # Check if allergen already exists
            existing = (
                db.query(AllergenDB)
                .filter(AllergenDB.name == allergen_data["name"])
                .first()
            )

            if existing:
                print(f"⏭️  Skipped: '{allergen_data['name']}' (already exists)")
                skipped_count += 1
                continue

            # Create new allergen
            allergen = AllergenDB(
                id=str(uuid4()),
                name=allergen_data["name"],
                category=allergen_data["category"],
                is_major_allergen=allergen_data["is_major_allergen"],
                description=allergen_data["description"],
            )

            db.add(allergen)
            major_marker = "🔴" if allergen_data["is_major_allergen"] else "⚪"
            print(
                f"{major_marker} Added: '{allergen_data['name']}' "
                f"({allergen_data['category']})"
            )
            added_count += 1

        # Commit all changes
        db.commit()

        print(f"\n{'=' * 60}")
        print("✅ Allergen initialization complete!")
        print(f"   - Added: {added_count} allergens")
        print(f"   - Skipped: {skipped_count} allergens (already existed)")
        print(f"   - Total in database: {added_count + skipped_count}")
        print(f"{'=' * 60}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during initialization: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_allergens()
