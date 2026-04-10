# study-flow

A single-user web app to plan movies you want to watch and rate movies you have watched.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (For local dev) [uv](https://github.com/astral-sh/uv) (Python), [Node.js 20+](https://nodejs.org/) (frontend)

## Quickstart

```bash
docker compose up --build
```

- App: http://localhost:3000
- API / Swagger UI: http://localhost:8000/docs

Data is stored in a Docker named volume (`db_data`) and survives container restarts.

To stop:

```bash
docker compose down
```

## Development setup

### Backend (Python 3.13 + FastAPI)

```bash
cd backend
uv sync --all-groups
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run tests:

```bash
cd backend
uv run pytest
```

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Run tests:

```bash
cd frontend
npm run test
```

### Pre-commit hooks

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files   # run manually on all files
```

## Tech stack

- Backend: Python 3.13, FastAPI, SQLModel, SQLite
- Frontend: React 19, Vite, TypeScript, Vitest
- Infrastructure: Docker Compose

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/movies` | Add a movie |
| GET | `/movies?status=planned\|watched` | List movies |
| PATCH | `/movies/{id}/watch` | Mark as watched |
| PATCH | `/movies/{id}/rate` | Set rating + review |
| DELETE | `/movies/{id}` | Remove movie |
