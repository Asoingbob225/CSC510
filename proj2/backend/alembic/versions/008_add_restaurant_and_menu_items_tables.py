"""add_restaurant_and_menu_items_tables

Revision ID: 008_add_restaurant_and_menu_items_tables
Revises: 007_add_mental_wellness_tables
Create Date: 2025-10-26 20:56:35.832514

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "008_add_restaurant_and_menu_items_tables"
down_revision: Union[str, Sequence[str], None] = "007_add_mental_wellness_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create restaurants table
    op.create_table(
        "restaurants",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("address", sa.String(length=300), nullable=True),
        sa.Column("cuisine", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_restaurants_name"), "restaurants", ["name"], unique=False)

    # Create menu_items table
    op.create_table(
        "menu_items",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("restaurant_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("calories", sa.Numeric(precision=7, scale=2), nullable=True),
        sa.Column("price", sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["restaurant_id"],
            ["restaurants.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop menu_items table
    op.drop_table("menu_items")

    # Drop restaurants table
    op.drop_index(op.f("ix_restaurants_name"), table_name="restaurants")
    op.drop_table("restaurants")
