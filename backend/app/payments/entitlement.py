from sqlalchemy.orm import Session

from app.db.models import Payment
from app.payments.constants import PAYMENT_PURPOSE_LEARNING_HUB, SUBSCRIPTION_PURPOSES
from app.services.subscription_service import grant_subscription, tier_from_payment_purpose
from app.services.user_service import unlock_learning_hub


def grant_entitlement(db: Session, payment: Payment) -> None:
    if payment.status != "success" or not payment.email:
        return
    if payment.purpose == PAYMENT_PURPOSE_LEARNING_HUB:
        unlock_learning_hub(db, payment.email)
        return
    if payment.purpose in SUBSCRIPTION_PURPOSES:
        tier = tier_from_payment_purpose(payment.purpose)
        if tier:
            grant_subscription(db, payment.email, tier, payment.id)
            if tier in ("essential", "plus", "premium"):
                unlock_learning_hub(db, payment.email)
