import uuid
from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Payment
from app.db.session import get_db
from app.models.payment import (
    PaymentConfigResponse,
    PaymentStatusResponse,
    StkPaymentCreate,
    StkPaymentResponse,
)
from app.services.kcb_mpesa_service import KcbMpesaError, initiate_stk_push, normalize_phone, parse_stk_callback

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
    if not settings.kcb_payments_configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "KCB payments are not configured. Set KCB_CONSUMER_KEY, KCB_CONSUMER_SECRET, "
                "KCB_CALLBACK_BASE_URL, and PAYMENT_AMOUNT_KES in backend/.env"
            ),
        )
    return settings


@router.get("/config", response_model=PaymentConfigResponse)
def payment_config(settings: Settings = Depends(get_settings)) -> PaymentConfigResponse:
    if settings.payment_amount_kes <= 0:
        raise HTTPException(status_code=503, detail="PAYMENT_AMOUNT_KES is not configured.")
    return PaymentConfigResponse(
        amount_kes=settings.payment_amount_kes,
        currency_label=settings.payment_currency_label,
    )


@router.post("/stk", response_model=StkPaymentResponse)
def create_stk_payment(
    body: StkPaymentCreate,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(require_payment_config),
) -> StkPaymentResponse:
    try:
        phone_number = normalize_phone(body.phone)
    except KcbMpesaError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    invoice_number = f"GNP-{uuid.uuid4().hex[:16].upper()}"
    payment = Payment(
        phone_number=phone_number,
        amount_kes=settings.payment_amount_kes,
        invoice_number=invoice_number,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    try:
        stk = initiate_stk_push(
            phone=phone_number,
            amount=settings.payment_amount_kes,
            invoice_number=invoice_number,
            callback_url=settings.kcb_callback_url,
            transaction_description="German Nursing Pathway program fee",
            settings=settings,
        )
    except KcbMpesaError as exc:
        payment.status = "failed"
        payment.result_desc = str(exc)[:500]
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    payment.merchant_request_id = stk.merchant_request_id or None
    payment.checkout_request_id = stk.checkout_request_id
    db.commit()
    db.refresh(payment)

    return StkPaymentResponse(
        id=str(payment.id),
        status=payment.status,
        checkout_request_id=payment.checkout_request_id,
        customer_message=stk.customer_message,
        amount_kes=payment.amount_kes,
    )


@router.post("/callback")
async def stk_callback(request: Request, db: Session = Depends(optional_db)) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})

    try:
        parsed = parse_stk_callback(body)
    except KcbMpesaError:
        return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})

    if not parsed.checkout_request_id:
        return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})

    payment = db.query(Payment).filter(Payment.checkout_request_id == parsed.checkout_request_id).first()
    if not payment:
        return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})

    if payment.status in TERMINAL_STATUSES:
        return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})

    payment.callback_payload = body
    payment.result_code = parsed.result_code
    payment.result_desc = parsed.result_desc[:500] if parsed.result_desc else None

    if parsed.result_code == 0:
        payment.status = "success"
        payment.mpesa_receipt_number = parsed.mpesa_receipt_number
    else:
        payment.status = "failed"

    db.commit()
    return JSONResponse(status_code=200, content={"ResultCode": 0, "ResultDesc": "Accepted"})


@router.get("/{payment_id}", response_model=PaymentStatusResponse)
def get_payment_status(
    payment_id: uuid.UUID,
    db: Session = Depends(optional_db),
) -> PaymentStatusResponse:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentStatusResponse(
        id=str(payment.id),
        status=payment.status,
        amount_kes=payment.amount_kes,
        mpesa_receipt_number=payment.mpesa_receipt_number,
        result_desc=payment.result_desc,
    )
