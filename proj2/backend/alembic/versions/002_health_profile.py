"""Add health profile tables

Revision ID: 002_health_profile
Revises: 001_initial
Create Date: 2025-10-22 14:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "002_health_profile"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create health profile related tables."""
    # Create health_profiles table
    op.create_table(
        "health_profiles",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("height_cm", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("weight_kg", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("activity_level", sa.String(), nullable=True),
        sa.Column("metabolic_rate", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    # Create allergen_database table
    op.create_table(
        "allergen_database",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column(
            "is_major_allergen", sa.Boolean(), nullable=False, server_default="0"
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # Create user_allergies table
    op.create_table(
        "user_allergies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("health_profile_id", sa.String(), nullable=False),
        sa.Column("allergen_id", sa.String(), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("diagnosed_date", sa.Date(), nullable=True),
        sa.Column("reaction_type", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["allergen_id"],
            ["allergen_database.id"],
        ),
        sa.ForeignKeyConstraint(
            ["health_profile_id"],
            ["health_profiles.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create dietary_preferences table
    op.create_table(
        "dietary_preferences",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("health_profile_id", sa.String(), nullable=False),
        sa.Column("preference_type", sa.String(length=50), nullable=False),
        sa.Column("preference_name", sa.String(length=100), nullable=False),
        sa.Column("is_strict", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("reason", sa.String(length=50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["health_profile_id"],
            ["health_profiles.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop health profile related tables."""
    # Drop tables in reverse order of creation (respecting foreign key constraints)
    op.drop_table("dietary_preferences")
    op.drop_table("user_allergies")
    op.drop_table("allergen_database")
    op.drop_table("health_profiles")
