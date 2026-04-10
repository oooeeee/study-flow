import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class MovieStatus(str, Enum):
    planned = "planned"
    watched = "watched"


class Movie(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    year: Optional[int] = None
    status: MovieStatus = MovieStatus.planned
    rating: Optional[int] = None
    review: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)
    watched_at: Optional[datetime] = None
