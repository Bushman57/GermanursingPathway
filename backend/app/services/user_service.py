import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import Settings
from app.db.models import (
    Application,
    Candidate,
    EligibilityCheck,
    Lead,
    PortalDocument,
    Scholarship,
    User,
)
from app.models.lead import LeadCreate
from app.services.otp_service import normalize_email


def _otp_password_hash() -> str:
    return hashlib.sha256(secrets.token_bytes(32)).hexdigest()


def get_latest_lead(db: Session, email: str) -> Lead | None:
    return (
        db.query(Lead)
        .filter(func.lower(Lead.email) == normalize_email(email))
        .order_by(Lead.created_at.desc())
        .first()
    )


def upsert_lead(db: Session, body: LeadCreate) -> Lead:
    email = normalize_email(body.email)
    lead = get_latest_lead(db, email)
    if lead is None:
        lead = Lead(
            full_name=body.full_name.strip(),
            email=email,
            phone=body.phone.strip() if body.phone else None,
            nursing_qualification=body.nursing_qualification,
            german_level=body.german_level,
            timeline=body.timeline,
            message=body.message,
            source=body.source,
            locale=body.locale,
            whatsapp_joined=body.whatsapp_joined,
            status="new",
        )
        db.add(lead)
    else:
        lead.full_name = body.full_name.strip()
        lead.phone = body.phone.strip() if body.phone else None
        lead.nursing_qualification = body.nursing_qualification
        lead.german_level = body.german_level
        lead.timeline = body.timeline
        if body.message:
            lead.message = body.message
        lead.source = body.source
        lead.locale = body.locale
        lead.whatsapp_joined = body.whatsapp_joined
        lead.status = "new"

    db.flush()
    return lead


def ensure_user_and_candidate(db: Session, lead: Lead) -> Candidate:
    email = normalize_email(lead.email)
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user is None:
        user = User(
            email=email,
            password_hash=_otp_password_hash(),
            role="candidate",
        )
        db.add(user)
        db.flush()

    candidate = (
        db.query(Candidate)
        .filter(func.lower(Candidate.email) == email)
        .order_by(Candidate.created_at.desc())
        .first()
    )
    if candidate is None:
        candidate = Candidate(
            lead_id=lead.id,
            user_id=user.id,
            full_name=lead.full_name.strip(),
            email=email,
        )
        db.add(candidate)
    else:
        candidate.lead_id = lead.id
        candidate.user_id = user.id
        candidate.full_name = lead.full_name.strip()

    db.flush()
    return candidate


def _attach_lead_to_check(row: EligibilityCheck, email: str, lead: Lead | None) -> None:
    row.email = normalize_email(email)
    if lead is not None:
        row.lead_id = lead.id


def get_latest_eligibility(db: Session, email: str) -> EligibilityCheck | None:
    normalized = normalize_email(email)
    return (
        db.query(EligibilityCheck)
        .filter(func.lower(EligibilityCheck.email) == normalized)
        .order_by(EligibilityCheck.created_at.desc())
        .first()
    )


