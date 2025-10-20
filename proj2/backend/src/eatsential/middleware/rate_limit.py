"""
Rate limiting middleware implementation.
"""

import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import os


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent abuse
    """

    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, Tuple[int, float]] = {}
        self.rate_limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", "5"))
        self.window = 60  # 1 minute window

    async def dispatch(self, request: Request, call_next):
        """
        Process each request and apply rate limiting
        """
        # Skip rate limiting if in test mode
        if os.getenv("TEST_MODE") == "true":
            response = await call_next(request)
            return response

        # Only apply rate limiting to registration endpoint
        if request.url.path == "/api/auth/register":
            client_ip = request.client.host
            now = time.time()

            # Clean up old entries
            self._cleanup_old_requests(now)

            # Check if client has exceeded rate limit
            if self._is_rate_limited(client_ip, now):
                raise HTTPException(
                    status_code=429,
                    detail="Too many registration attempts. Please try again later.",
                )

            # Update request count for client
            self._update_request_count(client_ip, now)

        response = await call_next(request)
        return response

    def _cleanup_old_requests(self, now: float) -> None:
        """Remove requests outside the current window"""
        cutoff = now - self.window
        self.requests = {
            ip: (count, timestamp)
            for ip, (count, timestamp) in self.requests.items()
            if timestamp > cutoff
        }

    def _is_rate_limited(self, client_ip: str, now: float) -> bool:
        """Check if client has exceeded rate limit"""
        if client_ip in self.requests:
            count, timestamp = self.requests[client_ip]
            if now - timestamp < self.window and count >= self.rate_limit:
                return True
        return False

    def _update_request_count(self, client_ip: str, now: float) -> None:
        """Update the request count for a client"""
        if client_ip in self.requests:
            count, timestamp = self.requests[client_ip]
            if now - timestamp < self.window:
                self.requests[client_ip] = (count + 1, timestamp)
            else:
                self.requests[client_ip] = (1, now)
        else:
            self.requests[client_ip] = (1, now)
