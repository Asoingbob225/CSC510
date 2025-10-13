"""
Tests for the main FastAPI application.
Tests application initialization and basic functionality.
"""

from index import app


def test_app_import():
    """Test that the FastAPI app can be imported without errors."""
    assert app is not None
    assert hasattr(app, "get")
    assert hasattr(app, "post")


def test_app_instance():
    """Test that app is a valid FastAPI instance."""
    from fastapi import FastAPI

    assert isinstance(app, FastAPI)


def test_app_has_routes():
    """Test that the app has routes configured."""
    assert len(app.routes) > 0
