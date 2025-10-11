"""
Simple tests for the FastAPI backend.
"""

from fastapi.testclient import TestClient
from index import app


def test_api_with_test_client():
    """Test the API endpoint using FastAPI TestClient."""
    client = TestClient(app)
    response = client.get("/api")
    assert response.status_code == 200
    assert "The server is running" in response.json()
    assert response.json()["The server is running"] == "Hello World"


def test_app_import():
    """Test that the FastAPI app can be imported without errors."""
    from index import app

    assert app is not None
    assert hasattr(app, "get")


if __name__ == "__main__":
    # Run tests manually
    print("Running backend tests...")
    try:
        test_api_with_test_client()
        print("✅ API test client test passed")
    except Exception as e:
        print(f"❌ API test client test failed: {e}")
        exit(1)

    try:
        test_app_import()
        print("✅ App import test passed")
    except Exception as e:
        print(f"❌ App import test failed: {e}")
        exit(1)

    print("All tests passed!")
