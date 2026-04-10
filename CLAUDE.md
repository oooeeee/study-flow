# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**study-flow** is a single-user web application for managing movies to watch and tracking watched movies with ratings. It consists of a React frontend and a FastAPI backend, with SQLite for data persistence.

## Quick Commands

### Backend (Python/FastAPI)

```bash
# Install dependencies
cd backend && uv sync

# Run development server
uv run uvicorn app.main:app --reload

# Run all tests
uv run pytest

# Run specific test
uv run pytest tests/test_movies.py

# Lint and format
uv run ruff check --fix backend/
uv run ruff format backend/
```

### Frontend (React/Vite)

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

### Docker

```bash
# Run entire application stack
docker compose up --build

# Stop services
docker compose down

# Reset database (⚠️ deletes all data)
docker compose down -v
```

## Architecture

### Backend Structure

**Entry point:** `backend/app/main.py`
- FastAPI app with CORS middleware configured for localhost ports (3000, 8000, 127.0.0.1)
- Lifespan context manager creates database tables on startup
- Single router for movie endpoints at `/movies`

**Database layer:** `backend/app/database.py`
- SQLite database at `./data/app.db` (or Docker volume `db_data:/app/data`)
- SQLModel ORM for type-safe database access
- Session dependency for FastAPI endpoints

**Data models:** `backend/app/models.py`
- `Movie` table with fields: `id` (UUID), `title`, `year`, `status` (planned/watched), `rating`, `review`, `added_at`, `watched_at`
- `MovieStatus` enum defines the two states
- `utc_now()` function ensures consistent UTC timestamps

**API schemas:** `backend/app/schemas.py`
- Pydantic models for request/response validation
- Separate create/read models for request/response types

**Routers:** `backend/app/routers/movies.py`
- POST `/movies` — create movie
- GET `/movies?status=...` — list movies (optionally filtered)
- PATCH `/movies/{id}/watch` — mark as watched
- PATCH `/movies/{id}/rate` — set rating (1-10) and optional review
- DELETE `/movies/{id}` — delete movie

**Configuration:** `backend/app/config.py`
- Environment-based settings via Pydantic Settings
- Controls database path, app environment

### Frontend Structure

**Entry point:** `frontend/src/main.tsx` → `frontend/src/App.tsx`

**App router:** Simple client-side state-based routing
- `App.tsx` maintains current page state (watchlist/watched)
- Navigation buttons switch between pages
- No external routing library; useState manages page selection

**Pages:**
- `WatchlistPage.tsx` — displays planned movies, shows form to add new movies
- `WatchedPage.tsx` — displays watched movies with ratings, sorted by watch date

**Components:** `frontend/src/components/`
- `AddMovieForm.tsx` — form to add new movie (title, year optional)
- `WatchlistItem.tsx` — individual watchlist item with action to mark watched
- `WatchedItem.tsx` — individual watched item with display of rating/review
- `RateMovieModal.tsx` — modal for rating a movie after watching

**API client:** `frontend/src/api/client.ts`
- Centralized fetch-based API client
- `getApiUrl()` reads `VITE_API_URL` env variable (defaults to `http://localhost:8000`)
- Functions: `addMovie`, `listMovies`, `markWatched`, `rateMovie`, `deleteMovie`

**Types:** `frontend/src/api/types.ts`
- `Movie` interface matching backend model
- `AddMovieRequest`, `RateRequest` request types

### Data Flow

1. **Reading movies:** Component → `client.ts` (GET /movies) → backend query → SQLite
2. **Creating movie:** Form → `addMovie()` → POST /movies → SQLModel insert → Database
3. **Marking watched:** Component → `markWatched()` → PATCH /movies/{id}/watch → Update status/timestamp
4. **Rating:** Modal → `rateMovie()` → PATCH /movies/{id}/rate → Update rating/review

## Key Implementation Patterns

- **Backend sessions:** All endpoints use `Depends(get_session)` for database access
- **Error handling:** 404 HTTPException when movie not found; validation errors auto-handled by Pydantic
- **Timestamps:** `watched_at` only set when status changes to "watched"; uses UTC
- **Frontend state:** Component-level state with `useState` for UI state, direct API calls for data
- **Type safety:** Full TypeScript + backend Pydantic ensures request/response contracts

## Testing

- **Backend:** pytest in `backend/tests/` directory
  - `test_health.py` — health endpoint
  - `test_db.py` — database initialization
  - `test_movies.py` — CRUD operations on movies
- **Frontend:** Vitest in `frontend/src/test/` directory
  - Uses @testing-library/react for component testing

## Code Quality

- **Python:** ruff (linting + formatting) via pre-commit hooks
- **TypeScript:** ESLint + Prettier via npm scripts
- Pre-commit config at `.pre-commit-config.yaml` runs ruff on backend files before commit

## Important Notes

- **Database location:** Local dev uses `backend/data/app.db`; Docker uses volume `db_data`
- **CORS:** Limited to localhost (3000, 8000) — adjust in `main.py` if changing ports
- **Vite config:** Proxy not used; frontend directly calls API via environment variable
- **No user auth:** Single-user application; all movies are global
- **Frontend dependencies:** Minimal deps (React only); API client is custom fetch wrapper
