import os
import tempfile

import pytest
from sqlmodel import Session, create_engine, SQLModel

from app.models import Movie, MovieStatus


@pytest.fixture
def engine():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)
    engine.dispose()
    os.unlink(db_path)


def test_movie_table_created_and_crud(engine):
    movie = Movie(title="Inception", year=2010)
    with Session(engine) as session:
        session.add(movie)
        session.commit()
        session.refresh(movie)
        movie_id = movie.id

    with Session(engine) as session:
        retrieved = session.get(Movie, movie_id)
        assert retrieved is not None
        assert retrieved.title == "Inception"
        assert retrieved.year == 2010
        assert retrieved.status == MovieStatus.planned
        assert retrieved.rating is None
        assert retrieved.watched_at is None
