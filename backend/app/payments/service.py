import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import Settings
from app.db.models import Payment
from app.payments.constants import TERMINAL_STATUSES
from app.payments.entitlement import grant_entitlement
from app.payments.schemas import InitializePaymentResponse, PaymentStatusResponse
from app.services.paystack_service import PaystackError, VerifyResult, initialize_transaction


def status_message(payment: Payment) -> str | None:
    if payment.status == "success":
        return payment.result_desc or "Payment confirmed"
    if payment.status in TERMINAL_STATUSES and payment.result_desc:
        return payment.result_desc
    return None


def payment_to_status(payment: Payment) -> PaymentStatusResponse:
    return PaymentStatusResponse(
        id=str(payment.id),
        status=payment.status,
        amount_kes=payment.amount_kes,
        reference=payment.invoice_number,
        mpesa_receipt_number=payment.mpesa_receipt_number,
        result_desc=payment.result_desc,
        message=status_message(payment),
    )


def apply_verify_result(db: Session, payment: Payment, verified: VerifyResult) -> None:
    payment.result_desc = (verified.message or verified.status)[:500] if verified.message or verified.status else None
    if verified.status == "success":
        payment.status = "success"
        payment.result_code = 0
        payment.mpesa_receipt_number = verified.gateway_reference or verified.reference
    else:
        payment.status = "failed"
        payment.result_code = 1
    grant_entitlement(db, payment)


def create_payment(
    db: Session,
    settings: Settings,
    *,
    email: str,
    phone_number: str,
    purpose: str,
    amount_kes: int,
    amount_subunits: int,
) -> InitializePaymentResponse:
    invoice_number = f"GNP-{uuid.uuid4().hex[:16].upper()}"
    payment = Payment(
        provider="paystack",
        email=email,
        phone_number=phone_number,
        amount_kes=amount_kes,
        purpose=purpose,
        invoice_number=invoice_number,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    try:
        initialized = initialize_transaction(
            email=email,
            amount_kes=amount_kes,
            reference=invoice_number,
            callback_url=settings.paystack_callback_url,
            settings=settings,
            phone=phone_number or None,
        )
    except PaystackError as exc:
        payment.status = "failed"
        payment.result_desc = str(exc)[:500]
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not initialized.access_code:
        payment.status = "failed"
        payment.result_desc = "Paystack response missing access_code"
        db.commit()
        raise HTTPException(status_code=502, detail="Paystack initialize response missing access_code")

    return InitializePaymentResponse(
        id=str(payment.id),
        reference=initialized.reference,
        authorization_url=initialized.authorization_url,
        access_code=initialized.access_code,
        amount_kes=payment.amount_kes,
        amount_subunits=amount_subunits,
        phone_number=phone_number,
    )
