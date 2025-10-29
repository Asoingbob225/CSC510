from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, validator
from passlib.hash import bcrypt
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
import re

try:
    from .models import User, get_session
    from .emailer import send_verification_email
except Exception:
    from models import User, get_session
    from emailer import send_verification_email

router = APIRouter()


class RegisterIn(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator("username")
    def username_valid(cls, v):
        if not re.match(r"^[A-Za-z0-9_]{3,20}$", v):
            raise ValueError("username must be 3-20 characters and alphanumeric/_ only")
        return v

    @validator("password")
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        if not re.search(r"[A-Z]", v) or not re.search(r"[a-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("password must include upper, lower and digit")
        return v


class RegisterOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    message: str


@router.post("/register", response_model=RegisterOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn):
    # validate email
    try:
        validate_email(payload.email)
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail={"error": "invalid_input", "message": str(e)})

    session = get_session()
    # unique checks
    existing = session.exec("SELECT * FROM user WHERE email = :email", {"email": payload.email}).first()
    # fallback to SQLModel query
    if not existing:
        existing = session.exec(
            "SELECT * FROM user WHERE username = :username", {"username": payload.username}
        ).first()

    # simple uniqueness enforcement - in real app rely on DB constraints
    # check email
    q = session.exec(session.query(User).filter(User.email == payload.email))
    if q.first():
        raise HTTPException(status_code=409, detail={"error": "conflict", "field": "email", "message": "Email already registered"})
    q2 = session.exec(session.query(User).filter(User.username == payload.username))
    if q2.first():
        raise HTTPException(status_code=409, detail={"error": "conflict", "field": "username", "message": "Username already registered"})

    # hash password
    ph = bcrypt.hash(payload.password)

    user = User(email=payload.email, username=payload.username, password_hash=ph, email_verified=False)
    # verification token (for demo store clear token)
    token = bcrypt.hash(f"{payload.email}{datetime.utcnow().isoformat()}")
    user.verification_token = token
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)

    session.add(user)
    session.commit()
    session.refresh(user)

    send_verification_email(user.email, user.username, "dummy-token-for-demo")

    return {"id": user.id, "username": user.username, "email": user.email, "message": "Verification email sent"}
