from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.session import init_db
from app.routers import admin_content, chat, leads, payments, resources, scholarships

app = FastAPI(title="German Nursing Pathway API", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    if get_settings().database_url:
        init_db()


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    message = detail if isinstance(detail, str) else str(detail)
    return JSONResponse(status_code=exc.status_code, content={"error": message})

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(leads.router)
app.include_router(payments.router)
app.include_router(scholarships.router)
app.include_router(resources.router)
app.include_router(admin_content.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
