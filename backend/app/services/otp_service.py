import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Lead, OtpChallenge
from app.services.otp_email import send_otp_email

PORTAL_JWT_AUD = "portal"
logger = logging.getLogger(__name__)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_otp_code(code: str, secret: str) -> str:
    return hashlib.sha256(f"{secret}:{code}".encode()).hexdigest()


def lead_exists(db: Session, email: str) -> bool:
    return (
        db.query(Lead.id).filter(func.lower(Lead.email) == normalize_email(email)).first() is not None
    )


def recent_request_count(db: Session, email: str, settings: Settings) -> int:
    since = datetime.now(timezone.utc) - timedelta(hours=1)
    return (
        db.query(OtpChallenge)
        .filter(
            OtpChallenge.email == normalize_email(email),
            OtpChallenge.created_at >= since,
        )
        .count()
    )


def create_otp_challenge(
    db: Session,
    email: str,
    *,
    ip_hash: str | None = None,
    settings: Settings | None = None,
) -> str | None:
    """Create challenge and send email. Returns plaintext code if sent, else None."""
    settings = settings or get_settings()
    normalized = normalize_email(email)
    if not lead_exists(db, normalized):
        logger.info(
            "OTP not sent for %s — no matching registration. User must register first with this exact email.",
            normalized,
        )
        return None

    if recent_request_count(db, normalized, settings) >= settings.otp_requests_per_hour:
        logger.warning("OTP rate limit reached for %s", normalized)
        return None

    code = f"{secrets.randbelow(1_000_000):06d}"
    now = datetime.now(timezone.utc)
    challenge = OtpChallenge(
        id=uuid.uuid4(),
        email=normalized,
        code_hash=hash_otp_code(code, settings.jwt_secret),
        expires_at=now + timedelta(minutes=settings.otp_expire_minutes),
        ip_hash=ip_hash,
    )
    db.add(challenge)
    try:
        send_otp_email(to_email=normalized, code=code, settings=settings)
    except Exception:
        db.rollback()
        raise
    db.commit()
    return code


def verify_otp_code(
    db: Session,
    email: str,
    code: str,
    *,
    settings: Settings | None = None,
) -> bool:
    settings = settings or get_settings()
    normalized = normalize_email(email)
    now = datetime.now(timezone.utc)

    challenge = (
        db.query(OtpChallenge)
        .filter(
            OtpChallenge.email == normalized,
            OtpChallenge.consumed_at.is_(None),
            OtpChallenge.expires_at > now,
        )
        .order_by(OtpChallenge.created_at.desc())
        .first()
    )
    if challenge is None:
        return False

    if challenge.attempts >= settings.otp_max_attempts:
        return False

    expected = hash_otp_code(code.strip(), settings.jwt_secret)
    if secrets.compare_digest(challenge.code_hash, expected):
        challenge.consumed_at = now
        db.commit()
        return True

    challenge.attempts += 1
    db.commit()
    return False


def issue_portal_token(email: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": normalize_email(email),
        "aud": PORTAL_JWT_AUD,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.jwt_expire_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_portal_token(token: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=["HS256"],
        audience=PORTAL_JWT_AUD,
    )
    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub:
        raise jwt.InvalidTokenError("missing sub")
    return normalize_email(sub)


def latest_lead_profile(db: Session, email: str) -> dict[str, str] | None:
    row = (
        db.query(Lead)
        .filter(func.lower(Lead.email) == normalize_email(email))
        .order_by(Lead.created_at.desc())
        .first()
    )
    if row is None:
        return None
    return {"email": normalize_email(row.email), "fullName": row.full_name.strip()}
