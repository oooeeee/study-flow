# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**study-flow** is a movie watchlist app — a full-stack project with a Python/FastAPI backend and React/TypeScript frontend, orchestrated via Docker Compose.

## Commands

### Backend (Python + FastAPI)

```bash
cd backend
uv sync --all-groups                          # Install dependencies including dev
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # Dev server
uv run pytest                                 # Run all tests
uv run pytest tests/test_movies.py::test_name # Run a single test
ruff check .                                  # Lint
ruff format .                                 # Format
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # TypeScript compile + Vite bundle
npm run test       # Vitest (watch mode)
npm run test -- --run  # Vitest (single run)
```

### Docker (full stack)

```bash
docker compose up --build   # Start backend (:8000) + frontend (:3000)
docker compose down         # Stop and remove containers
```

### Pre-commit

```bash
pre-commit install           # Install hooks (first time)
pre-commit run --all-files   # Run all hooks manually
```

## Architecture

### Backend (`backend/`)

FastAPI app with SQLModel ORM backed by SQLite.

- `app/main.py` — app setup, CORS config, lifespan handler
- `app/models.py` — `Movie` SQLModel (UUID PK, status enum: `planned`|`watched`)
- `app/schemas.py` — Pydantic request/response schemas (`MovieCreate`, `MovieRead`, etc.)
- `app/routers/movies.py` — all routes: CRUD + `PATCH /movies/{id}/watch` + `PATCH /movies/{id}/rate`
- `app/config.py` — settings (DB path via env var)
- `app/database.py` — engine creation and table init

API docs available at `http://localhost:8000/docs`.

### Frontend (`frontend/src/`)

React 19 SPA with tab-based navigation (Watchlist / Watched).

- `api/client.ts` — fetch-based HTTP client; reads `VITE_API_URL` env var
- `api/types.ts` — TypeScript types mirroring backend schemas
- `pages/` — `WatchlistPage` (planned movies) and `WatchedPage` (rated movies)
- `components/` — `AddMovieForm`, `WatchlistItem`, `WatchedItem`, `RateMovieModal`

### Data Flow

Movies start as `planned` (POST `/movies`), get marked watched (`PATCH /movies/{id}/watch`), then optionally rated 1–10 with a review (`PATCH /movies/{id}/rate`).

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.13, FastAPI, SQLModel, SQLite |
| Frontend | React 19, TypeScript, Vite |
| Testing | Pytest (backend), Vitest + React Testing Library (frontend) |
| Linting | Ruff (Python), ESLint + Prettier (TypeScript) |
| Infrastructure | Docker Compose, uv (Python package manager) |
