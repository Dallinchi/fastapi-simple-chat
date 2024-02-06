from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from fastapi import Request

from templates import templates
from api.authorization import fake_users_db

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def render_homepage(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {
            "request": request,
            "users": fake_users_db,
        },
    )
    
@router.get("/chat", response_class=HTMLResponse)
async def render_chatpage(request: Request, id):
    return templates.TemplateResponse(
        "chat.html",
        {
            "request": request,
        },
    )
    
@router.get("/users", response_class=HTMLResponse)
async def render_userspage(request: Request):
    return templates.TemplateResponse(
        "users.html",
        {
            "request": request,
            "users": fake_users_db,
        },
    )