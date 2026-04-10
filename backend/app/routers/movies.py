import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import engine
from app.models import Movie, MovieStatus
from app.schemas import MovieCreate, MovieRead, RateRequest

router = APIRouter(prefix="/movies", tags=["movies"])


def get_session():
    with Session(engine) as session:
        yield session


@router.post("", response_model=MovieRead, status_code=201)
def add_movie(movie_in: MovieCreate, session: Session = Depends(get_session)):
    movie = Movie(title=movie_in.title, year=movie_in.year)
    session.add(movie)
    session.commit()
    session.refresh(movie)
    return movie


@router.get("", response_model=List[MovieRead])
def list_movies(
    status: Optional[MovieStatus] = Query(None),
    session: Session = Depends(get_session),
):
    statement = select(Movie)
    if status is not None:
        statement = statement.where(Movie.status == status)
    return session.exec(statement).all()


@router.patch("/{movie_id}/watch", response_model=MovieRead)
def mark_watched(movie_id: uuid.UUID, session: Session = Depends(get_session)):
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    movie.status = MovieStatus.watched
    movie.watched_at = datetime.utcnow()
    session.add(movie)
    session.commit()
    session.refresh(movie)
    return movie


@router.patch("/{movie_id}/rate", response_model=MovieRead)
def rate_movie(
    movie_id: uuid.UUID,
    rate_in: RateRequest,
    session: Session = Depends(get_session),
):
    if not (1 <= rate_in.rating <= 10):
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 10")
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    movie.rating = rate_in.rating
    movie.review = rate_in.review
    session.add(movie)
    session.commit()
    session.refresh(movie)
    return movie


@router.delete("/{movie_id}", status_code=204)
def delete_movie(movie_id: uuid.UUID, session: Session = Depends(get_session)):
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    session.delete(movie)
    session.commit()
