from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class MovieStatus(str, Enum):
    planned = "planned"
    watched = "watched"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Movie(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str
    year: Optional[int] = None
    status: MovieStatus = MovieStatus.planned
    rating: Optional[int] = None
    review: Optional[str] = None
    added_at: datetime = Field(default_factory=utc_now)
    watched_at: Optional[datetime] = None
