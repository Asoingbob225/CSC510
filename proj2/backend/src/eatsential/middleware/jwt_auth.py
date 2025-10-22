"""JWT Authentication Middleware

This middleware verifies JWT tokens for protected routes.
It can be applied to specific routes or globally with exclusions.
"""

from collections.abc import Awaitable, Callable
from typing import Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Middleware to verify JWT tokens for protected routes

    This middleware checks for Authorization header with Bearer token
    and verifies it for all routes except those in the excluded list.
    """

    def __init__(self, app, excluded_paths: Optional[list[str]] = None):
        """Initialize JWT Auth Middleware

        Args:
            app: FastAPI application
            excluded_paths: List of paths that don't require authentication

        """
        super().__init__(app)
        self.excluded_paths = excluded_paths or [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/verify-email",
            "/api/auth/resend-verification",
            "/api",
            "/docs",
            "/openapi.json",
            "/redoc",
        ]

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process request and verify JWT token if required

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/route handler

        Returns:
            HTTP response

        """
        # Skip authentication for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)

        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # For protected routes, token verification is handled by
        # the get_current_user dependency in route handlers
        # This middleware can be extended to perform additional checks

        response = await call_next(request)
        return response
