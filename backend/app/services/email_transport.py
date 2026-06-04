from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, parseaddr

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)


def _envelope_from(settings: Settings) -> str:
    _, addr = parseaddr(settings.otp_email_from)
    if addr:
        return addr
    if settings.smtp_user.strip():
        return settings.smtp_user.strip()
    return settings.otp_email_from.strip()


def _format_from_header(settings: Settings) -> str:
    name, addr = parseaddr(settings.otp_email_from)
    if addr and name:
        return formataddr((name, addr))
    if addr:
        return addr
    return settings.otp_email_from


def send_html_email(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: str,
    settings: Settings,
) -> None:
    if settings.smtp_host.strip():
        _send_smtp(
            to_email=to_email,
            subject=subject,
            html=html,
            text=text,
            settings=settings,
        )
        return

    if settings.resend_api_key.strip():
        _send_resend(
            to_email=to_email,
            subject=subject,
            html=html,
            text=text,
            settings=settings,
        )
        return

    raise RuntimeError("Email is not configured (set SMTP_HOST or RESEND_API_KEY)")


def _send_smtp(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: str,
    settings: Settings,
) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = _format_from_header(settings)
    msg["To"] = to_email
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    envelope_from = _envelope_from(settings)
    host = settings.smtp_host.strip()
    port = settings.smtp_port
    user = settings.smtp_user.strip()
    password = settings.smtp_password

    try:
        if settings.smtp_use_ssl:
            server: smtplib.SMTP = smtplib.SMTP_SSL(host, port, timeout=30)
        else:
            server = smtplib.SMTP(host, port, timeout=30)
        with server:
            if settings.smtp_use_tls and not settings.smtp_use_ssl:
                server.starttls()
            if user:
                server.login(user, password)
            server.sendmail(envelope_from, [to_email], msg.as_string())
    except smtplib.SMTPException as exc:
        logger.error("SMTP send failed for %s: %s", to_email, exc)
        hint = _smtp_error_hint(exc, settings)
        raise RuntimeError(hint) from exc


def _smtp_error_hint(exc: smtplib.SMTPException, settings: Settings) -> str:
    msg = str(exc).lower()
    if "535" in msg or "badcredentials" in msg or "username and password not accepted" in msg:
        return (
            "SMTP login failed (Gmail: use an App Password, not your normal password — "
            "https://support.google.com/accounts/answer/185833). "
            "OTP_EMAIL_FROM should match SMTP_USER or a verified alias."
        )
    if settings.smtp_use_tls and settings.smtp_port == 587:
        return f"Failed to send verification email via SMTP ({settings.smtp_host}:587 STARTTLS). Check server logs."
    return "Failed to send verification email. Check SMTP settings and backend logs."


def _send_resend(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: str,
    settings: Settings,
) -> None:
    with httpx.Client(timeout=15.0) as client:
        res = client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.otp_email_from,
                "to": [to_email],
                "subject": subject,
                "html": html,
                "text": text,
            },
        )
        if res.status_code >= 400:
            logger.error("Resend API error %s: %s", res.status_code, res.text)
            raise RuntimeError("Failed to send verification email")
