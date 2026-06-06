from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import Settings, get_settings
from app.payments.constants import PAYMENT_PURPOSE_PROGRAM
from app.payments.deps import amount_for_purpose, require_payment_config
from app.payments.schemas import PaymentConfigResponse

router = APIRouter()


@router.get("/config", response_model=PaymentConfigResponse)
def payment_config(
    purpose: str = Query(default=PAYMENT_PURPOSE_PROGRAM),
    settings: Settings = Depends(get_settings),
) -> PaymentConfigResponse:
    require_payment_config(purpose, settings)
    amount_kes, amount_subunits = amount_for_purpose(settings, purpose)
    if not settings.paystack_public_key.strip():
        raise HTTPException(status_code=503, detail="PAYSTACK_PUBLIC_KEY is not configured.")
    return PaymentConfigResponse(
        amount_kes=amount_kes,
        amount_subunits=amount_subunits,
        currency_label=settings.payment_currency_label,
        paystack_public_key=settings.paystack_public_key.strip(),
        purpose=purpose,
    )
