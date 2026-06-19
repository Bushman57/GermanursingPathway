from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.session import get_db
from app.payments.constants import (
    PAYMENT_PURPOSE_LEARNING_HUB,
    SUBSCRIPTION_PURPOSES,
)


def optional_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


def require_payment_config(purpose: str, settings: Settings) -> None:
    if purpose in SUBSCRIPTION_PURPOSES:
        if not settings.subscriptions_enabled:
            raise HTTPException(
                status_code=503,
                detail="Subscriptions are disabled. Set SUBSCRIPTIONS_ENABLED=true to enable checkout.",
            )
        if not settings.subscription_payments_configured:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Subscription payments are not configured. Set PAYSTACK keys and "
                    "SUBSCRIPTION_*_KES amounts in backend/.env"
                ),
            )
        return
    if purpose == PAYMENT_PURPOSE_LEARNING_HUB:
        if not settings.learning_hub_payments_configured:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Learning Hub payments are not configured. Set PAYSTACK keys and "
                    "LEARNING_HUB_AMOUNT_KES in backend/.env"
                ),
            )
        return
    if not settings.paystack_payments_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "Paystack payments are not configured. Set PAYSTACK_SECRET_KEY, "
                "PAYSTACK_PUBLIC_KEY, PAYSTACK_CALLBACK_BASE_URL, and PAYMENT_AMOUNT_KES "
                "in backend/.env"
            ),
        )


def amount_for_purpose(settings: Settings, purpose: str) -> tuple[int, int]:
    if purpose in SUBSCRIPTION_PURPOSES:
        from app.services.subscription_service import tier_from_payment_purpose

        tier = tier_from_payment_purpose(purpose)
        if tier is None:
            raise ValueError(f"Unknown subscription purpose: {purpose}")
        kes = settings.subscription_amount_kes(tier)
        return kes, settings.subscription_amount_subunits(tier)
    if purpose == PAYMENT_PURPOSE_LEARNING_HUB:
        return settings.learning_hub_amount_kes, settings.learning_hub_amount_subunits
    return settings.payment_amount_kes, settings.payment_amount_subunits
