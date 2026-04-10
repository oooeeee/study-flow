# MVP Implementation — Movie Planning & Rating

## Overview

Implement the full Iteration 1 MVP as described in `docs/iteration-1-mvp.md`:
a single-user web app where users plan movies to watch and rate watched movies.
The stack is Python 3.13 + FastAPI (backend), React + Vite + TypeScript (frontend),
SQLite (database), all wired together with Docker Compose.

## Context (from discovery)

- MVP spec: `docs/iteration-1-mvp.md`
- Repo is currently empty (only README.md)
- No existing code — greenfield implementation

## Development Approach

- **Testing approach:** Regular (code first, then tests)
- Complete each task fully before moving to the next
- Make small, focused changes
- **CRITICAL: every task MUST include tests** for code changes in that task
- **CRITICAL: all tests must pass before starting next task**
- Run tests after each change

## Testing Strategy

- **Backend:** pytest (via uv run pytest)
- **Frontend:** Vitest (unit), no e2e in MVP

## Progress Tracking

- Mark completed items with `[x]` immediately when done
- Add newly discovered tasks with ➕ prefix
- Document issues/blockers with ⚠️ prefix

---

## Implementation Steps

### Task 1: Repo scaffolding — ignore files & pre-commit

- [x] create root `.gitignore` covering Python (`__pycache__`, `.venv`, `*.pyc`, `*.db`), Node (`node_modules`, `dist`), editor files, `.env`
- [x] create root `.dockerignore` covering `.git`, `.venv`, `node_modules`, `__pycache__`, `*.pyc`, `*.db`, `.env`, test artifacts
- [x] install `pre-commit` (add to dev deps) and create `.pre-commit-config.yaml`:
  - ruff hook (lint + format) for `backend/`
  - eslint hook for `frontend/`
  - prettier hook for `frontend/`
- [x] run `pre-commit install` to verify config is valid
- [x] commit scaffold — clean working tree

---

### Task 2: Backend — project setup with uv + FastAPI skeleton

- [x] create `backend/` directory; run `uv init` inside it (Python 3.13)
- [x] add dependencies: `fastapi`, `uvicorn[standard]`, `sqlmodel`, `pydantic>=2`, `pydantic-settings`, `python-multipart`
- [x] add dev dependencies: `pytest`, `httpx`, `ruff`
- [x] create `backend/app/__init__.py` and `backend/app/main.py` with a minimal FastAPI app (`GET /health` → `{"status": "ok"}`)
- [x] create `backend/Dockerfile` (Python 3.13-slim, uv sync, `uvicorn app.main:app --host 0.0.0.0 --port 8000`)
- [x] create `backend/.dockerignore` (`.venv`, `__pycache__`, `*.pyc`, `tests/`, `*.db`)
- [x] write test: `tests/test_health.py` — GET /health returns 200
- [x] run `uv run pytest` — must pass

---

### Task 3: Backend — SQLite database & Movie model

- [x] create `backend/app/config.py`: Pydantic `BaseSettings` class with `db_path` (default `/app/data/movies.db`) and `app_env` fields — reads from env vars automatically
- [x] create `backend/app/database.py`: SQLModel engine built from `settings.db_path`; `create_db_and_tables()` called on startup
- [x] create `backend/app/models.py`: `MovieStatus` enum (`planned`/`watched`) and `Movie` SQLModel table with all fields from the MVP data model
- [x] wire `create_db_and_tables()` into FastAPI `lifespan` in `main.py`
- [x] write test: DB creates the `movie` table and a `Movie` instance can be inserted and retrieved
- [x] run `uv run pytest` — must pass

---

### Task 4: Backend — CRUD API endpoints

- [x] create `backend/app/routers/movies.py` with:
  - `POST /movies` — add movie (title required, year optional) → returns created movie
  - `GET /movies` — list all movies (optional `?status=planned|watched` filter)
  - `PATCH /movies/{id}/watch` — mark as watched (sets `status`, `watched_at`)
  - `PATCH /movies/{id}/rate` — set rating (1–10) + optional review
  - `DELETE /movies/{id}` — remove movie
- [x] create Pydantic v2 request/response schemas in `backend/app/schemas.py` (`BaseModel` subclasses for `MovieCreate`, `MovieRead`, `WatchRequest`, `RateRequest`); use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- [x] register router in `main.py`; confirm Swagger UI shows all routes at `/docs`
- [x] write tests for each endpoint (success + error cases: 404, invalid rating, etc.)
- [x] run `uv run pytest` — must pass

---

### Task 5: Docker Compose — wire backend

- [x] create root `docker-compose.yml` with `backend` service (build `./backend`, port 8000, `db_data` volume mounted at `/app/data`)
- [x] create `volumes: db_data:` block
- [x] run `docker compose up --build` and verify `GET http://localhost:8000/health` returns 200 and Swagger UI loads at `http://localhost:8000/docs` (manual test - docker compose not available in CI environment)

---

### Task 6: Frontend — project setup (React + Vite + TypeScript)

