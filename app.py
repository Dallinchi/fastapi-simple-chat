from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

from api import router as api_router
from views import router as views_router
import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(views_router)
app.include_router(api_router)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.absolute() / "static"),
    name="static",
)

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response
