import hashlib
import uuid
from collections.abc import Generator
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import PortalDocument
from app.db.session import get_db
from app.deps.portal_auth import PortalUser, require_portal_user
from app.services.otp_service import latest_lead_profile, normalize_email
from app.services.user_service import (
    compute_portal_journey,
    eligibility_to_dict,
    get_latest_eligibility,
    get_latest_lead,
    list_application_slugs,
    record_scholarship_apply,
    set_saved_scholarship,
)

router = APIRouter(prefix="/api/portal", tags=["portal"])

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "portal"

DOCUMENT_TYPES = frozenset(
    {"passport", "diploma", "transcript", "german_certificate", "cv", "other"}
)

AVATAR_MAX_BYTES = 2 * 1024 * 1024
AVATAR_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
AVATAR_FILENAMES = ("avatar.jpg", "avatar.png", "avatar.webp")


def require_db() -> Generator[Session, None, None]:
    if not get_settings().database_url:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set DATABASE_URL in backend/.env",
        )
    yield from get_db()


class ProfileUpdateBody(BaseModel):
    full_name: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=40)
    german_level: str | None = Field(None, max_length=40)
    notify_deadlines: bool | None = None
    notify_documents: bool | None = None


class SavedScholarshipBody(BaseModel):
    saved: bool = True


def _email_dir(email: str) -> Path:
    digest = hashlib.sha256(email.encode()).hexdigest()[:16]
    path = UPLOAD_ROOT / digest
    path.mkdir(parents=True, exist_ok=True)
    return path


def _find_avatar_path(email: str) -> Path | None:
    folder = _email_dir(email)
    for name in AVATAR_FILENAMES:
        candidate = folder / name
        if candidate.is_file():
            return candidate
    return None


def _clear_avatar_files(email: str) -> None:
    folder = _email_dir(email)
    for name in AVATAR_FILENAMES:
        path = folder / name
        if path.is_file():
            path.unlink(missing_ok=True)


@router.get("/profile")
def get_profile(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict:
    profile = latest_lead_profile(db, user.email)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    lead = get_latest_lead(db, user.email)
    avatar_path = _find_avatar_path(user.email)
    avatar_updated = None
    if avatar_path is not None:
        avatar_updated = int(avatar_path.stat().st_mtime)

    return {
        **profile,
        "phone": lead.phone if lead else None,
        "germanLevel": lead.german_level if lead else None,
        "notifyDeadlines": lead.notify_deadlines if lead else True,
        "notifyDocuments": lead.notify_documents if lead else True,
        "hasAvatar": avatar_path is not None,
        "avatarUpdatedAt": avatar_updated,
    }


@router.patch("/profile")
def update_profile(
    body: ProfileUpdateBody,
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, str]:
    email = normalize_email(user.email)
    lead = get_latest_lead(db, email)
    if lead is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    if body.full_name:
        lead.full_name = body.full_name.strip()[:200]
    if body.phone is not None:
        lead.phone = body.phone.strip()[:40] or None
    if body.german_level:
        lead.german_level = body.german_level.strip()[:40]
    if body.notify_deadlines is not None:
        lead.notify_deadlines = body.notify_deadlines
    if body.notify_documents is not None:
        lead.notify_documents = body.notify_documents

    db.commit()
    return {"message": "Profile updated"}


@router.get("/avatar")
def get_avatar(
    user: PortalUser = Depends(require_portal_user),
) -> FileResponse:
    path = _find_avatar_path(user.email)
    if path is None:
        raise HTTPException(status_code=404, detail="Avatar not found")
    media = "image/jpeg" if path.suffix == ".jpg" else f"image/{path.suffix.lstrip('.')}"
    return FileResponse(path, media_type=media)


@router.post("/avatar", status_code=201)
async def upload_avatar(
    file: UploadFile = File(...),
    user: PortalUser = Depends(require_portal_user),
) -> dict:
    content_type = (file.content_type or "").lower()
    ext = AVATAR_EXTENSIONS.get(content_type)
    if ext is None:
        raise HTTPException(status_code=400, detail="Use a JPEG, PNG, or WebP image")

    content = await file.read()
    if len(content) > AVATAR_MAX_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 2MB)")

    _clear_avatar_files(user.email)
    dest = _email_dir(user.email) / f"avatar{ext}"
    dest.write_bytes(content)

    return {"message": "Avatar updated", "avatarUpdatedAt": int(dest.stat().st_mtime)}


@router.delete("/avatar", status_code=204)
def delete_avatar(
    user: PortalUser = Depends(require_portal_user),
) -> Response:
    _clear_avatar_files(user.email)
    return Response(status_code=204)


@router.get("/documents")
def list_documents(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> list[dict]:
    email = normalize_email(user.email)
    rows = (
        db.query(PortalDocument)
        .filter(PortalDocument.email == email)
        .order_by(PortalDocument.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "docType": r.doc_type,
            "filename": r.filename,
            "status": r.status,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("/documents", status_code=201)
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, str]:
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid document type")

    email = normalize_email(user.email)
    safe_name = (file.filename or "upload").replace("..", "").replace("/", "_")[:200]
    dest_dir = _email_dir(email)
    doc_id = uuid.uuid4()
    dest = dest_dir / f"{doc_id}_{safe_name}"

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    dest.write_bytes(content)

    row = PortalDocument(
        email=email,
        doc_type=doc_type,
        filename=safe_name,
        storage_path=str(dest.relative_to(UPLOAD_ROOT.parent.parent)),
        status="uploaded",
    )
    db.add(row)
    db.commit()

    return {"message": "Document uploaded", "id": str(row.id)}


@router.get("/notifications")
def list_notifications(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> list[dict]:
    email = normalize_email(user.email)
    items: list[dict] = [
        {
            "id": "welcome",
            "type": "info",
            "title": "Welcome to your portal",
            "body": "Browse scholarships and upload documents when ready.",
            "read": False,
        }
    ]
    docs = db.query(PortalDocument).filter(PortalDocument.email == email).count()
    if docs == 0:
        items.append(
            {
                "id": "docs-missing",
                "type": "action",
                "title": "Upload your documents",
                "body": "Complete your passport, diploma, and transcript uploads.",
                "read": False,
            }
        )
    return items


@router.get("/eligibility")
def get_portal_eligibility(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict:
    row = get_latest_eligibility(db, user.email)
    if row is None:
        raise HTTPException(status_code=404, detail="No eligibility check found")
    return eligibility_to_dict(row)


@router.get("/journey")
def get_portal_journey(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict:
    return compute_portal_journey(db, user.email)


@router.get("/saved-scholarships")
def get_saved_scholarships(
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, list[str]]:
    email = normalize_email(user.email)
    slugs = list_application_slugs(db, email, stage="saved")
    return {"slugs": slugs}


@router.put("/saved-scholarships/{slug}")
def update_saved_scholarship(
    slug: str,
    body: SavedScholarshipBody,
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, list[str]]:
    email = normalize_email(user.email)
    try:
        slugs = set_saved_scholarship(db, email, slug, saved=body.saved)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    db.commit()
    return {"slugs": slugs}


@router.post("/applications/{slug}/apply", status_code=201)
def record_application(
    slug: str,
    user: PortalUser = Depends(require_portal_user),
    db: Session = Depends(require_db),
) -> dict[str, str]:
    email = normalize_email(user.email)
    try:
        record_scholarship_apply(db, email, slug)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    db.commit()
    return {"message": "Application recorded", "slug": slug}
