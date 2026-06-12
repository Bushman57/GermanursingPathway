from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.deps.portal_auth import PortalUser, optional_portal_user
from app.models.chat import ChatRequest, ChatResponse, ErrorResponse
from app.payments.deps import optional_db
from app.services.chat_service import ChatServiceError, generate_reply
from app.services.subscription_service import (
    can_use_pathway_chat,
    can_use_scholarship_chat,
    has_min_tier,
    increment_chat_user_turns,
)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse},
        402: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def post_chat(
    body: ChatRequest,
    db: Session = Depends(optional_db),
    settings: Settings = Depends(get_settings),
    portal_user: PortalUser | None = Depends(optional_portal_user),
) -> ChatResponse:
    email = portal_user.email if portal_user else None
    session_id = body.sessionId

    if body.mode == "pathway":
        allowed, upgrade_tier = can_use_pathway_chat(db, email, session_id, settings=settings)
        if not allowed:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "Free trial exhausted. Upgrade to Essential for unlimited pathway chat.",
                    "upgradeTier": upgrade_tier,
                    "pricingUrl": "/pricing",
                },
            )
    elif body.mode == "scholarship":
        allowed, upgrade_tier = can_use_scholarship_chat(db, email)
        if not allowed:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "Plus subscription required for scholarship matching chat.",
                    "upgradeTier": upgrade_tier,
                    "pricingUrl": "/pricing",
                },
            )

    try:
        reply = await generate_reply(body)
        if body.mode == "pathway" and not (email and has_min_tier(db, email, "essential")):
            increment_chat_user_turns(db, email, "pathway", session_id)
        db.commit()
        return ChatResponse(reply=reply)
    except ChatServiceError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e
