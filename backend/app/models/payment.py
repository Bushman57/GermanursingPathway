from pydantic import BaseModel, Field


class PaymentConfigResponse(BaseModel):
    amount_kes: int
    currency_label: str
    program_cost_eur: int = 2300


class StkPaymentCreate(BaseModel):
    phone: str = Field(min_length=9, max_length=20)


class StkPaymentResponse(BaseModel):
    id: str
    status: str
    checkout_request_id: str | None = None
    customer_message: str | None = None
    amount_kes: int


class PaymentStatusResponse(BaseModel):
    id: str
    status: str
    amount_kes: int
    mpesa_receipt_number: str | None = None
    result_desc: str | None = None
