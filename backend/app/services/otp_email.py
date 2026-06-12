import logging

from app.config import Settings, get_settings
from app.services.email_templates.otp_sign_in import render_otp_sign_in_email
from app.services.email_transport import send_html_email

logger = logging.getLogger(__name__)


def send_otp_email(
    *,
    to_email: str,
    code: str,
    magic_link_url: str,
    autofill_domain: str,
    settings: Settings | None = None,
) -> None:
    settings = settings or get_settings()
    subject = "Your German Nursing Pathway sign-in code"
    html, text = render_otp_sign_in_email(
        code=code,
        magic_link_url=magic_link_url,
        autofill_domain=autofill_domain,
        settings=settings,
    )

    if not settings.otp_email_configured:
        logger.error(
            "OTP email not configured — set SMTP_HOST (and SMTP_USER/SMTP_PASSWORD) or RESEND_API_KEY in backend/.env, then restart uvicorn"
        )
        raise RuntimeError(
            "Email delivery is not configured. Set SMTP_HOST or RESEND_API_KEY in backend/.env and restart the API."
        )

    send_html_email(
        to_email=to_email,
        subject=subject,
        html=html,
        text=text,
        settings=settings,
    )
    logger.info("OTP sign-in email sent to %s", to_email)
