import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.db.session import _get_engine, init_db
from app.routers import (
    admin_content,
    auth,
    blogs,
    chat,
    eligibility,
    leads,
    partners,
    portal,
    resources,
    scholarships,
)
from app.payments import router as payments_router

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
    if settings.portal_cookie_samesite.lower() == "none" and not settings.portal_cookie_secure:
        log.warning(
            "PORTAL_COOKIE_SAMESITE=none requires PORTAL_COOKIE_SECURE=true for browsers to accept the session cookie"
        )
    log.info("CORS allow_origins: %s", settings.cors_origin_list)
    if settings.cors_origin_regex.strip():
        log.info("CORS allow_origin_regex: %s", settings.cors_origin_regex.strip())
    elif not any(o.startswith("https://") and "localhost" not in o for o in settings.cors_origin_list):
        log.warning(
            "CORS: no production HTTPS origins configured — set CORS_ORIGINS on the API host "
            "(e.g. https://germanursingpathway.com,https://www.germanursingpathway.com)"
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


@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(
    _request: Request, exc: ResponseValidationError
) -> JSONResponse:
    logging.getLogger("app.api").error("Response validation failed: %s", exc.errors())
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error — response schema mismatch"},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(_request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logging.getLogger("app.db").exception("Database error: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"error": "Database schema out of date or unavailable — contact support"},
    )

settings = get_settings()
_cors_kwargs: dict = {
    "allow_origins": settings.cors_origin_list,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if settings.cors_origin_regex.strip():
    _cors_kwargs["allow_origin_regex"] = settings.cors_origin_regex.strip()
app.add_middleware(CORSMiddleware, **_cors_kwargs)

app.include_router(auth.router)
app.include_router(portal.router)
app.include_router(eligibility.router)
app.include_router(partners.router)
app.include_router(chat.router)
app.include_router(leads.router)
app.include_router(payments_router)
app.include_router(scholarships.router)
app.include_router(resources.router)
app.include_router(blogs.router)
app.include_router(admin_content.router)


@app.get("/health")
async def health() -> dict[str, str]:
    payload: dict[str, str] = {"status": "ok"}
    settings = get_settings()
    if settings.database_url:
        engine = _get_engine()
        if engine is not None:
            try:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    revision = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
                    if revision:
                        payload["dbRevision"] = str(revision)
            except SQLAlchemyError:
                payload["status"] = "degraded"
                payload["db"] = "unavailable"
    return payload
