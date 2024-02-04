from fastapi import APIRouter

from .home import router as home_route

router = APIRouter()

router.include_router(home_route)