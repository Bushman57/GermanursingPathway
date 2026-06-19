import hashlib
import hmac
import logging
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Literal
from urllib.parse import urlparse

import jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Lead, OtpChallenge
from app.services.otp_email import send_otp_email

PORTAL_JWT_AUD = "portal"
logger = logging.getLogger(__name__)

OtpRequestReason = str  # "not_registered" | "rate_limited"

MagicLinkFailureReason = Literal["invalid", "expired", "already_used"]


@dataclass(frozen=True)
class MagicLinkVerifyResult:
    email: str | None = None
    reason: MagicLinkFailureReason | None = None

    @property
    def success(self) -> bool:
        return self.email is not None


class OtpRequestResult:
    __slots__ = ("sent", "reason")

    def __init__(self, *, sent: bool, reason: OtpRequestReason | None = None) -> None:
        self.sent = sent
        self.reason = reason


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_otp_code(code: str, secret: str) -> str:
    return hashlib.sha256(f"{secret}:{code}".encode()).hexdigest()


def build_magic_link_token(challenge_id: uuid.UUID, settings: Settings) -> str:
    msg = str(challenge_id)
    sig = hmac.new(settings.jwt_secret.encode(), msg.encode(), hashlib.sha256).hexdigest()[:32]
    return f"{msg}.{sig}"


def build_magic_link_url(challenge_id: uuid.UUID, settings: Settings) -> str:
    base = settings.public_site_url.strip().rstrip("/") or "http://localhost:8080"
    token = build_magic_link_token(challenge_id, settings)
    return f"{base}/portal/auth/verify?token={token}"


def autofill_domain(settings: Settings) -> str:
    raw = settings.public_site_url.strip()
    if not raw:
        return "germanursingpathway.com"
    host = urlparse(raw).netloc or raw
    return host.removeprefix("www.")


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
) -> OtpRequestResult:
    """Create challenge and send email when the address is registered."""
    settings = settings or get_settings()
    normalized = normalize_email(email)
    if not lead_exists(db, normalized):
        logger.info(
            "OTP not sent for %s — no matching registration. User must register first with this exact email.",
            normalized,
        )
        return OtpRequestResult(sent=False, reason="not_registered")

    if recent_request_count(db, normalized, settings) >= settings.otp_requests_per_hour:
        logger.warning("OTP rate limit reached for %s", normalized)
        return OtpRequestResult(sent=False, reason="rate_limited")

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
    db.flush()
    try:
        send_otp_email(
            to_email=normalized,
            code=code,
            magic_link_url=build_magic_link_url(challenge.id, settings),
            autofill_domain=autofill_domain(settings),
            settings=settings,
        )
    except Exception:
        db.rollback()
        raise
    db.commit()
    return OtpRequestResult(sent=True)


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
    normalized_code = code.strip()

    challenges = (
        db.query(OtpChallenge)
        .filter(
            OtpChallenge.email == normalized,
            OtpChallenge.consumed_at.is_(None),
            OtpChallenge.expires_at > now,
        )
        .order_by(OtpChallenge.created_at.desc())
        .all()
    )
    if not challenges:
        return False

    expected = hash_otp_code(normalized_code, settings.jwt_secret)
    for challenge in challenges:
        if challenge.attempts >= settings.otp_max_attempts:
            continue
        if secrets.compare_digest(challenge.code_hash, expected):
            challenge.consumed_at = now
            db.commit()
            return True

    latest = challenges[0]
    if latest.attempts < settings.otp_max_attempts:
        latest.attempts += 1
        db.commit()
    return False


def verify_magic_link(
    db: Session,
    token: str,
    *,
    settings: Settings | None = None,
) -> MagicLinkVerifyResult:
    settings = settings or get_settings()
    parts = token.strip().split(".", 1)
    if len(parts) != 2:
        return MagicLinkVerifyResult(reason="invalid")
    challenge_id_raw, sig = parts
    try:
        challenge_id = uuid.UUID(challenge_id_raw)
    except ValueError:
        return MagicLinkVerifyResult(reason="invalid")

    expected_sig = hmac.new(
        settings.jwt_secret.encode(),
        challenge_id_raw.encode(),
        hashlib.sha256,
    ).hexdigest()[:32]
    if not secrets.compare_digest(sig, expected_sig):
        return MagicLinkVerifyResult(reason="invalid")

    now = datetime.now(timezone.utc)
    challenge = db.get(OtpChallenge, challenge_id)
    if challenge is None:
        return MagicLinkVerifyResult(reason="invalid")
    if challenge.consumed_at is not None:
        return MagicLinkVerifyResult(reason="already_used")
    if challenge.expires_at <= now:
        return MagicLinkVerifyResult(reason="expired")

    challenge.consumed_at = now
    db.commit()
    return MagicLinkVerifyResult(email=normalize_email(challenge.email))


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
