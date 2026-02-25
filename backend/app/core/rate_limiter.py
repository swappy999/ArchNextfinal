"""
Rate Limiter — ArchNext Security Layer
========================================
IP-based and user-based rate limiting using slowapi.

OWASP: Protects against brute-force, credential stuffing,
and denial-of-service attacks on public endpoints.

Limits:
  - Auth endpoints (login/signup): 5/min per IP
  - Verification/resend: 3/min per IP
  - Public reads: 60/min per IP
  - Authenticated writes: 20/min per user
  - Prediction: 10/min per user
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import JSONResponse


def _get_key(request: Request) -> str:
    """
    Combined key function: use user identity from JWT if present,
    fall back to IP address for unauthenticated requests.
    """
    # Check for Authorization header → extract user identity
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        try:
            from jose import jwt
            from app.core.config import settings
            token = auth.split(" ", 1)[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Use email or wallet as the limiter key
            return payload.get("email") or payload.get("wallet_address") or get_remote_address(request)
        except Exception:
            pass
    return get_remote_address(request)


# ─── Limiter Instance ────────────────────────────────────────────────────────
# default_limits applies to any endpoint without an explicit decorator
limiter = Limiter(
    key_func=get_remote_address,        # default: IP-based
    default_limits=["60/minute"],       # generous default for all endpoints
    storage_uri="memory://",            # in-memory store (suitable for single-instance)
)


# ─── Rate Limit Strings ─────────────────────────────────────────────────────
# Use these as @limiter.limit("...") decorators on route handlers.

AUTH_LIMIT = "5/minute"          # login, signup, google-login, wallet endpoints
VERIFY_LIMIT = "3/minute"       # verify-email, resend-verification, forgot-password
WRITE_LIMIT = "20/minute"       # profile updates, preference changes
PREDICT_LIMIT = "10/minute"     # AI prediction requests


# ─── Custom 429 Handler ─────────────────────────────────────────────────────
# Returns a clean JSON response instead of plain text.

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    OWASP-compliant 429 handler.
    Returns JSON with Retry-After header so clients can back off.
    """
    # Extract retry-after from the exception detail
    retry_after = getattr(exc, "retry_after", 60)

    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded. Please try again later.",
            "retry_after_seconds": retry_after,
        },
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(exc.detail) if exc.detail else "unknown",
        },
    )
