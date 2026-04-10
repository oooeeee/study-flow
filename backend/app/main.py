from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers.movies import router as movies_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Movie Planner", lifespan=lifespan)

app.include_router(movies_router)


@app.get("/health")
def health():
    return {"status": "ok"}
