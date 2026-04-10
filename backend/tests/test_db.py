import os
import tempfile
from datetime import datetime

import pytest
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from app.models import Movie, MovieStatus


@pytest.fixture
def temp_db():
    """Create a temporary SQLite database for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test.db")
        engine = create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        from app.models import SQLModel

        SQLModel.metadata.create_all(engine)
        yield engine


def test_create_movie_table(temp_db):
    """Test that the movie table is created."""
    with Session(temp_db) as session:
        movie = Movie(title="The Shawshank Redemption", year=1994)
        session.add(movie)
        session.commit()
        session.refresh(movie)

        assert movie.id is not None
        assert movie.title == "The Shawshank Redemption"
        assert movie.year == 1994
        assert movie.status == MovieStatus.planned
        assert movie.rating is None
        assert movie.review is None
        assert isinstance(movie.added_at, datetime)
        assert movie.watched_at is None


def test_insert_and_retrieve_movie(temp_db):
    """Test inserting and retrieving a movie."""
    with Session(temp_db) as session:
        movie = Movie(
            title="Inception",
            year=2010,
            status=MovieStatus.watched,
            rating=9,
            review="Mind-bending masterpiece",
        )
        session.add(movie)
        session.commit()
        session.refresh(movie)
        movie_id = movie.id

    with Session(temp_db) as session:
        retrieved = session.get(Movie, movie_id)
        assert retrieved is not None
        assert retrieved.title == "Inception"
        assert retrieved.year == 2010
        assert retrieved.status == MovieStatus.watched
        assert retrieved.rating == 9
        assert retrieved.review == "Mind-bending masterpiece"


def test_movie_status_enum():
    """Test that MovieStatus enum works correctly."""
    assert MovieStatus.planned.value == "planned"
    assert MovieStatus.watched.value == "watched"
