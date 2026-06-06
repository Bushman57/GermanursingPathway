import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db.models import Payment
from app.payments.constants import PAYMENT_PURPOSE_LEARNING_HUB, TERMINAL_STATUSES
from app.payments.deps import optional_db
from app.payments.entitlement import grant_entitlement
from app.services.paystack_service import parse_webhook_event, verify_webhook_signature

router = APIRouter()


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
        grant_entitlement(db, payment)
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
    db: Session = Depends(optional_db),
) -> RedirectResponse:
    ref = reference or trxref or ""
    site = get_settings().public_site_url.rstrip("/") or "http://localhost:8080"
    path = "/"
    if ref and get_settings().database_url:
        payment = db.query(Payment).filter(Payment.invoice_number == ref).first()
        if payment and payment.purpose == PAYMENT_PURPOSE_LEARNING_HUB:
            path = f"/resources?payment={ref}"
        else:
            path = f"/?payment={ref}"
    elif ref:
        path = f"/?payment={ref}"
    return RedirectResponse(url=f"{site}{path}")
