"""KCB Buni M-Pesa STK Push client (OAuth + initiate + callback parsing)."""

from __future__ import annotations

import base64
import re
import time
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import Settings, get_settings

_TOKEN_CACHE: dict[str, float | str] = {"token": "", "expires_at": 0.0}

KENYA_MOBILE_RE = re.compile(r"^254[17]\d{8}$")


class KcbMpesaError(Exception):
    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass
class StkInitiateResult:
    merchant_request_id: str
    checkout_request_id: str
    customer_message: str
    response_code: str


@dataclass
class StkCallbackResult:
    merchant_request_id: str
    checkout_request_id: str
    result_code: int
    result_desc: str
    amount: int | None
    mpesa_receipt_number: str | None
    phone_number: str | None
    transaction_date: str | None


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone.strip())
    if digits.startswith("0") and len(digits) == 10:
        digits = "254" + digits[1:]
    elif digits.startswith("7") and len(digits) == 9:
        digits = "254" + digits
    elif digits.startswith("1") and len(digits) == 9:
        digits = "254" + digits
    if not KENYA_MOBILE_RE.match(digits):
        raise KcbMpesaError(
            "Invalid phone number. Use a Kenyan M-Pesa number (e.g. 0712345678 or 254712345678)."
        )
    return digits


def _basic_auth_header(consumer_key: str, consumer_secret: str) -> str:
    raw = f"{consumer_key}:{consumer_secret}".encode()
    return "Basic " + base64.b64encode(raw).decode()


def get_access_token(settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    now = time.time()
    cached = _TOKEN_CACHE.get("token", "")
    expires_at = float(_TOKEN_CACHE.get("expires_at", 0))
    if cached and now < expires_at:
        return str(cached)

    url = f"{settings.kcb_api_base.rstrip('/')}/token?grant_type=client_credentials"
    headers = {
        "Authorization": _basic_auth_header(settings.kcb_consumer_key, settings.kcb_consumer_secret),
        "Content-Type": "application/x-www-form-urlencoded",
    }
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=headers)
    except httpx.HTTPError as exc:
        raise KcbMpesaError(f"Failed to reach KCB token endpoint: {exc}") from exc

    if resp.status_code != 200:
        raise KcbMpesaError(
            f"KCB OAuth failed ({resp.status_code}): {resp.text[:300]}",
            status_code=resp.status_code,
        )

    data = resp.json()
    token = data.get("access_token")
    if not token:
        raise KcbMpesaError("KCB OAuth response missing access_token")

    expires_in = int(data.get("expires_in", 3600))
    _TOKEN_CACHE["token"] = token
    _TOKEN_CACHE["expires_at"] = now + max(expires_in - 60, 60)
    return str(token)


def initiate_stk_push(
    *,
    phone: str,
    amount: int,
    invoice_number: str,
    callback_url: str,
    transaction_description: str,
    settings: Settings | None = None,
) -> StkInitiateResult:
    settings = settings or get_settings()
    phone_number = normalize_phone(phone)
    token = get_access_token(settings)

    url = f"{settings.kcb_api_base.rstrip('/')}/mm/api/request/1.0.0/stkpush"
    payload: dict[str, Any] = {
        "phoneNumber": phone_number,
        "amount": str(amount),
        "invoiceNumber": invoice_number,
        "sharedShortCode": settings.kcb_shared_short_code,
        "orgShortCode": settings.kcb_org_short_code,
        "callbackUrl": callback_url,
        "transactionDescription": transaction_description,
    }
    if settings.kcb_org_pass_key:
        payload["orgPassKey"] = settings.kcb_org_pass_key

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        raise KcbMpesaError(f"Failed to reach KCB STK endpoint: {exc}") from exc

    if resp.status_code != 200:
        raise KcbMpesaError(
            f"KCB STK push failed ({resp.status_code}): {resp.text[:500]}",
            status_code=resp.status_code,
        )

    data = resp.json()
    inner = data.get("response") or data
    response_code = str(inner.get("ResponseCode", ""))
    if response_code != "0":
        desc = inner.get("ResponseDescription") or inner.get("CustomerMessage") or "STK request rejected"
        raise KcbMpesaError(f"KCB STK rejected: {desc}")

    merchant_request_id = str(inner.get("MerchantRequestID", ""))
    checkout_request_id = str(inner.get("CheckoutRequestID", ""))
    if not checkout_request_id:
        raise KcbMpesaError("KCB STK response missing CheckoutRequestID")

    return StkInitiateResult(
        merchant_request_id=merchant_request_id,
        checkout_request_id=checkout_request_id,
        customer_message=str(inner.get("CustomerMessage", "Check your phone for the M-Pesa prompt.")),
        response_code=response_code,
    )


def _metadata_value(items: list[dict[str, Any]], name: str) -> Any | None:
    for item in items:
        if item.get("Name") == name:
            return item.get("Value")
    return None


def parse_stk_callback(body: dict[str, Any]) -> StkCallbackResult:
    stk = (body.get("Body") or {}).get("stkCallback") or body.get("stkCallback") or {}
    if not stk:
        raise KcbMpesaError("Invalid callback payload: missing stkCallback")

    metadata = (stk.get("CallbackMetadata") or {}).get("Item") or []
    result_code_raw = stk.get("ResultCode", -1)
    try:
        result_code = int(result_code_raw)
    except (TypeError, ValueError):
        result_code = -1

    amount_val = _metadata_value(metadata, "Amount")
    amount = int(amount_val) if amount_val is not None else None

    receipt = _metadata_value(metadata, "MpesaReceiptNumber")
    phone_raw = _metadata_value(metadata, "PhoneNumber")
    phone_number = str(phone_raw) if phone_raw is not None else None

    tx_date_raw = _metadata_value(metadata, "TransactionDate")
    transaction_date = str(tx_date_raw) if tx_date_raw is not None else None

    return StkCallbackResult(
        merchant_request_id=str(stk.get("MerchantRequestID", "")),
        checkout_request_id=str(stk.get("CheckoutRequestID", "")),
        result_code=result_code,
        result_desc=str(stk.get("ResultDesc", "")),
        amount=amount,
        mpesa_receipt_number=str(receipt) if receipt is not None else None,
        phone_number=phone_number,
        transaction_date=transaction_date,
    )
