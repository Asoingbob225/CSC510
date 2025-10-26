"""Add meal and meal_food_items tables

Revision ID: 004_add_meal_tables
Revises: 003_add_user_role
Create Date: 2025-10-26 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "004_add_meal_tables"
down_revision = "003_add_user_role"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add meals and meal_food_items tables."""
    # Create meals table
    op.create_table(
        "meals",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("meal_type", sa.String(length=20), nullable=False),
        sa.Column("meal_time", sa.DateTime(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("total_calories", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("total_protein_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("total_carbs_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("total_fat_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_meals_user_id"), "meals", ["user_id"], unique=False)
    op.create_index(op.f("ix_meals_meal_type"), "meals", ["meal_type"], unique=False)
    op.create_index(op.f("ix_meals_meal_time"), "meals", ["meal_time"], unique=False)

    # Create meal_food_items table
    op.create_table(
        "meal_food_items",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("meal_id", sa.String(), nullable=False),
        sa.Column("food_name", sa.String(length=200), nullable=False),
        sa.Column("portion_size", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("portion_unit", sa.String(length=20), nullable=False),
        sa.Column("calories", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("protein_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("carbs_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("fat_g", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["meal_id"],
            ["meals.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_meal_food_items_meal_id"),
        "meal_food_items",
        ["meal_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove meals and meal_food_items tables."""
    # Drop meal_food_items table
    op.drop_index(op.f("ix_meal_food_items_meal_id"), table_name="meal_food_items")
    op.drop_table("meal_food_items")

    # Drop meals table
    op.drop_index(op.f("ix_meals_meal_time"), table_name="meals")
    op.drop_index(op.f("ix_meals_meal_type"), table_name="meals")
    op.drop_index(op.f("ix_meals_user_id"), table_name="meals")
    op.drop_table("meals")
