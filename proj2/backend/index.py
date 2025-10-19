from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, ExampleTable

app = FastAPI()


@app.get("/api")
def read_root():
    return {"The server is running": "Hello World"}


@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    """Get all users from the database."""
    users = db.query(User).all()
    return {"users": [{"id": user.id, "username": user.username, "email": user.email} for user in users]}


@app.get("/api/example")
def get_examples(db: Session = Depends(get_db)):
    """Get all example records from the database."""
    examples = db.query(ExampleTable).all()
    return {"examples": [{"id": ex.id, "name": ex.name, "description": ex.description} for ex in examples]}
