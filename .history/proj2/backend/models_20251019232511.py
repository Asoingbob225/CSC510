from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session, select
import os


def get_engine():
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    return create_engine(DATABASE_URL, echo=False)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    username: str = Field(index=True, nullable=False, unique=True, max_length=20)
    password_hash: str
    email_verified: bool = False
    verification_token: Optional[str] = None
    verification_token_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


def init_db():
    engine = get_engine()
    SQLModel.metadata.create_all(engine)


def get_session():
    engine = get_engine()
    return Session(engine)
