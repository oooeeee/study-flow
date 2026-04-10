from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    with patch("app.main.create_db_and_tables"):
        with TestClient(app) as c:
            yield c
    app.dependency_overrides.clear()


# --- POST /movies ---


def test_add_movie_success(client: TestClient):
    response = client.post("/movies", json={"title": "Inception", "year": 2010})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Inception"
    assert data["year"] == 2010
    assert data["status"] == "planned"
    assert data["rating"] is None
    assert data["review"] is None
    assert data["watched_at"] is None
    assert "id" in data


def test_add_movie_without_year(client: TestClient):
    response = client.post("/movies", json={"title": "No Year"})
    assert response.status_code == 201
    assert response.json()["year"] is None


def test_add_movie_missing_title(client: TestClient):
    response = client.post("/movies", json={"year": 2020})
    assert response.status_code == 422


# --- GET /movies ---


def test_list_movies_empty(client: TestClient):
    response = client.get("/movies")
    assert response.status_code == 200
    assert response.json() == []


def test_list_movies_returns_all(client: TestClient):
    client.post("/movies", json={"title": "Movie A"})
    client.post("/movies", json={"title": "Movie B"})
    response = client.get("/movies")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_movies_filter_planned(client: TestClient):
    resp = client.post("/movies", json={"title": "Planned"})
    movie_id = resp.json()["id"]
    client.post("/movies", json={"title": "Also Planned"})
    # mark one as watched
    client.patch(f"/movies/{movie_id}/watch")

    response = client.get("/movies?status=planned")
    assert response.status_code == 200
    titles = [m["title"] for m in response.json()]
    assert "Also Planned" in titles
    assert "Planned" not in titles


def test_list_movies_filter_watched(client: TestClient):
    resp = client.post("/movies", json={"title": "To Watch"})
    movie_id = resp.json()["id"]
    client.post("/movies", json={"title": "Not Watched"})
    client.patch(f"/movies/{movie_id}/watch")

    response = client.get("/movies?status=watched")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "To Watch"


def test_list_movies_invalid_status(client: TestClient):
    response = client.get("/movies?status=invalid")
    assert response.status_code == 422


# --- PATCH /movies/{id}/watch ---


def test_mark_watched_success(client: TestClient):
    resp = client.post("/movies", json={"title": "Matrix"})
    movie_id = resp.json()["id"]

    response = client.patch(f"/movies/{movie_id}/watch")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "watched"
    assert data["watched_at"] is not None


def test_mark_watched_not_found(client: TestClient):
    import uuid

    response = client.patch(f"/movies/{uuid.uuid4()}/watch")
    assert response.status_code == 404


# --- PATCH /movies/{id}/rate ---


def test_rate_movie_success(client: TestClient):
    resp = client.post("/movies", json={"title": "Dune"})
    movie_id = resp.json()["id"]

    response = client.patch(
        f"/movies/{movie_id}/rate", json={"rating": 8, "review": "Epic"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 8
    assert data["review"] == "Epic"


def test_rate_movie_without_review(client: TestClient):
    resp = client.post("/movies", json={"title": "Short"})
    movie_id = resp.json()["id"]

    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 5})
    assert response.status_code == 200
    assert response.json()["rating"] == 5
    assert response.json()["review"] is None


def test_rate_movie_rating_too_low(client: TestClient):
    resp = client.post("/movies", json={"title": "Bad"})
    movie_id = resp.json()["id"]
    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 0})
    assert response.status_code == 422


def test_rate_movie_rating_too_high(client: TestClient):
    resp = client.post("/movies", json={"title": "Bad"})
    movie_id = resp.json()["id"]
    response = client.patch(f"/movies/{movie_id}/rate", json={"rating": 11})
    assert response.status_code == 422


def test_rate_movie_not_found(client: TestClient):
    import uuid

    response = client.patch(f"/movies/{uuid.uuid4()}/rate", json={"rating": 7})
    assert response.status_code == 404


def test_rate_movie_missing_rating(client: TestClient):
    resp = client.post("/movies", json={"title": "Film"})
    movie_id = resp.json()["id"]
    response = client.patch(f"/movies/{movie_id}/rate", json={})
    assert response.status_code == 422


# --- DELETE /movies/{id} ---


def test_delete_movie_success(client: TestClient):
    resp = client.post("/movies", json={"title": "Delete Me"})
    movie_id = resp.json()["id"]

    response = client.delete(f"/movies/{movie_id}")
    assert response.status_code == 204

    # confirm it's gone
    list_resp = client.get("/movies")
    assert all(m["id"] != movie_id for m in list_resp.json())


def test_delete_movie_not_found(client: TestClient):
    import uuid

    response = client.delete(f"/movies/{uuid.uuid4()}")
    assert response.status_code == 404
