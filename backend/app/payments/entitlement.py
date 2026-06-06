from sqlalchemy.orm import Session

from app.db.models import Payment
from app.payments.constants import PAYMENT_PURPOSE_LEARNING_HUB
from app.services.user_service import unlock_learning_hub


def grant_entitlement(db: Session, payment: Payment) -> None:
    if payment.status != "success" or not payment.email:
        return
    if payment.purpose == PAYMENT_PURPOSE_LEARNING_HUB:
        unlock_learning_hub(db, payment.email)
