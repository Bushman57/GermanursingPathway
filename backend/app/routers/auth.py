import hashlib
from collections.abc import Generator

import logging

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
    verify_magic_link,
    verify_otp_code,
)
from app.services.user_service import ensure_user_and_candidate, get_latest_lead

router = APIRouter(prefix="/api/auth", tags=["auth"])

logger = logging.getLogger(__name__)

GENERIC_OTP_MESSAGE = "A sign-in code has been sent to your email."
NOT_REGISTERED_OTP_MESSAGE = (
    "No account found for this email. Register your interest first, then sign in with the same address."
)
RATE_LIMIT_OTP_MESSAGE = "Too many code requests. Please wait an hour and try again."


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


class OtpRequestBody(BaseModel):
    email: EmailStr


class OtpRequestResponse(BaseModel):
    sent: bool
    message: str
    reason: str | None = None


class OtpVerifyBody(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class MagicLinkVerifyBody(BaseModel):
    token: str = Field(min_length=10, max_length=200)


def _client_ip_hash(request: Request, secret: str) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    ip = (forwarded.split(",")[0].strip() if forwarded else None) or (
        request.client.host if request.client else None
    )
    if not ip:
        return None
    return hashlib.sha256(f"{secret}:{ip}".encode()).hexdigest()


def _set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    samesite = settings.portal_cookie_samesite.lower()
    if samesite not in {"lax", "strict", "none"}:
        samesite = "lax"
    secure = settings.portal_cookie_secure or samesite == "none"
    response.set_cookie(
        key=settings.portal_cookie_name,
        value=token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )


def _clear_session_cookie(response: Response, settings: Settings) -> None:
    samesite = settings.portal_cookie_samesite.lower()
    if samesite not in {"lax", "strict", "none"}:
        samesite = "lax"
    secure = settings.portal_cookie_secure or samesite == "none"
    response.delete_cookie(
        key=settings.portal_cookie_name,
        path="/",
        httponly=True,
        secure=secure,
        samesite=samesite,
    )


def _complete_portal_sign_in(
    email: str,
    db: Session,
    response: Response,
    settings: Settings,
) -> dict[str, str]:
    profile = latest_lead_profile(db, email)
    if profile is None:
        raise HTTPException(status_code=403, detail="No registration found for this email")

    lead = get_latest_lead(db, email)
    if lead is not None:
        try:
            ensure_user_and_candidate(db, lead)
            db.commit()
        except Exception:
            logger.exception("Could not sync user/candidate for %s — sign-in continues", email)
            db.rollback()

    token = issue_portal_token(email, settings=settings)
    _set_session_cookie(response, token, settings)
    return {"message": "Signed in", "email": email, "fullName": profile["fullName"]}


@router.post("/otp/request", response_model=OtpRequestResponse)
def request_otp(
    body: OtpRequestBody,
    request: Request,
    db: Session = Depends(require_db),
    settings: Settings = Depends(get_settings),
) -> OtpRequestResponse:
    if not settings.portal_auth_configured:
        raise HTTPException(
            status_code=503,
            detail="Portal auth is not configured. Set JWT_SECRET in backend/.env",
        )

    ip_hash = _client_ip_hash(request, settings.jwt_secret)
    try:
        outcome = create_otp_challenge(db, str(body.email), ip_hash=ip_hash, settings=settings)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if outcome.sent:
        return OtpRequestResponse(sent=True, message=GENERIC_OTP_MESSAGE)
    if outcome.reason == "not_registered":
        return OtpRequestResponse(
            sent=False,
            reason="not_registered",
            message=NOT_REGISTERED_OTP_MESSAGE,
        )
    if outcome.reason == "rate_limited":
        return OtpRequestResponse(
            sent=False,
            reason="rate_limited",
            message=RATE_LIMIT_OTP_MESSAGE,
        )
    return OtpRequestResponse(sent=False, message=GENERIC_OTP_MESSAGE)


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

    return _complete_portal_sign_in(email, db, response, settings)


@router.post("/magic-link/verify")
def verify_magic_link_route(
    body: MagicLinkVerifyBody,
    response: Response,
    db: Session = Depends(require_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    if not settings.portal_auth_configured:
        raise HTTPException(
            status_code=503,
            detail="Portal auth is not configured. Set JWT_SECRET in backend/.env",
        )

    email = verify_magic_link(db, body.token, settings=settings)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid or expired sign-in link")

    return _complete_portal_sign_in(email, db, response, settings)


@router.post("/logout")
def logout(response: Response, settings: Settings = Depends(get_settings)) -> dict[str, str]:
    _clear_session_cookie(response, settings)
    return {"message": "Signed out"}


@router.get("/me")
def me(
    response: Response,
    user: PortalUser | None = Depends(optional_portal_user),
    db: Session = Depends(require_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str | bool]:
    if user is None:
        return {"authenticated": False}
    profile = latest_lead_profile(db, user.email)
    if profile is None:
        logger.warning("Session for %s has no matching lead — clearing cookie", user.email)
        _clear_session_cookie(response, settings)
        return {"authenticated": False}
    return {"authenticated": True, **profile}
