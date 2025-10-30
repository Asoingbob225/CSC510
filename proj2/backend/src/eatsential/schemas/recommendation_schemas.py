"""Schemas for recommendation endpoints.

These models capture request filters, control which recommendation engine
mode runs (baseline vs LLM), and define the response payload delivered
to the frontend consumers of the recommendation API.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class RecommendationFilters(BaseModel):
    """Optional filters provided by the client to refine recommendations."""

    diet: list[str] | None = Field(
        default=None, description="Dietary labels to include such as 'vegan'."
    )
    cuisine: list[str] | None = Field(
        default=None, description="Preferred cuisines such as 'italian'."
    )
    price_range: str | None = Field(
        default=None,
        description="Desired price range (e.g. '$', '$$', '$$$').",
    )


class RecommendationRequest(BaseModel):
    """Request body accepted by the recommendation endpoints."""

    filters: RecommendationFilters | None = None
    mode: Literal["llm", "baseline"] | None = Field(
        default="llm",
        description="Determines which ranking engine to use.",
    )


class RecommendedItem(BaseModel):
    """Single recommended menu item or restaurant with explanation."""

    model_config = ConfigDict(from_attributes=True)

    item_id: str
    name: str
    score: float = Field(ge=0.0, le=1.0)
    explanation: str


class RecommendationResponse(BaseModel):
    """Response payload returned by the recommendation endpoints."""

    items: list[RecommendedItem]
