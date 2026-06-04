import re

KENYA_MOBILE_RE = re.compile(r"^254[17]\d{8}$")


class PhoneValidationError(Exception):
    pass


def normalize_kenya_mpesa_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone.strip())
    if digits.startswith("0") and len(digits) == 10:
        digits = "254" + digits[1:]
    elif digits.startswith("7") and len(digits) == 9:
        digits = "254" + digits
    elif digits.startswith("1") and len(digits) == 9:
        digits = "254" + digits
    if not KENYA_MOBILE_RE.match(digits):
        raise PhoneValidationError(
            "Invalid M-Pesa number. Use 07XXXXXXXX or 2547XXXXXXXX."
        )
    return digits
