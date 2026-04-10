from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers import movies


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Movie Planner API", lifespan=lifespan)

app.include_router(movies.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
