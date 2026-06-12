import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import ChatUsage, Subscription
from app.services.otp_service import normalize_email

SubscriptionTier = Literal["essential", "plus", "premium"]

TIER_RANK: dict[str, int] = {
    "essential": 1,
    "plus": 2,
    "premium": 3,
}

SUBSCRIPTION_PAYMENT_PURPOSES = {
    "subscription_essential": "essential",
    "subscription_plus": "plus",
    "subscription_premium": "premium",
}


def tier_from_payment_purpose(purpose: str) -> str | None:
    return SUBSCRIPTION_PAYMENT_PURPOSES.get(purpose)


def purpose_for_tier(tier: str) -> str:
    mapping = {
        "essential": "subscription_essential",
        "plus": "subscription_plus",
        "premium": "subscription_premium",
    }
    if tier not in mapping:
        raise ValueError(f"Unknown subscription tier: {tier}")
    return mapping[tier]


def get_active_subscription(db: Session, email: str) -> Subscription | None:
    normalized = normalize_email(email)
    now = datetime.now(timezone.utc)
    return (
        db.query(Subscription)
        .filter(
            func.lower(Subscription.email) == normalized,
            Subscription.status == "active",
            Subscription.expires_at > now,
        )
        .order_by(Subscription.expires_at.desc())
        .first()
    )


def has_min_tier(db: Session, email: str, min_tier: SubscriptionTier) -> bool:
    sub = get_active_subscription(db, email)
    if sub is None:
        return False
    return TIER_RANK.get(sub.tier, 0) >= TIER_RANK[min_tier]


def grant_subscription(
    db: Session,
    email: str,
    tier: str,
    payment_id: uuid.UUID,
    *,
    settings: Settings | None = None,
) -> Subscription:
    settings = settings or get_settings()
    normalized = normalize_email(email)
    now = datetime.now(timezone.utc)
    term = timedelta(days=settings.subscription_term_days)

    existing = get_active_subscription(db, normalized)
    if existing is not None:
        new_rank = TIER_RANK.get(tier, 0)
        current_rank = TIER_RANK.get(existing.tier, 0)
        if new_rank >= current_rank:
            existing.tier = tier
        base = existing.expires_at if existing.expires_at > now else now
        existing.expires_at = base + term
        existing.payment_id = payment_id
        db.flush()
        return existing

    starts_at = now
    sub = Subscription(
        id=uuid.uuid4(),
        email=normalized,
        tier=tier,
        status="active",
        starts_at=starts_at,
        expires_at=starts_at + term,
        payment_id=payment_id,
    )
    db.add(sub)
    db.flush()
    return sub


def subscription_status_dict(db: Session, email: str, *, settings: Settings | None = None) -> dict:
    settings = settings or get_settings()
    sub = get_active_subscription(db, email)
    now = datetime.now(timezone.utc)
    if sub is None:
        return {
            "active": False,
            "tier": None,
            "expiresAt": None,
            "daysRemaining": 0,
            "features": {
                "pathwayChat": False,
                "resources": False,
                "scholarships": False,
                "scholarshipChat": False,
                "cvRevamp": False,
            },
            "freeTrialTurnsRemaining": max(
                0,
                settings.pathway_chat_free_trial_turns - get_chat_user_turns(db, email, "pathway", None),
            ),
        }

    days_remaining = max(0, (sub.expires_at - now).days)
    tier = sub.tier
    rank = TIER_RANK.get(tier, 0)
    return {
        "active": True,
        "tier": tier,
        "expiresAt": sub.expires_at.isoformat(),
        "daysRemaining": days_remaining,
        "features": {
            "pathwayChat": rank >= TIER_RANK["essential"],
            "resources": rank >= TIER_RANK["essential"],
            "scholarships": rank >= TIER_RANK["plus"],
            "scholarshipChat": rank >= TIER_RANK["plus"],
            "cvRevamp": rank >= TIER_RANK["premium"],
        },
        "freeTrialTurnsRemaining": 0,
    }


def chat_scope_key(email: str | None, session_id: str | None) -> str | None:
    if email:
        return f"email:{normalize_email(email)}"
    if session_id and session_id.strip():
        return f"session:{session_id.strip()[:64]}"
    return None


def get_chat_user_turns(
    db: Session,
    email: str | None,
    mode: str,
    session_id: str | None,
) -> int:
    key = chat_scope_key(email, session_id)
    if key is None:
        return 0
    row = (
        db.query(ChatUsage)
        .filter(ChatUsage.scope_key == key, ChatUsage.mode == mode)
        .first()
    )
    return row.user_turns if row else 0


def increment_chat_user_turns(
    db: Session,
    email: str | None,
    mode: str,
    session_id: str | None,
) -> int:
    key = chat_scope_key(email, session_id)
    if key is None:
        return 0
    row = (
        db.query(ChatUsage)
        .filter(ChatUsage.scope_key == key, ChatUsage.mode == mode)
        .first()
    )
    if row is None:
        row = ChatUsage(id=uuid.uuid4(), scope_key=key, mode=mode, user_turns=1)
        db.add(row)
    else:
        row.user_turns += 1
    db.flush()
    return row.user_turns


def can_use_pathway_chat(
    db: Session,
    email: str | None,
    session_id: str | None,
    *,
    settings: Settings | None = None,
) -> tuple[bool, str | None]:
    settings = settings or get_settings()
    if email and has_min_tier(db, email, "essential"):
        return True, None
    turns = get_chat_user_turns(db, email, "pathway", session_id)
    if turns < settings.pathway_chat_free_trial_turns:
        return True, None
    return False, "essential"


def can_use_scholarship_chat(db: Session, email: str | None) -> tuple[bool, str | None]:
    if not email:
        return False, "plus"
    if has_min_tier(db, email, "plus"):
        return True, None
    return False, "plus"
