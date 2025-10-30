"""Tests for the RecommendationService LLM integration."""

from __future__ import annotations

import json

import pytest
from sqlalchemy.orm import Session

from src.eatsential.models.models import MenuItem, Restaurant, UserDB
from src.eatsential.schemas.recommendation_schemas import RecommendationRequest
from src.eatsential.services.engine import RecommendationService


class _FakeModels:
    """Capture calls to the google-genai client and return a preset response."""

    def __init__(self, response) -> None:
        self._response = response
        self.calls: list[dict[str, object]] = []

    def generate_content(self, *, model, contents, config):
        self.calls.append({"model": model, "contents": contents, "config": config})
        return self._response


class _FakeClient:
    """Minimal stand-in for google.genai.Client."""

    def __init__(self, response) -> None:
        self.models = _FakeModels(response)


class _FakeResponse:
    """Emulate the google-genai response surface the engine expects."""

    def __init__(self, *, text: str | None = None, parsed=None) -> None:
        self.text = text
        self.parsed = parsed

    def model_dump(self):
        return {"text": self.text, "parsed": self.parsed}


def _build_user_and_items(db: Session) -> tuple[UserDB, list[MenuItem]]:
    user = UserDB(
        id="engine_user_1",
        email="engine@test.com",
        username="engineuser",
        password_hash="hashed",
        email_verified=True,
    )
    restaurant = Restaurant(
        id="engine_restaurant",
        name="Engine Diner",
        cuisine="Fusion",
        is_active=True,
    )
    db.add_all([user, restaurant])
    db.flush()

    items = [
        MenuItem(
            id="engine_item_one",
            restaurant_id=restaurant.id,
            name="Item One",
            description="Tasty option",
            calories=450.0,
            price=14.50,
        ),
        MenuItem(
            id="engine_item_two",
            restaurant_id=restaurant.id,
            name="Item Two",
            description="Backup option",
            calories=520.0,
            price=None,
        ),
    ]
    db.add_all(items)
    db.commit()
    return user, items


def test_llm_recommendations_returned(monkeypatch: pytest.MonkeyPatch, db: Session):
    """Ensure the service returns LLM-ranked items when Gemini responds."""
    user, items = _build_user_and_items(db)
    service = RecommendationService(
        db, llm_api_key="test-key", llm_model="gemini-test-model", max_results=2
    )

    response_payload = [
        {
            "item_id": items[0].id,
            "name": items[0].name,
            "score": 0.9,
            "explanation": "Top pick",
        },
        {
            "item_id": items[1].id,
            "name": items[1].name,
            "score": 0.6,
            "explanation": "Second choice",
        },
    ]
    fake_response = _FakeResponse(text=json.dumps(response_payload))
    fake_client = _FakeClient(fake_response)

    monkeypatch.setattr(
        RecommendationService, "_get_llm_client", lambda self: fake_client
    )

    result = service.get_meal_recommendations(
        user=user, request=RecommendationRequest(mode="llm")
    )

    assert [item.item_id for item in result.items] == [
        items[0].id,
        items[1].id,
    ]
    assert fake_client.models.calls, "LLM client should be invoked"
    call = fake_client.models.calls[0]
    assert call["model"] == "gemini-test-model"
    assert isinstance(call["contents"], list)
    assert call["contents"], "Prompt content should be provided"
    config = call["config"]
    assert getattr(config, "temperature", None) == pytest.approx(
        service.llm_temperature
    )


def test_llm_failure_falls_back_to_baseline(
    monkeypatch: pytest.MonkeyPatch, db: Session
):
    """Failure in the LLM layer should trigger the baseline fallback."""
    user, items = _build_user_and_items(db)
    service = RecommendationService(db, llm_api_key="test-key", max_results=1)

    class _FailingModels:
        def generate_content(self, *, model, contents, config):
            raise RuntimeError("LLM failure")

    class _FailingClient:
        def __init__(self) -> None:
            self.models = _FailingModels()

    monkeypatch.setattr(
        RecommendationService, "_get_llm_client", lambda self: _FailingClient()
    )

    result = service.get_meal_recommendations(
        user=user, request=RecommendationRequest(mode="llm")
    )

    assert len(result.items) == 1
    assert result.items[0].item_id == items[0].id
    assert result.items[0].name == items[0].name
    assert 0.0 <= result.items[0].score <= 1.0