- [x] scaffold `frontend/` with `npm create vite@latest . -- --template react-ts`
- [x] install deps: `npm install`
- [x] add dev deps: `eslint`, `prettier`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] create `frontend/eslint.config.js` (TypeScript + prettier rules, ESLint 9 flat config) and `frontend/.prettierrc`
- [x] create `frontend/.dockerignore` (`node_modules`, `dist`, `.env`)
- [x] create `frontend/Dockerfile` (node:20-alpine, `npm ci`, `npm run build`, serve with `serve -s dist`)
- [x] write a smoke test: `App` component renders without crashing
- [x] run `npm run test` — must pass

---

### Task 7: Frontend — API client & types

- [x] create `frontend/src/api/types.ts` — TypeScript interfaces mirroring backend schemas (`Movie`, `MovieStatus`, `AddMovieRequest`, `RateMovieRequest`)
- [x] create `frontend/src/api/client.ts` — typed fetch functions: `addMovie`, `listMovies`, `markWatched`, `rateMovie`, `deleteMovie`; base URL from `VITE_API_URL` env var (default `http://localhost:8000`)
- [x] write unit tests for client (mock fetch, verify correct URL + method + body for each function)
- [x] run `npm run test` — must pass

---

### Task 8: Frontend — Watchlist view (planned movies)

- [x] create `frontend/src/components/AddMovieForm.tsx` — controlled form with title + year fields, calls `addMovie` on submit, clears on success
- [x] create `frontend/src/components/WatchlistItem.tsx` — shows title/year, "Mark as watched" button
- [x] create `frontend/src/pages/WatchlistPage.tsx` — fetches `?status=planned`, renders `AddMovieForm` + list of `WatchlistItem`
- [x] write component tests: form renders, submit calls API; list renders items; "Mark as watched" button triggers callback
- [x] run `npm run test` — must pass

---

### Task 9: Frontend — Rate Movie modal

- [x] create `frontend/src/components/RateMovieModal.tsx` — appears after "Mark as watched" click; rating picker (1–10), optional review textarea, Save/Cancel buttons; calls `markWatched` then `rateMovie`
- [x] integrate modal into `WatchlistItem` (show on button click, refetch list on save)
- [x] write component tests: modal renders with correct props; save calls API with rating; cancel closes without API call
- [x] run `npm run test` — must pass

---

### Task 10: Frontend — Watched list view

- [ ] create `frontend/src/components/WatchedItem.tsx` — shows title/year, rating (stars or number), review text
- [ ] create `frontend/src/pages/WatchedPage.tsx` — fetches `?status=watched`, renders list sorted by `watched_at` desc
- [ ] add simple tab/nav between Watchlist and Watched pages in `App.tsx`
- [ ] write component tests: list renders items with rating; empty state message when no watched movies
- [ ] run `npm run test` — must pass

---

### Task 11: Docker Compose — add frontend service

- [ ] add `frontend` service to `docker-compose.yml` (build `./frontend`, port 3000, `depends_on: backend`)
- [ ] add `VITE_API_URL` build arg / env var in compose pointing to `http://localhost:8000`
- [ ] run `docker compose up --build` — verify both services start, app loads at `http://localhost:3000`

---

### Task 12: Verify acceptance criteria

- [ ] add a movie → appears in Watchlist
- [ ] mark as watched + rate → movie moves to Watched list with score
- [ ] stop containers (`docker compose down`), restart (`docker compose up`) → data still present
- [ ] Swagger UI accessible at `http://localhost:8000/docs`
- [ ] `docker compose up` starts everything with no manual steps
- [ ] run `uv run pytest` in `backend/` — all pass
- [ ] run `npm run test` in `frontend/` — all pass
- [ ] run `pre-commit run --all-files` — no violations

---

### Task 13: [Final] Update documentation

- [ ] update root `README.md`: prerequisites, `docker compose up` quickstart, URLs (app, Swagger), dev setup for backend and frontend
- [ ] verify `docs/iteration-1-mvp.md` matches what was actually built; update if anything changed

---

## Technical Details

**Directory layout:**
```
study-flow/
├── .gitignore
├── .dockerignore
├── .pre-commit-config.yaml
├── docker-compose.yml
├── README.md
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── pyproject.toml          # uv managed
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       └── movies.py
│   └── tests/
│       ├── test_health.py
│       ├── test_db.py
│       └── test_movies.py
└── frontend/
    ├── .dockerignore
    ├── Dockerfile
    ├── .eslintrc.cjs
    ├── .prettierrc
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/
        │   ├── client.ts
        │   └── types.ts
        ├── components/
        │   ├── AddMovieForm.tsx
        │   ├── WatchlistItem.tsx
        │   ├── WatchedItem.tsx
        │   └── RateMovieModal.tsx
        └── pages/
            ├── WatchlistPage.tsx
            └── WatchedPage.tsx
```

**Key API routes:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/movies` | Add movie |
| GET | `/movies?status=planned\|watched` | List movies |
| PATCH | `/movies/{id}/watch` | Mark as watched |
| PATCH | `/movies/{id}/rate` | Set rating + review |
| DELETE | `/movies/{id}` | Remove movie |

**Environment variables:**
- `VITE_API_URL` — frontend → backend base URL (default `http://localhost:8000`)

## Post-Completion

**Manual verification:**
- Test full user flow end-to-end in a browser
- Verify Swagger UI correctly documents all endpoints
- Confirm data survives `docker compose down && docker compose up`

*Note: ralphex automatically moves completed plans to `docs/plans/completed/`*
