# Iteration 1 — MVP: Movie Planning & Rating

## Goal

A minimal app where users can plan movies they want to watch and rate movies they have watched.

## Core User Stories

1. **Add a movie to watchlist** — User adds a movie by title (+ optional year) to their personal watchlist.
2. **Mark as watched** — User moves a movie from "planned" to "watched".
3. **Rate a watched movie** — User assigns a numeric rating (1–10) and optionally writes a short review.
4. **View watchlist** — User sees all planned movies.
5. **View watched list** — User sees all watched movies with their ratings.

## Data Model

### Movie entry
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated |
| `title` | string | Required |
| `year` | integer | Optional |
| `status` | enum | `planned` \| `watched` |
| `rating` | integer (1–10) | Nullable; only set when watched |
| `review` | string | Nullable; short free-text note |
| `added_at` | datetime | When the entry was created |
| `watched_at` | datetime | Nullable; when status changed to watched |

## Screens / Views

1. **Watchlist** — list of planned movies, each with title/year and an "Mark as watched" action.
2. **Watched** — list of watched movies sorted by `watched_at` desc, each showing rating and review.
3. **Add Movie** — simple form: title, year (optional), submit.
4. **Rate Movie** — appears after marking as watched: rating picker (1–10), optional review text, save.

## Out of Scope for MVP

- User authentication / multiple users
- Movie metadata from external APIs (posters, genres, cast)
- Social features (sharing, following)
- Advanced filtering / search
- Import/export

## Tech Stack

### Backend
- **Language:** Python 3.13
- **Framework:** FastAPI
- **Data validation:** Pydantic v2 (request/response schemas, settings)
- **API docs:** Swagger UI (auto-generated via FastAPI at `/docs`)
- **Database:** SQLite (persisted via a Docker volume)

### Frontend
- **Language:** TypeScript
- **UI:** Web app (served as a separate container)

### Infrastructure
- **Deployment:** Docker Compose
  - `backend` service — FastAPI app
  - `frontend` service — TypeScript web app (React + Vite)
  - SQLite database file mounted as a named volume so data survives container restarts
- **Python dependency manager:** uv
- **Ignore files:** `.gitignore` and `.dockerignore` at repo root and in each service directory
- **Pre-commit hooks:**
  - Python: `ruff` (linting + formatting)
  - TypeScript: `eslint` + `prettier`

## Docker Compose Layout

```
services:
  backend:
    build: ./backend        # Python 3.13 + FastAPI
    ports: ["8000:8000"]
    volumes:
      - db_data:/app/data   # SQLite file lives here

  frontend:
    build: ./frontend       # TypeScript app
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  db_data:
```

## Success Criteria

- User can add a movie and see it in the watchlist.
- User can mark a movie as watched and provide a rating.
- Rated movies appear in the watched list with their score.
- Data persists between container restarts.
- Swagger UI is accessible at `http://localhost:8000/docs`.
- The whole stack starts with a single `docker compose up`.
