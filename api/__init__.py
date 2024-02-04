from fastapi import APIRouter

from .authorization import router as authorization_route
from .chat import router as chat_route

router = APIRouter()

router.include_router(authorization_route)
router.include_router(chat_route)