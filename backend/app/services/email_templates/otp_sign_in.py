from __future__ import annotations

import base64
import re
from datetime import datetime, timezone
from html import escape
from pathlib import Path

from app.config import Settings

_LOGO_PATH = Path(__file__).resolve().parents[2] / "static" / "email" / "logo.png"
_EMAIL_FROM_RE = re.compile(r"<([^>]+)>")
_BRAND_NAME = "German Nursing Pathway"
_TAGLINE = "Connecting Kenyan Healthcare with German opportunity"


def resolve_support_email(settings: Settings) -> str:
    if settings.otp_support_email.strip():
        return settings.otp_support_email.strip()
    match = _EMAIL_FROM_RE.search(settings.otp_email_from)
    if match:
        return match.group(1).strip()
    if "@" in settings.otp_email_from:
        return settings.otp_email_from.strip()
    return "support@example.com"


def _logo_img_tag(settings: Settings) -> str:
    alt = escape(_BRAND_NAME)
    if settings.public_site_url.strip():
        src = f"{settings.public_site_url.rstrip('/')}/email/logo.png"
        return (
            f'<img src="{escape(src, quote=True)}" alt="{alt}" width="180" height="auto" '
            f'style="display:block;max-width:180px;height:auto;border:0;" />'
        )
    if _LOGO_PATH.is_file():
        encoded = base64.b64encode(_LOGO_PATH.read_bytes()).decode("ascii")
        return (
            f'<img src="data:image/png;base64,{encoded}" alt="{alt}" width="180" height="auto" '
            f'style="display:block;max-width:180px;height:auto;border:0;" />'
        )
    return f'<span style="font-size:20px;font-weight:700;color:#1a1a1a;">{alt}</span>'


def render_otp_sign_in_email(
    *,
    code: str,
    settings: Settings,
    support_email: str | None = None,
) -> tuple[str, str]:
    safe_code = escape(code.strip())
    expire = settings.otp_expire_minutes
    support_raw = support_email or resolve_support_email(settings)
    support = escape(support_raw)
    year = datetime.now(timezone.utc).year
    logo = _logo_img_tag(settings)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your sign-in code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
          <tr>
            <td align="left" style="padding:0 0 20px 0;">{logo}</td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="height:3px;background-color:#2d7a4f;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 8px 32px;">
                    <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;line-height:1.3;">
                      Sign in to your Student Portal
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 8px 32px;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
                      Please use the one-time sign-in code below:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 32px 8px 32px;">
                    <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:#1a1a1a;line-height:1.2;">
                      {safe_code}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 24px 32px;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">
                      The code expires in {expire} minutes.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px;">
                    <hr style="border:none;border-top:1px solid #e8e8e8;margin:0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px 28px 32px;">
                    <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#6b7280;">
                      If you did not request this code, please contact us immediately at
                      <a href="mailto:{support}" style="color:#2563eb;text-decoration:none;">{support}</a>.
                    </p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">Thank you.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 8px 0 8px;">
              <p style="margin:0 0 4px 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                &copy; {_BRAND_NAME} {year}
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">{_TAGLINE}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text = (
        f"Sign in to your Student Portal — {_BRAND_NAME}\n\n"
        f"Your one-time sign-in code is: {code.strip()}\n\n"
        f"The code expires in {expire} minutes.\n\n"
        f"If you did not request this code, contact us at {support_raw}.\n\n"
        f"Thank you.\n"
    )

    return html, text
