from fastapi import FastAPI

from .auth import router as auth_router

app = FastAPI()


@app.get("/api")
def read_root():
    return {"The server is running": "Hello World"}


app.include_router(auth_router, prefix="/api/auth")
