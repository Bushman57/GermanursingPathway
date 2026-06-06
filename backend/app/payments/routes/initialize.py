from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.deps.portal_auth import PortalUser, require_portal_user
from app.payments.constants import PAYMENT_PURPOSE_LEARNING_HUB
from app.payments.deps import amount_for_purpose, optional_db, require_payment_config
from app.payments.schemas import (
    InitializePaymentCreate,
    InitializePaymentResponse,
    LearningHubPaymentCreate,
)
from app.payments.service import create_payment
from app.services.phone_utils import PhoneValidationError, normalize_kenya_mpesa_phone

router = APIRouter()


@router.post("/initialize", response_model=InitializePaymentResponse)
def initialize_payment(
    body: InitializePaymentCreate,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(get_settings),
) -> InitializePaymentResponse:
    purpose = body.purpose
    require_payment_config(purpose, settings)

    if purpose == PAYMENT_PURPOSE_LEARNING_HUB:
        raise HTTPException(
            status_code=403,
            detail="Learning Hub payments require POST /api/payments/initialize/learning-hub with portal sign-in",
        )

    email = str(body.email).strip().lower()
    phone_raw = body.phone.strip()
    if phone_raw:
        try:
            phone_number = normalize_kenya_mpesa_phone(phone_raw)
        except PhoneValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    else:
        phone_number = ""

    amount_kes, amount_subunits = amount_for_purpose(settings, purpose)
    return create_payment(
        db,
        settings,
        email=email,
        phone_number=phone_number,
        purpose=purpose,
        amount_kes=amount_kes,
        amount_subunits=amount_subunits,
    )


@router.post("/initialize/learning-hub", response_model=InitializePaymentResponse)
def initialize_learning_hub_payment(
    body: LearningHubPaymentCreate,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(get_settings),
    portal_user: PortalUser = Depends(require_portal_user),
) -> InitializePaymentResponse:
    purpose = PAYMENT_PURPOSE_LEARNING_HUB
    require_payment_config(purpose, settings)

    email = portal_user.email
    if str(body.email).strip().lower() != email:
        raise HTTPException(status_code=403, detail="Email must match signed-in portal account")

    amount_kes, amount_subunits = amount_for_purpose(settings, purpose)
    return create_payment(
        db,
        settings,
        email=email,
        phone_number="",
        purpose=purpose,
        amount_kes=amount_kes,
        amount_subunits=amount_subunits,
    )


@router.get("/initialize")
def initialize_payment_get_not_allowed() -> None:
    raise HTTPException(
        status_code=405,
        detail="Use POST /api/payments/initialize with JSON body: email, phone",
    )
