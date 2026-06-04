import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.session import init_db
from app.routers import (
    admin_content,
    auth,
    chat,
    eligibility,
    leads,
    partners,
    payments,
    portal,
    resources,
    scholarships,
)

app = FastAPI(title="German Nursing Pathway API", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    settings = get_settings()
    if settings.database_url:
        init_db()
    log = logging.getLogger("app.startup")
    if settings.otp_email_configured:
        log.info("OTP email: SMTP host %s (port %s)", settings.smtp_host.strip(), settings.smtp_port)
    elif settings.resend_api_key.strip():
        log.info("OTP email: Resend API configured")
    else:
        log.warning(
            "OTP email: not configured — set SMTP_HOST or RESEND_API_KEY in backend/.env and restart uvicorn"
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    message = detail if isinstance(detail, str) else str(detail)
    return JSONResponse(status_code=exc.status_code, content={"error": message})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    message = "Invalid request"
    if errors:
        first = errors[0]
        loc = first.get("loc", ())
        if "payment_id" in loc and first.get("type") == "uuid_parsing":
            message = "Invalid payment ID. Use GET /api/payments/status/{uuid} to poll status."
        elif msg := first.get("msg"):
            message = str(msg)
    return JSONResponse(status_code=422, content={"error": message})

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(portal.router)
app.include_router(eligibility.router)
app.include_router(partners.router)
app.include_router(chat.router)
app.include_router(leads.router)
app.include_router(payments.router)
app.include_router(scholarships.router)
app.include_router(resources.router)
app.include_router(admin_content.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
