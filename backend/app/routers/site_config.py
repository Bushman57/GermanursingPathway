from fastapi import APIRouter, Depends

from app.config import Settings, get_settings

router = APIRouter(prefix="/api", tags=["site"])


@router.get("/site-config")
def get_site_config(settings: Settings = Depends(get_settings)) -> dict[str, bool]:
    return {"subscriptionsEnabled": settings.subscriptions_enabled}
