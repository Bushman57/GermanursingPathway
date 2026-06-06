import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Payment
from app.payments.constants import TERMINAL_STATUSES
from app.payments.deps import optional_db, require_payment_config
from app.payments.schemas import PaymentStatusResponse, VerifyPaymentBody
from app.payments.service import apply_verify_result, payment_to_status
from app.services.paystack_service import PaystackError, verify_transaction

router = APIRouter()


@router.post("/verify", response_model=PaymentStatusResponse)
def verify_payment(
    body: VerifyPaymentBody,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(get_settings),
) -> PaymentStatusResponse:
    payment = db.query(Payment).filter(Payment.invoice_number == body.reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    require_payment_config(payment.purpose, settings)

    if payment.status in TERMINAL_STATUSES:
        return payment_to_status(payment)

    try:
        verified = verify_transaction(body.reference, settings)
    except PaystackError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    apply_verify_result(db, payment, verified)
    db.commit()
    db.refresh(payment)
    return payment_to_status(payment)


@router.get("/status/{payment_id}", response_model=PaymentStatusResponse)
def get_payment_status(
    payment_id: uuid.UUID,
    db: Session = Depends(optional_db),
) -> PaymentStatusResponse:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment_to_status(payment)
