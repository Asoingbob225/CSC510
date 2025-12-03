import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.eatsential.models import UserDB, AccountStatus
from src.eatsential.services.chat import ChatService
from src.eatsential.models.chat import ChatSession, ChatMessage

# Mock the GenAI Client
@pytest.fixture
def mock_genai_client():
    with patch("src.eatsential.services.chat.genai.Client") as MockClient:
        mock_instance = MockClient.return_value
        # Mock the generate_content method
        mock_response = MagicMock()
        mock_response.text = "This is a mock AI response."
        mock_instance.models.generate_content.return_value = mock_response
        yield mock_instance

@pytest.fixture
def authenticated_user(db: Session, client: TestClient):
    """Create a user and return authentication headers"""
    # Create user
    user = UserDB(
        id="test_user_id",
        email="chat_test@example.com",
        username="chattest",
        password_hash="hashed_password",
        account_status=AccountStatus.VERIFIED,
        email_verified=True
    )
    db.add(user)
    db.commit()
    return user

def test_chat_flow(client: TestClient, db: Session, authenticated_user, mock_genai_client):
    """Test the full chat flow: send message, get response, check history"""
    
    # Override get_current_user to return our test user
    from src.eatsential.services.auth_service import get_current_user
    app = client.app
    app.dependency_overrides[get_current_user] = lambda: authenticated_user

    # 1. Send a new message
    response = client.post(
        "/api/chat/",
        json={"message": "Hello AI"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["response"] == "This is a mock AI response."
    assert "session_id" in data
    session_id = data["session_id"]

    # 2. Verify session and messages in DB
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    assert session is not None
    assert session.user_id == authenticated_user.id
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    assert len(messages) == 2 # User message + AI response
    assert messages[0].role == "user"
    assert messages[0].content == "Hello AI"
    assert messages[1].role == "model"
    assert messages[1].content == "This is a mock AI response."

    # 3. Send another message in the same session
    response = client.post(
        "/api/chat/",
        json={"message": "Follow up question", "session_id": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id # Should be same session

    # 4. Get Sessions List
    response = client.get("/api/chat/sessions")
    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) == 1
    assert sessions[0]["id"] == session_id

    # 5. Get Specific Session History
    response = client.get(f"/api/chat/sessions/{session_id}")
    assert response.status_code == 200
    history = response.json()
    assert history["id"] == session_id
    assert len(history["messages"]) == 4 # 2 exchanges * 2 messages each

    # Clean up dependency override
    app.dependency_overrides = {}
