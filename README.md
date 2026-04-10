# study-flow

A minimal web app where users can plan movies they want to watch and rate movies they have watched.

## Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (for containerized setup)
  - Alternatively: Python 3.13, Node.js 20+, npm (for local development)

### Run with Docker Compose

```bash
docker compose up --build
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API Swagger UI:** http://localhost:8000/docs

Data is persisted in a Docker volume (`db_data`), so it survives container restarts.

### Stop Services

```bash
docker compose down
```

---

## Local Development Setup

### Backend Setup (Python + FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies using `uv`:
   ```bash
   uv sync
   ```

3. Run the FastAPI server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```
   The API is available at http://localhost:8000; Swagger UI at http://localhost:8000/docs

4. Run tests:
   ```bash
   uv run pytest
   ```

### Frontend Setup (React + Vite + TypeScript)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set the API base URL (optional; defaults to `http://localhost:8000`):
   ```bash
   export VITE_API_URL=http://localhost:8000
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```
   The app is available at http://localhost:5173

5. Run tests:
   ```bash
   npm run test
   ```

6. Lint and format:
   ```bash
   npm run lint
   ```

---

## Project Structure

```
study-flow/
├── .gitignore
├── .dockerignore
├── .pre-commit-config.yaml    # Git hooks for linting
├── docker-compose.yml         # Service orchestration
├── README.md                  # This file
├── docs/
│   └── iteration-1-mvp.md    # MVP specification
├── backend/                   # Python + FastAPI
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings (db path, env)
│   │   ├── database.py       # SQLite engine setup
│   │   ├── models.py         # SQLModel ORM models
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   └── routers/
│   │       └── movies.py     # Movie API endpoints
│   └── tests/                # pytest test suite
│       ├── test_health.py
│       ├── test_db.py
│       └── test_movies.py
└── frontend/                  # React + Vite + TypeScript
    ├── Dockerfile
    ├── .dockerignore
    ├── .eslintrc.cjs         # ESLint config
    ├── .prettierrc            # Prettier config
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/
        │   ├── client.ts      # Typed API client
        │   └── types.ts       # TypeScript interfaces
        ├── components/
        │   ├── AddMovieForm.tsx
        │   ├── WatchlistItem.tsx
        │   ├── WatchedItem.tsx
        │   └── RateMovieModal.tsx
        └── pages/
            ├── WatchlistPage.tsx
            └── WatchedPage.tsx
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/movies` | Add a movie |
| GET | `/movies?status=planned\|watched` | List movies (optionally filtered by status) |
| PATCH | `/movies/{id}/watch` | Mark a movie as watched |
| PATCH | `/movies/{id}/rate` | Set rating (1–10) and optional review |
| DELETE | `/movies/{id}` | Remove a movie |

Full API documentation is available at http://localhost:8000/docs when the backend is running.

---

## Features

### MVP (Iteration 1)

- ✅ Add movies to a personal watchlist
- ✅ Mark movies as watched
- ✅ Rate watched movies (1–10) with optional review
- ✅ View all planned movies in a watchlist
- ✅ View all watched movies sorted by date, with ratings
- ✅ Data persisted in SQLite (survives container restarts)
- ✅ Single-user web interface
- ✅ Full REST API with Swagger documentation

### Out of Scope

- User authentication / multiple users
- Movie metadata from external APIs (posters, genres, cast)
- Social features (sharing, following)
- Advanced filtering / search
- Import/export

---

## Tech Stack

- **Backend:** Python 3.13, FastAPI, SQLModel, Pydantic v2, SQLite
- **Frontend:** React, Vite, TypeScript
- **Testing:** pytest (backend), Vitest (frontend)
- **Infrastructure:** Docker, Docker Compose
- **Code quality:** ruff (Python), ESLint + Prettier (TypeScript), pre-commit hooks

---

## Development Workflow

1. Make code changes in `backend/` or `frontend/`
2. Run tests:
   - Backend: `cd backend && uv run pytest`
   - Frontend: `cd frontend && npm run test`
3. Pre-commit hooks automatically lint and format on `git commit`
4. Submit PR for review

---

## Troubleshooting

### Backend won't start

- Check that port 8000 is available
- Verify Python 3.13 and `uv` are installed: `uv --version`
- Check logs: `docker compose logs backend`

### Frontend won't connect to backend

- Verify the backend is running: `curl http://localhost:8000/health`
- Check the API base URL in `frontend/.env` or the `VITE_API_URL` environment variable
- Default backend URL: `http://localhost:8000`

### Database issues

- SQLite database file is stored in a Docker volume (`db_data`)
- To reset: `docker compose down -v` (⚠️ deletes all data)

---

## License

(Add your license here if applicable)