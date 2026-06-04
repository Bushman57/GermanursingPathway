import json
import uuid
from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Payment
from app.db.session import get_db
from app.models.payment import (
    InitializePaymentCreate,
    InitializePaymentResponse,
    PaymentConfigResponse,
    PaymentStatusResponse,
    VerifyPaymentBody,
)
from app.services.paystack_service import (
    PaystackError,
    VerifyResult,
    initialize_transaction,
    parse_webhook_event,
    verify_transaction,
    verify_webhook_signature,
)
from app.services.phone_utils import PhoneValidationError, normalize_kenya_mpesa_phone

router = APIRouter(prefix="/api/payments", tags=["payments"])

TERMINAL_STATUSES = frozenset({"success", "failed", "cancelled", "timeout"})


def optional_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


def require_payment_config(settings: Settings = Depends(get_settings)) -> Settings:
    if not settings.paystack_payments_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "Paystack payments are not configured. Set PAYSTACK_SECRET_KEY, "
                "PAYSTACK_PUBLIC_KEY, PAYSTACK_CALLBACK_BASE_URL, and PAYMENT_AMOUNT_KES "
                "in backend/.env"
            ),
        )
    return settings


def _status_message(payment: Payment) -> str | None:
    if payment.status == "success":
        return payment.result_desc or "Payment confirmed"
    if payment.status in TERMINAL_STATUSES and payment.result_desc:
        return payment.result_desc
    return None


def _payment_to_status(payment: Payment) -> PaymentStatusResponse:
    return PaymentStatusResponse(
        id=str(payment.id),
        status=payment.status,
        amount_kes=payment.amount_kes,
        reference=payment.invoice_number,
        mpesa_receipt_number=payment.mpesa_receipt_number,
        result_desc=payment.result_desc,
        message=_status_message(payment),
    )


def _apply_verify_result(payment: Payment, verified: VerifyResult) -> None:
    payment.result_desc = (verified.message or verified.status)[:500] if verified.message or verified.status else None
    if verified.status == "success":
        payment.status = "success"
        payment.result_code = 0
        payment.mpesa_receipt_number = verified.gateway_reference or verified.reference
    else:
        payment.status = "failed"
        payment.result_code = 1


@router.get("/config", response_model=PaymentConfigResponse)
def payment_config(settings: Settings = Depends(get_settings)) -> PaymentConfigResponse:
    if settings.payment_amount_kes <= 0:
        raise HTTPException(status_code=503, detail="PAYMENT_AMOUNT_KES is not configured.")
    if not settings.paystack_public_key.strip():
        raise HTTPException(status_code=503, detail="PAYSTACK_PUBLIC_KEY is not configured.")
    return PaymentConfigResponse(
        amount_kes=settings.payment_amount_kes,
        amount_subunits=settings.payment_amount_subunits,
        currency_label=settings.payment_currency_label,
        paystack_public_key=settings.paystack_public_key.strip(),
    )


@router.post("/initialize", response_model=InitializePaymentResponse)
def initialize_payment(
    body: InitializePaymentCreate,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(require_payment_config),
) -> InitializePaymentResponse:
    email = str(body.email).strip().lower()
    try:
        phone_number = normalize_kenya_mpesa_phone(body.phone)
    except PhoneValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    invoice_number = f"GNP-{uuid.uuid4().hex[:16].upper()}"
    payment = Payment(
        provider="paystack",
        email=email,
        phone_number=phone_number,
        amount_kes=settings.payment_amount_kes,
        invoice_number=invoice_number,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    try:
        initialized = initialize_transaction(
            email=email,
            amount_kes=settings.payment_amount_kes,
            reference=invoice_number,
            callback_url=settings.paystack_callback_url,
            settings=settings,
            phone=phone_number,
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
        amount_subunits=settings.payment_amount_subunits,
        phone_number=phone_number,
    )


@router.post("/verify", response_model=PaymentStatusResponse)
def verify_payment(
    body: VerifyPaymentBody,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(require_payment_config),
) -> PaymentStatusResponse:
    payment = db.query(Payment).filter(Payment.invoice_number == body.reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status in TERMINAL_STATUSES:
        return _payment_to_status(payment)

    try:
        verified = verify_transaction(body.reference, settings)
    except PaystackError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    _apply_verify_result(payment, verified)
    db.commit()
    db.refresh(payment)
    return _payment_to_status(payment)


@router.post("/paystack/webhook")
async def paystack_webhook(
    request: Request,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(get_settings),
) -> JSONResponse:
    raw = await request.body()
    signature = request.headers.get("x-paystack-signature", "")
    if not verify_webhook_signature(raw, signature, settings):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        body = json.loads(raw)
    except json.JSONDecodeError:
        return JSONResponse({"received": True})

    event, data = parse_webhook_event(body)
    reference = data.get("reference")
    if not reference:
        return JSONResponse({"received": True})

    payment = db.query(Payment).filter(Payment.invoice_number == str(reference)).first()
    if not payment or payment.status in TERMINAL_STATUSES:
        return JSONResponse({"received": True})

    payment.callback_payload = body
    if event == "charge.success":
        payment.status = "success"
        payment.result_code = 0
        payment.mpesa_receipt_number = str(reference)
        payment.result_desc = str(data.get("gateway_response") or "success")[:500]
    elif event in ("charge.failed", "transfer.failed"):
        payment.status = "failed"
        payment.result_code = 1
        payment.result_desc = str(data.get("gateway_response") or event)[:500]

    db.commit()
    return JSONResponse({"received": True})


@router.get("/paystack/callback")
def paystack_browser_callback(
    reference: str | None = None,
    trxref: str | None = None,
) -> RedirectResponse:
    ref = reference or trxref or ""
    site = get_settings().public_site_url.rstrip("/") or "http://localhost:8080"
    return RedirectResponse(url=f"{site}/?payment={ref}")


@router.get("/{payment_id}", response_model=PaymentStatusResponse)
def get_payment_status(
    payment_id: uuid.UUID,
    db: Session = Depends(optional_db),
) -> PaymentStatusResponse:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return _payment_to_status(payment)
