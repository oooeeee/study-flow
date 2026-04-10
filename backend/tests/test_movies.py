from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a TestClient with the in-memory session."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_create_movie_minimal(client: TestClient):
    """Test creating a movie with only title."""
    response = client.post("/movies", json={"title": "The Matrix"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "The Matrix"
    assert data["year"] is None
    assert data["status"] == "planned"
    assert data["rating"] is None
    assert data["review"] is None
    assert "id" in data
    assert "added_at" in data


def test_create_movie_with_year(client: TestClient):
    """Test creating a movie with title and year."""
    response = client.post("/movies", json={"title": "Inception", "year": 2010})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Inception"
    assert data["year"] == 2010
    assert data["status"] == "planned"


def test_create_movie_missing_title(client: TestClient):
    """Test that title is required."""
    response = client.post("/movies", json={"year": 2010})
    assert response.status_code == 422


def test_create_movie_invalid_year(client: TestClient):
    """Test that year must be in valid range."""
    response = client.post("/movies", json={"title": "Test", "year": 500})
    assert response.status_code == 422


def test_list_movies_empty(client: TestClient):
    """Test listing movies when none exist."""
    response = client.get("/movies")
    assert response.status_code == 200
    assert response.json() == []


def test_list_movies_multiple(client: TestClient):
    """Test listing multiple movies."""
    client.post("/movies", json={"title": "Movie 1"})
    client.post("/movies", json={"title": "Movie 2"})
    client.post("/movies", json={"title": "Movie 3"})

    response = client.get("/movies")
    assert response.status_code == 200
    movies = response.json()
    assert len(movies) == 3
    assert movies[0]["title"] == "Movie 1"
    assert movies[1]["title"] == "Movie 2"
    assert movies[2]["title"] == "Movie 3"


def test_list_movies_filter_by_status_planned(client: TestClient):
    """Test filtering movies by planned status."""
    # Create movies
    movie1 = client.post("/movies", json={"title": "Movie 1"}).json()
    client.post("/movies", json={"title": "Movie 2"})
    client.post("/movies", json={"title": "Movie 3"})

    # Mark one as watched
    client.patch(f"/movies/{movie1['id']}/watch")

    # Filter by planned status
    response = client.get("/movies?status=planned")
    assert response.status_code == 200
    movies = response.json()
    assert len(movies) == 2
    assert all(m["status"] == "planned" for m in movies)


def test_list_movies_filter_by_status_watched(client: TestClient):
    """Test filtering movies by watched status."""
    # Create and watch a movie
    movie = client.post("/movies", json={"title": "Movie 1"}).json()
    client.patch(f"/movies/{movie['id']}/watch")

    # Filter by watched status
    response = client.get("/movies?status=watched")
    assert response.status_code == 200
    movies = response.json()
    assert len(movies) == 1
    assert movies[0]["status"] == "watched"
    assert movies[0]["watched_at"] is not None


def test_mark_as_watched(client: TestClient):
    """Test marking a movie as watched."""
    movie = client.post("/movies", json={"title": "The Dark Knight"}).json()
    movie_id = movie["id"]

    response = client.patch(f"/movies/{movie_id}/watch")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "watched"
    assert data["watched_at"] is not None


def test_mark_as_watched_not_found(client: TestClient):
    """Test marking non-existent movie as watched."""
    fake_id = str(uuid4())
    response = client.patch(f"/movies/{fake_id}/watch")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_rate_movie(client: TestClient):
    """Test rating a movie."""
    movie = client.post("/movies", json={"title": "Interstellar"}).json()
    movie_id = movie["id"]

    response = client.patch(
        f"/movies/{movie_id}/rate",
        json={"rating": 9, "review": "Amazing movie!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 9
    assert data["review"] == "Amazing movie!"


def test_rate_movie_no_review(client: TestClient):
    """Test rating a movie without a review."""
    movie = client.post("/movies", json={"title": "Dune"}).json()
    movie_id = movie["id"]

    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 8})
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 8
    assert data["review"] is None


def test_rate_movie_invalid_rating_too_low(client: TestClient):
    """Test that rating must be >= 1."""
    movie = client.post("/movies", json={"title": "Test"}).json()
    movie_id = movie["id"]

    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 0})
    assert response.status_code == 422


def test_rate_movie_invalid_rating_too_high(client: TestClient):
    """Test that rating must be <= 10."""
    movie = client.post("/movies", json={"title": "Test"}).json()
    movie_id = movie["id"]

    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 11})
    assert response.status_code == 422


def test_rate_movie_not_found(client: TestClient):
    """Test rating non-existent movie."""
    fake_id = str(uuid4())
    response = client.patch(
        f"/movies/{fake_id}/rate",
        json={"rating": 5},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_movie(client: TestClient):
    """Test deleting a movie."""
    movie = client.post("/movies", json={"title": "Delete Me"}).json()
    movie_id = movie["id"]

    response = client.delete(f"/movies/{movie_id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = client.get("/movies")
    movies = response.json()
    assert len(movies) == 0


def test_delete_movie_not_found(client: TestClient):
    """Test deleting non-existent movie."""
    fake_id = str(uuid4())
    response = client.delete(f"/movies/{fake_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_full_workflow(client: TestClient):
    """Test complete workflow: create -> watch -> rate -> list."""
    # Create a movie
    create_response = client.post(
        "/movies",
        json={"title": "Inception", "year": 2010},
    )
    movie = create_response.json()
    movie_id = movie["id"]

    # Verify it's in planned status
    list_response = client.get("/movies?status=planned")
    planned_movies = list_response.json()
    assert len(planned_movies) == 1
    assert planned_movies[0]["title"] == "Inception"

    # Mark as watched
    watch_response = client.patch(f"/movies/{movie_id}/watch")
    watched_movie = watch_response.json()
    assert watched_movie["status"] == "watched"
    assert watched_movie["watched_at"] is not None

    # Rate the movie
    rate_response = client.patch(
        f"/movies/{movie_id}/rate",
        json={"rating": 9, "review": "Mind-bending!"},
    )
    rated_movie = rate_response.json()
    assert rated_movie["rating"] == 9
    assert rated_movie["review"] == "Mind-bending!"

    # Verify it's in watched status now
    list_watched = client.get("/movies?status=watched")
    watched_list = list_watched.json()
    assert len(watched_list) == 1
    assert watched_list[0]["rating"] == 9
