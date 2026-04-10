from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models import MovieStatus


class MovieCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    year: Optional[int] = Field(None, ge=1800, le=9999)

    model_config = {"from_attributes": True}


class MovieRead(BaseModel):
    id: UUID
    title: str
    year: Optional[int]
    status: MovieStatus
    rating: Optional[int]
    review: Optional[str]
    added_at: datetime
    watched_at: Optional[datetime]

    model_config = {"from_attributes": True}


class WatchRequest(BaseModel):
    model_config = {"from_attributes": True}


class RateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=10)
    review: Optional[str] = Field(None, max_length=1000)

    model_config = {"from_attributes": True}
