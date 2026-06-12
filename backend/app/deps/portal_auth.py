from collections.abc import Generator

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.services.otp_service import decode_portal_token
from app.services.subscription_service import has_min_tier

_bearer = HTTPBearer(auto_error=False)


class PortalUser:
    def __init__(self, email: str) -> None:
        self.email = email


def _token_from_request(request: Request, settings: Settings) -> str | None:
    cookie = request.cookies.get(settings.portal_cookie_name)
    if cookie:
        return cookie
    return None


def resolve_portal_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
    settings: Settings,
) -> PortalUser | None:
    if not settings.portal_auth_configured:
        return None

    token = _token_from_request(request, settings)
    if token is None and credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials

    if not token:
        return None

    try:
        email = decode_portal_token(token, settings)
    except jwt.PyJWTError:
        return None

    return PortalUser(email=email)


def optional_portal_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> PortalUser | None:
    return resolve_portal_user(request, credentials, settings)


def require_portal_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> PortalUser:
    if not settings.portal_auth_configured:
        raise HTTPException(
            status_code=503,
            detail="Portal auth is not configured. Set JWT_SECRET and DATABASE_URL in backend/.env",
        )

    user = resolve_portal_user(request, credentials, settings)
    if user is None:
        token = _token_from_request(request, settings)
        if token:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        raise HTTPException(status_code=401, detail="Sign in required")

    return user


def _portal_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


def require_plus_subscription(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(_portal_db),
) -> PortalUser:
    if not has_min_tier(db, user.email, "plus"):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "Plus subscription required to access verified scholarship programs.",
                "upgradeTier": "plus",
                "pricingUrl": "/pricing",
            },
        )
    return user
