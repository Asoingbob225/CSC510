"""Test for the /api endpoint of FastAPI backend.
"""

from fastapi.testclient import TestClient

from src.eatsential.index import app

client = TestClient(app)


def test_api_endpoint():
    """Test the /api endpoint returns correct response."""
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {"The server is running": "Hello World"}
