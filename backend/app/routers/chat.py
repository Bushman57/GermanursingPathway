from fastapi import APIRouter, HTTPException

from app.models.chat import ChatRequest, ChatResponse, ErrorResponse
from app.services.chat_service import ChatServiceError, generate_reply

router = APIRouter(prefix="/api", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
)
async def post_chat(body: ChatRequest) -> ChatResponse:
    try:
        reply = await generate_reply(body)
        return ChatResponse(reply=reply)
    except ChatServiceError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e
