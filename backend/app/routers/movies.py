from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import Movie, MovieStatus, utc_now
from app.schemas import MovieCreate, MovieRead, RateRequest

router = APIRouter(prefix="/movies", tags=["movies"])


@router.post("", response_model=MovieRead)
def create_movie(
    movie_create: MovieCreate,
    session: Session = Depends(get_session),
) -> MovieRead:
    """Add a new movie to the watchlist."""
    db_movie = Movie(**movie_create.model_dump())
    session.add(db_movie)
    session.commit()
    session.refresh(db_movie)
    return db_movie


@router.get("", response_model=list[MovieRead])
def list_movies(
    status: Optional[MovieStatus] = Query(None),
    session: Session = Depends(get_session),
) -> list[MovieRead]:
    """List all movies, optionally filtered by status."""
    query = select(Movie)
    if status:
        query = query.where(Movie.status == status)
    movies = session.exec(query).all()
    return movies


@router.patch("/{movie_id}/watch", response_model=MovieRead)
def mark_as_watched(
    movie_id: UUID,
    session: Session = Depends(get_session),
) -> MovieRead:
    """Mark a movie as watched."""
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie.status = MovieStatus.watched
    movie.watched_at = utc_now()
    session.add(movie)
    session.commit()
    session.refresh(movie)
    return movie


@router.patch("/{movie_id}/rate", response_model=MovieRead)
def rate_movie(
    movie_id: UUID,
    rate_request: RateRequest,
    session: Session = Depends(get_session),
) -> MovieRead:
    """Set a rating and optional review for a movie."""
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie.rating = rate_request.rating
    if rate_request.review:
        movie.review = rate_request.review
    session.add(movie)
    session.commit()
    session.refresh(movie)
    return movie


@router.delete("/{movie_id}", status_code=204)
def delete_movie(
    movie_id: UUID,
    session: Session = Depends(get_session),
) -> None:
    """Delete a movie from the database."""
    movie = session.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    session.delete(movie)
    session.commit()
