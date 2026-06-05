import hashlib
from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.deps.portal_auth import PortalUser, optional_portal_user, require_portal_user
from app.services.otp_service import (
    create_otp_challenge,
    issue_portal_token,
    latest_lead_profile,
    normalize_email,
    verify_otp_code,
)
from app.services.user_service import ensure_user_and_candidate, get_latest_lead

router = APIRouter(prefix="/api/auth", tags=["auth"])

GENERIC_OTP_MESSAGE = (
    "If this email is registered, you will receive a sign-in code shortly."
)


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


class OtpRequestBody(BaseModel):
    email: EmailStr


class OtpVerifyBody(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


def _client_ip_hash(request: Request, secret: str) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    ip = (forwarded.split(",")[0].strip() if forwarded else None) or (
        request.client.host if request.client else None
    )
    if not ip:
        return None
    return hashlib.sha256(f"{secret}:{ip}".encode()).hexdigest()


def _set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=settings.portal_cookie_name,
        value=token,
        httponly=True,
        secure=settings.portal_cookie_secure,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )


def _clear_session_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.portal_cookie_name,
        path="/",
        httponly=True,
        secure=settings.portal_cookie_secure,
        samesite="lax",
    )


@router.post("/otp/request")
def request_otp(
    body: OtpRequestBody,
    request: Request,
    db: Session = Depends(require_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    if not settings.portal_auth_configured:
        raise HTTPException(
            status_code=503,
            detail="Portal auth is not configured. Set JWT_SECRET in backend/.env",
        )

    ip_hash = _client_ip_hash(request, settings.jwt_secret)
    try:
        create_otp_challenge(db, str(body.email), ip_hash=ip_hash, settings=settings)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"message": GENERIC_OTP_MESSAGE}


@router.post("/otp/verify")
def verify_otp(
    body: OtpVerifyBody,
    response: Response,
    db: Session = Depends(require_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    if not settings.portal_auth_configured:
        raise HTTPException(
            status_code=503,
            detail="Portal auth is not configured. Set JWT_SECRET in backend/.env",
        )

    email = normalize_email(str(body.email))
    if not verify_otp_code(db, email, body.code, settings=settings):
        raise HTTPException(status_code=401, detail="Invalid or expired code")

    profile = latest_lead_profile(db, email)
    if profile is None:
        raise HTTPException(status_code=403, detail="No registration found for this email")

    lead = get_latest_lead(db, email)
    if lead is not None:
        ensure_user_and_candidate(db, lead)
        db.commit()

    token = issue_portal_token(email, settings=settings)
    _set_session_cookie(response, token, settings)
    return {"message": "Signed in", "email": email, "fullName": profile["fullName"]}


@router.post("/logout")
def logout(response: Response, settings: Settings = Depends(get_settings)) -> dict[str, str]:
    _clear_session_cookie(response, settings)
    return {"message": "Signed out"}


@router.get("/me")
def me(
    user: PortalUser | None = Depends(optional_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, str | bool]:
    if user is None:
        return {"authenticated": False}
    profile = latest_lead_profile(db, user.email)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"authenticated": True, **profile}