def eligibility_to_dict(row: EligibilityCheck) -> dict:
    return {
        "id": str(row.id),
        "score": row.score,
        "status": row.status,
        "gaps": row.gaps or [],
        "payload": row.payload,
        "source": row.source,
        "locale": row.locale,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


def link_eligibility_checks(
    db: Session,
    email: str,
    *,
    check_id: uuid.UUID | None = None,
    full_name: str | None = None,
) -> int:
    normalized = normalize_email(email)
    lead = get_latest_lead(db, normalized)
    linked = 0

    if check_id is not None:
        row = (
            db.query(EligibilityCheck)
            .filter(EligibilityCheck.id == check_id, EligibilityCheck.email.is_(None))
            .first()
        )
        if row is not None:
            _attach_lead_to_check(row, normalized, lead)
            linked += 1

    if full_name:
        name = full_name.strip().lower()
        since = datetime.now(timezone.utc) - timedelta(days=7)
        rows = (
            db.query(EligibilityCheck)
            .filter(
                EligibilityCheck.email.is_(None),
                EligibilityCheck.created_at >= since,
            )
            .all()
        )
        for row in rows:
            payload_name = str(row.payload.get("name") or "").strip().lower()
            if payload_name and payload_name == name:
                _attach_lead_to_check(row, normalized, lead)
                linked += 1

    return linked


def has_learning_hub_access(db: Session, email: str) -> bool:
    lead = get_latest_lead(db, email)
    return lead is not None and lead.learning_hub_unlocked_at is not None


def unlock_learning_hub(db: Session, email: str) -> Lead:
    normalized = normalize_email(email)
    lead = get_latest_lead(db, normalized)
    if lead is None:
        lead = Lead(
            full_name=normalized.split("@")[0],
            email=normalized,
            nursing_qualification="unknown",
            german_level="unknown",
            timeline="unknown",
            source="learning_hub",
            locale="en",
            status="new",
        )
        db.add(lead)
        db.flush()
    if lead.learning_hub_unlocked_at is None:
        lead.learning_hub_unlocked_at = datetime.now(timezone.utc)
        db.flush()
    return lead


def learning_access_dict(db: Session, email: str, *, settings: Settings) -> dict:
    lead = get_latest_lead(db, email)
    unlocked_at = lead.learning_hub_unlocked_at if lead else None
    return {
        "unlocked": unlocked_at is not None,
        "freeModuleId": settings.learning_hub_free_module_id,
        "amountKes": settings.learning_hub_amount_kes,
        "unlockedAt": unlocked_at.isoformat() if unlocked_at else None,
    }


def compute_portal_journey(db: Session, email: str) -> dict:
    normalized = normalize_email(email)
    lead = get_latest_lead(db, normalized)
    eligibility = get_latest_eligibility(db, normalized)
    doc_query = db.query(PortalDocument).filter(func.lower(PortalDocument.email) == normalized)
    doc_count = doc_query.count()
    core_doc_types = {"diploma", "transcript"}
    uploaded_types = {
        row.doc_type
        for row in doc_query.with_entities(PortalDocument.doc_type).all()
    }
    has_core_docs = core_doc_types.issubset(uploaded_types)

    documents_status = (
        "done" if doc_count >= 3 else ("in_progress" if doc_count > 0 else "pending")
    )
    if documents_status == "done":
        anerkennung_status = "done" if has_core_docs and doc_count >= 4 else "in_progress"
    else:
        anerkennung_status = "pending"

    stages = [
        {"key": "register", "status": "done" if lead else "pending"},
        {
            "key": "eligibility",
            "status": "done"
            if eligibility
            else ("in_progress" if lead else "pending"),
        },
        {"key": "documents", "status": documents_status},
        {"key": "anerkennung", "status": anerkennung_status},
        {"key": "placement", "status": "pending"},
        {"key": "visa", "status": "pending"},
    ]

    done_count = sum(1 for s in stages if s["status"] == "done")
    progress = round((done_count / len(stages)) * 100)

    result: dict = {"stages": stages, "progress": progress}
    if eligibility:
        result["eligibility"] = {
            "score": eligibility.score,
            "status": eligibility.status,
            "gaps": eligibility.gaps or [],
        }
    return result


def get_candidate_for_email(db: Session, email: str) -> Candidate | None:
    return (
        db.query(Candidate)
        .filter(func.lower(Candidate.email) == normalize_email(email))
        .order_by(Candidate.created_at.desc())
        .first()
    )


def list_application_slugs(db: Session, email: str, *, stage: str | None = None) -> list[str]:
    candidate = get_candidate_for_email(db, email)
    if candidate is None:
        return []

    query = (
        db.query(Scholarship.slug)
        .join(Application, Application.scholarship_id == Scholarship.id)
        .filter(Application.candidate_id == candidate.id)
    )
    if stage is not None:
        query = query.filter(Application.stage == stage)
    return [row[0] for row in query.order_by(Application.updated_at.desc()).all()]


def set_saved_scholarship(db: Session, email: str, slug: str, *, saved: bool) -> list[str]:
    candidate = get_candidate_for_email(db, email)
    if candidate is None:
        raise ValueError("Candidate profile not found")

    scholarship = db.query(Scholarship).filter(Scholarship.slug == slug).first()
    if scholarship is None:
        raise ValueError("Scholarship not found")

    application = (
        db.query(Application)
        .filter(
            Application.candidate_id == candidate.id,
            Application.scholarship_id == scholarship.id,
        )
        .first()
    )

    if saved:
        if application is None:
            application = Application(
                candidate_id=candidate.id,
                scholarship_id=scholarship.id,
                stage="saved",
            )
            db.add(application)
        elif application.stage != "applied":
            application.stage = "saved"
    elif application is not None and application.stage == "saved":
        db.delete(application)

    db.flush()
    return list_application_slugs(db, email, stage="saved")


def record_scholarship_apply(db: Session, email: str, slug: str) -> None:
    candidate = get_candidate_for_email(db, email)
    if candidate is None:
        raise ValueError("Candidate profile not found")

    scholarship = db.query(Scholarship).filter(Scholarship.slug == slug).first()
    if scholarship is None:
        raise ValueError("Scholarship not found")

    application = (
        db.query(Application)
        .filter(
            Application.candidate_id == candidate.id,
            Application.scholarship_id == scholarship.id,
        )
        .first()
    )
    if application is None:
        application = Application(
            candidate_id=candidate.id,
            scholarship_id=scholarship.id,
            stage="applied",
        )
        db.add(application)
    else:
        application.stage = "applied"

    db.flush()
