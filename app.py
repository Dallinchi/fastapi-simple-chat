from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from api import router as api_router
from views import router as views_router

app = FastAPI()
app.include_router(views_router)
app.include_router(api_router)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.absolute() / "static"),
    name="static",
)