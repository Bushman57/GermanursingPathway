from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import Settings, get_settings

_bearer = HTTPBearer(auto_error=False)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> None:
    secret = settings.admin_api_secret.strip()
    if not secret:
        raise HTTPException(
            status_code=503,
            detail="Admin API is not configured. Set ADMIN_API_SECRET in backend/.env",
        )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing or invalid authorization")
    if credentials.credentials != secret:
        raise HTTPException(status_code=403, detail="Invalid admin credentials")
