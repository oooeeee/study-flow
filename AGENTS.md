# AGENTS.md — Study-Flow

Single-user movie watchlist app. Users add movies, mark them watched, and rate them. No auth, no external APIs.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.12, FastAPI, SQLModel, SQLite, Uvicorn |
| Frontend | TypeScript, React 19, Vite, plain CSS |
| Testing | pytest (backend), Vitest + React Testing Library (frontend) |
| Quality | ruff (Python), ESLint 9 + Prettier (TS) |
| Infra | Docker Compose, named volume for SQLite persistence |

## Commands

### Backend
```bash
cd backend
uv sync --all-groups          # install deps
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run pytest                 # run all tests (18 tests)
uv run ruff check .           # lint
uv run ruff format .          # format
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # dev server on :5173
npm run build
npm run test                  # run all tests (40+ tests)
npm run lint                  # ESLint check
```

### Full stack
```bash
docker compose up --build     # http://localhost:3000 (UI), http://localhost:8000/docs (Swagger)
docker compose down
pre-commit run --all-files    # ruff + ESLint + Prettier
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/movies` | Add movie `{title, year?}` → 201 |
| GET | `/movies?status=planned\|watched` | List movies |
| PATCH | `/movies/{id}/watch` | Mark watched |
| PATCH | `/movies/{id}/rate` | Rate `{rating: 1-10, review?}` |
| DELETE | `/movies/{id}` | Delete → 204 |

## Architecture

### Backend layers
- `app/main.py` — FastAPI app, CORS, router registration, lifespan startup
- `app/config.py` — Pydantic BaseSettings (`DB_PATH` env var)
- `app/database.py` — SQLModel engine, `create_db_and_tables()`
- `app/models.py` — `Movie` ORM table, `MovieStatus` enum
- `app/schemas.py` — `MovieCreate`, `MovieRead`, `RateRequest` DTOs
- `app/routers/movies.py` — CRUD endpoint handlers

### Frontend layers
- `src/pages/` — smart components: fetch data, manage state, own `useEffect`
- `src/components/` — presentational: render UI, fire callbacks
- `src/api/client.ts` — typed fetch wrappers; base URL from `VITE_API_URL`
- `src/api/types.ts` — TypeScript interfaces mirroring backend schemas

### Data flow pattern
Pages fetch on mount → pass data + `onXxx` callbacks to child components → components call API → invoke callback → page refetches.

### Testing patterns
- **Backend:** monkeypatch engine to in-memory SQLite per test; use `TestClient`; fixtures for setup/teardown
- **Frontend:** vitest.mock for API calls; React Testing Library (user-centric); no e2e in MVP

## Key conventions

- SQLModel: `Movie` is both ORM entity and Pydantic model; `MovieRead` uses `from_attributes=True`
- HTTP status codes: 201 (create), 204 (delete), 404 (not found), 422 (validation)
- Frontend state: `useState`/`useEffect` only — no Redux, Zustand, or Context
- No loading states in `api/client.ts` — pages own loading/error state
- Watched list sorted client-side by `watched_at` descending
- SQLite stored at `/app/data/movies.db` in container (Docker volume `db_data`)

## Docs
- `docs/iteration-1-mvp.md` — spec, user stories, data model, out-of-scope items
- `docs/plans/completed/` — completed implementation plans
