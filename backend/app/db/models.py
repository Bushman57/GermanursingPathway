import uuid
from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True, index=True
    )
    email: Mapped[str | None] = mapped_column(String(320), nullable=True, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    gaps: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="public")
    locale: Mapped[str] = mapped_column(String(5), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PortalDocument(Base):
    __tablename__ = "portal_documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    doc_type: Mapped[str] = mapped_column(String(60), nullable=False)
    filename: Mapped[str] = mapped_column(String(300), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="uploaded")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OtpChallenge(Base):
    __tablename__ = "otp_challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    nursing_qualification: Mapped[str] = mapped_column(String(120), nullable=False)
    german_level: Mapped[str] = mapped_column(String(40), nullable=False)
    timeline: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(60), default="homepage")
    locale: Mapped[str] = mapped_column(String(5), default="en")
    status: Mapped[str] = mapped_column(String(30), default="new")
    whatsapp_joined: Mapped[bool] = mapped_column(Boolean, default=False)
    notify_deadlines: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_documents: Mapped[bool] = mapped_column(Boolean, default=True)
    learning_hub_unlocked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PartnerSchool(Base):
    __tablename__ = "partner_schools"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_de: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Scholarship(Base):
    __tablename__ = "scholarships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    partner_school_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partner_schools.id"), nullable=True
    )
    program_type: Mapped[str] = mapped_column(String(60), nullable=False)
    title_en: Mapped[str] = mapped_column(String(300), nullable=False)
    title_de: Mapped[str | None] = mapped_column(String(300), nullable=True)
    short_description_en: Mapped[str] = mapped_column(Text, nullable=False)
    short_description_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    funding: Mapped[str | None] = mapped_column(String(80), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    data_verification_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    application_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    degree_level: Mapped[str | None] = mapped_column(String(60), nullable=True)
    german_level_required: Mapped[str | None] = mapped_column(String(30), nullable=True)
    visa_sponsorship: Mapped[str | None] = mapped_column(String(20), nullable=True)
    accommodation_support: Mapped[str | None] = mapped_column(String(40), nullable=True)
    intake_month: Mapped[str | None] = mapped_column(String(20), nullable=True)
    program_duration: Mapped[str | None] = mapped_column(String(30), nullable=True)
    recognition_support: Mapped[str | None] = mapped_column(String(40), nullable=True)
    interview_required: Mapped[str | None] = mapped_column(String(10), nullable=True)
    application_method: Mapped[str | None] = mapped_column(String(40), nullable=True)
    provider_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    official_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    application_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    program_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    partner: Mapped["PartnerSchool | None"] = relationship("PartnerSchool")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="candidate")


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider: Mapped[str] = mapped_column(String(20), default="paystack", nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    amount_kes: Mapped[int] = mapped_column(Integer, nullable=False)
    purpose: Mapped[str] = mapped_column(String(40), default="program_fee", nullable=False)
    invoice_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    merchant_request_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    checkout_request_id: Mapped[str | None] = mapped_column(String(80), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    result_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result_desc: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mpesa_receipt_number: Mapped[str | None] = mapped_column(String(40), nullable=True)
    callback_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ResourceArticle(Base):
    __tablename__ = "resource_articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    title_en: Mapped[str] = mapped_column(String(300), nullable=False)
    title_de: Mapped[str | None] = mapped_column(String(300), nullable=True)
    excerpt_en: Mapped[str] = mapped_column(Text, nullable=False)
    excerpt_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_de: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    read_minutes: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    article_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    scholarship_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scholarships.id"), nullable=True
    )
    stage: Mapped[str] = mapped_column(String(40), default="registered")
    checklist: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
