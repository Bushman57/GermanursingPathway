"""Paystack transaction initialize, verify, and webhook signature validation."""

from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import Settings

PAYSTACK_API_BASE = "https://api.paystack.co"


class PaystackError(Exception):
    pass


@dataclass
class InitializeResult:
    reference: str
    authorization_url: str
    access_code: str | None


@dataclass
class VerifyResult:
    status: str
    reference: str
    amount_kes: int
    gateway_reference: str | None
    paid_at: str | None
    channel: str | None
    message: str | None


def _headers(secret_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {secret_key.strip()}",
        "Content-Type": "application/json",
    }


def initialize_transaction(
    *,
    email: str,
    amount_kes: int,
    reference: str,
    callback_url: str,
    settings: Settings,
    phone: str | None = None,
) -> InitializeResult:
    payload: dict[str, object] = {
        "email": email.strip().lower(),
        "amount": amount_kes * 100,
        "reference": reference,
        "currency": "KES",
        "callback_url": callback_url,
        "channels": ["card", "mobile_money"],
    }
    if phone:
        payload["phone"] = phone
    url = f"{PAYSTACK_API_BASE}/transaction/initialize"
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=_headers(settings.paystack_secret_key), json=payload)
    except httpx.HTTPError as exc:
        raise PaystackError(f"Failed to reach Paystack: {exc}") from exc

    body = resp.json()
    if resp.status_code >= 400 or not body.get("status"):
        message = body.get("message") or resp.text[:300]
        raise PaystackError(f"Paystack initialize failed: {message}")

    data = body.get("data") or {}
    auth_url = data.get("authorization_url")
    ref = data.get("reference") or reference
    if not auth_url:
        raise PaystackError("Paystack initialize response missing authorization_url")

    access_code = data.get("access_code")
    if not access_code:
        raise PaystackError("Paystack initialize response missing access_code")

    return InitializeResult(
        reference=str(ref),
        authorization_url=str(auth_url),
        access_code=str(access_code),
    )


def verify_transaction(reference: str, settings: Settings) -> VerifyResult:
    url = f"{PAYSTACK_API_BASE}/transaction/verify/{reference}"
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, headers=_headers(settings.paystack_secret_key))
    except httpx.HTTPError as exc:
        raise PaystackError(f"Failed to reach Paystack: {exc}") from exc

    body = resp.json()
    if resp.status_code >= 400 or not body.get("status"):
        message = body.get("message") or resp.text[:300]
        raise PaystackError(f"Paystack verify failed: {message}")

    data = body.get("data") or {}
    amount_subunits = int(data.get("amount") or 0)
    return VerifyResult(
        status=str(data.get("status") or "failed"),
        reference=str(data.get("reference") or reference),
        amount_kes=amount_subunits // 100,
        gateway_reference=_gateway_reference(data),
        paid_at=data.get("paid_at"),
        channel=data.get("channel"),
        message=data.get("gateway_response"),
    )


def _gateway_reference(data: dict[str, Any]) -> str | None:
    ref = data.get("reference")
    if ref:
        return str(ref)
    authorization = data.get("authorization") or {}
    if isinstance(authorization, dict) and authorization.get("authorization_code"):
        return str(authorization["authorization_code"])
    return None


def verify_webhook_signature(payload: bytes, signature: str, settings: Settings) -> bool:
    if not signature or not settings.paystack_secret_key.strip():
        return False
    digest = hmac.new(
        settings.paystack_secret_key.strip().encode(),
        payload,
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(digest, signature)


def parse_webhook_event(body: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    event = str(body.get("event") or "")
    data = body.get("data")
    if not isinstance(data, dict):
        data = {}
    return event, data
