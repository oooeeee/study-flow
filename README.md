# study-flow

A single-user web app for planning movies to watch and rating movies you've watched.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (v2)
- For local development: [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python), [Node.js](https://nodejs.org/) 20+

## Quickstart

```bash
docker compose up --build
```

- App: http://localhost:3000
- API (Swagger UI): http://localhost:8000/docs

Data is stored in a named Docker volume (`db_data`) and survives container restarts.

To stop and remove containers (data is preserved):

```bash
docker compose down
```

## What it does

- Add movies to your watchlist (title + optional year)
- Mark movies as watched and rate them (1–10) with an optional review
- View your watchlist (planned movies) and watched list (sorted by watch date)

## Local Development

### Backend (Python 3.13 + FastAPI)

```bash
cd backend

# Install dependencies (creates .venv automatically)
uv sync --group dev

# Run the dev server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest
```

The API runs at http://localhost:8000. Swagger UI is at http://localhost:8000/docs.

Environment variables (all optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `/app/data/movies.db` | Path to the SQLite database file |

### Frontend (React + Vite + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server (proxies API to localhost:8000)
VITE_API_URL=http://localhost:8000 npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

The app runs at http://localhost:5173 in dev mode.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/movies` | Add a movie |
| GET | `/movies?status=planned\|watched` | List movies (optional filter) |
| PATCH | `/movies/{id}/watch` | Mark a movie as watched |
| PATCH | `/movies/{id}/rate` | Set rating and optional review |
| DELETE | `/movies/{id}` | Remove a movie |

## Pre-commit Hooks

```bash
# Install hooks
pre-commit install

# Run manually against all files
pre-commit run --all-files
```

Hooks: ruff (Python lint + format), eslint + prettier (TypeScript).
