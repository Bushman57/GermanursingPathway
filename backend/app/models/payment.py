from pydantic import BaseModel, EmailStr, Field


class PaymentConfigResponse(BaseModel):
    amount_kes: int
    amount_subunits: int
    currency_label: str
    paystack_public_key: str
    program_cost_eur: int = 1550


class InitializePaymentCreate(BaseModel):
    email: EmailStr
    phone: str = Field(min_length=9, max_length=20)


class InitializePaymentResponse(BaseModel):
    id: str
    reference: str
    authorization_url: str
    access_code: str | None = None
    amount_kes: int
    amount_subunits: int
    phone_number: str


class VerifyPaymentBody(BaseModel):
    reference: str = Field(min_length=1, max_length=64)


class PaymentStatusResponse(BaseModel):
    id: str
    status: str
    amount_kes: int
    reference: str | None = None
    mpesa_receipt_number: str | None = None
    result_desc: str | None = None
    message: str | None = None
