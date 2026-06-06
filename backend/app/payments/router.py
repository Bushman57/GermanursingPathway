from fastapi import APIRouter

from app.payments.routes import config, initialize, paystack, verify

router = APIRouter(prefix="/api/payments", tags=["payments"])

router.include_router(config.router)
router.include_router(initialize.router)
router.include_router(verify.router)
router.include_router(paystack.router)
