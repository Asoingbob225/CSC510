from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .middleware.jwt_auth import JWTAuthMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .routers import auth, users

app = FastAPI()

# Configure Rate Limiting
app.add_middleware(RateLimitMiddleware)

# Configure JWT Authentication
app.add_middleware(JWTAuthMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend development server
        "https://eatsential.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/api")
def read_root():
    """Health check endpoint"""
    return {"The server is running": "Hello World"}
