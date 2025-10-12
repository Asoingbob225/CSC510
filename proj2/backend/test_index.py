from fastapi.testclient import TestClient
from index import app

client = TestClient(app)


def test_read_root():
    """Test the root endpoint"""
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {"The server is running": "Hello World"}
