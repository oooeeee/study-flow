import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import MovieStatus


class MovieCreate(BaseModel):
    title: str
    year: Optional[int] = None


class MovieRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    year: Optional[int]
    status: MovieStatus
    rating: Optional[int]
    review: Optional[str]
    added_at: datetime
    watched_at: Optional[datetime]


class WatchRequest(BaseModel):
    pass


class RateRequest(BaseModel):
    rating: int
    review: Optional[str] = None
