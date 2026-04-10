import uuid
from datetime import datetime

import pytest
from sqlmodel import Session, SQLModel, create_engine, select

from app.models import Movie, MovieStatus


@pytest.fixture
def engine():
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(eng)
    yield eng
    SQLModel.metadata.drop_all(eng)


def test_movie_table_exists(engine):
    assert "movie" in SQLModel.metadata.tables


def test_insert_and_retrieve_movie(engine):
    movie = Movie(title="Inception", year=2010)
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)

    with Session(engine) as session:
        result = session.exec(select(Movie)).all()
        assert len(result) == 1
        fetched = result[0]
        assert fetched.title == "Inception"
        assert fetched.year == 2010
        assert fetched.status == MovieStatus.planned
        assert fetched.rating is None
        assert fetched.review is None
        assert fetched.watched_at is None
        assert isinstance(fetched.added_at, datetime)
        assert isinstance(fetched.id, uuid.UUID)


def test_movie_watched_fields(engine):
    movie = Movie(
        title="The Matrix",
        year=1999,
        status=MovieStatus.watched,
        rating=9,
        review="Great film",
        watched_at=datetime(2024, 1, 15),
    )
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)

    with Session(engine) as session:
        fetched = session.exec(select(Movie)).first()
        assert fetched.status == MovieStatus.watched
        assert fetched.rating == 9
        assert fetched.review == "Great film"
        assert fetched.watched_at == datetime(2024, 1, 15)
