import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine

import app.routers.movies as movies_router_module
from app.main import app


@pytest.fixture(autouse=True)
def isolated_db(monkeypatch):
    """Override the engine used by the router with a fresh in-memory DB per test."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    test_engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(test_engine)
    monkeypatch.setattr(movies_router_module, "engine", test_engine)

    yield test_engine

    SQLModel.metadata.drop_all(test_engine)
    test_engine.dispose()
    os.unlink(db_path)


@pytest.fixture
def client():
    return TestClient(app)


# ── POST /movies ──────────────────────────────────────────────────────────────


def test_add_movie_minimal(client):
    resp = client.post("/movies", json={"title": "Inception"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Inception"
    assert data["year"] is None
    assert data["status"] == "planned"


def test_add_movie_with_year(client):
    resp = client.post("/movies", json={"title": "Dune", "year": 2021})
    assert resp.status_code == 201
    assert resp.json()["year"] == 2021


def test_add_movie_missing_title(client):
    resp = client.post("/movies", json={})
    assert resp.status_code == 422


# ── GET /movies ───────────────────────────────────────────────────────────────


def test_list_movies_empty(client):
    resp = client.get("/movies")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_movies_returns_all(client):
    client.post("/movies", json={"title": "A"})
    client.post("/movies", json={"title": "B"})
    resp = client.get("/movies")
    assert len(resp.json()) == 2


def test_list_movies_filter_planned(client):
    add_resp = client.post("/movies", json={"title": "A"})
    movie_id = add_resp.json()["id"]
    client.post("/movies", json={"title": "B"})
    client.patch(f"/movies/{movie_id}/watch")

    resp = client.get("/movies?status=planned")
    titles = [m["title"] for m in resp.json()]
    assert "B" in titles
    assert "A" not in titles


def test_list_movies_filter_watched(client):
    add_resp = client.post("/movies", json={"title": "A"})
    movie_id = add_resp.json()["id"]
    client.patch(f"/movies/{movie_id}/watch")

    resp = client.get("/movies?status=watched")
    assert len(resp.json()) == 1
    assert resp.json()[0]["title"] == "A"


# ── PATCH /movies/{id}/watch ──────────────────────────────────────────────────


def test_mark_watched(client):
    add_resp = client.post("/movies", json={"title": "Interstellar"})
    movie_id = add_resp.json()["id"]

    resp = client.patch(f"/movies/{movie_id}/watch")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "watched"
    assert data["watched_at"] is not None


def test_mark_watched_not_found(client):
    resp = client.patch("/movies/00000000-0000-0000-0000-000000000000/watch")
    assert resp.status_code == 404


# ── PATCH /movies/{id}/rate ───────────────────────────────────────────────────


def test_rate_movie(client):
    add_resp = client.post("/movies", json={"title": "Matrix"})
    movie_id = add_resp.json()["id"]

    resp = client.patch(
        f"/movies/{movie_id}/rate", json={"rating": 9, "review": "Great"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["rating"] == 9
    assert data["review"] == "Great"


def test_rate_movie_no_review(client):
    add_resp = client.post("/movies", json={"title": "Matrix"})
    movie_id = add_resp.json()["id"]

    resp = client.patch(f"/movies/{movie_id}/rate", json={"rating": 7})
    assert resp.status_code == 200
    assert resp.json()["review"] is None


def test_rate_movie_invalid_rating_low(client):
    add_resp = client.post("/movies", json={"title": "X"})
    movie_id = add_resp.json()["id"]
    resp = client.patch(f"/movies/{movie_id}/rate", json={"rating": 0})
    assert resp.status_code == 422


def test_rate_movie_invalid_rating_high(client):
    add_resp = client.post("/movies", json={"title": "X"})
    movie_id = add_resp.json()["id"]
    resp = client.patch(f"/movies/{movie_id}/rate", json={"rating": 11})
    assert resp.status_code == 422


def test_rate_movie_not_found(client):
    resp = client.patch(
        "/movies/00000000-0000-0000-0000-000000000000/rate", json={"rating": 5}
    )
    assert resp.status_code == 404


# ── DELETE /movies/{id} ───────────────────────────────────────────────────────


def test_delete_movie(client):
    add_resp = client.post("/movies", json={"title": "Delete Me"})
    movie_id = add_resp.json()["id"]

    resp = client.delete(f"/movies/{movie_id}")
    assert resp.status_code == 204

    list_resp = client.get("/movies")
    assert list_resp.json() == []


def test_delete_movie_not_found(client):
    resp = client.delete("/movies/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404
