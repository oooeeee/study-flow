# Repository Guidelines

## Project Structure & Module Organization
`backend/` contains the FastAPI API, SQLModel models, and pytest suite. Application code lives in `backend/app/` with routers under `backend/app/routers/`; tests live in `backend/tests/`. `frontend/` contains the React + Vite client: pages in `frontend/src/pages/`, reusable UI in `frontend/src/components/`, and API utilities in `frontend/src/api/`. Repo-level docs are in `docs/`, and local orchestration is defined in `docker-compose.yml`.

## Build, Test, and Development Commands
Use Docker for the full stack:

```bash
docker compose up --build
docker compose down
```

Backend workflow:

```bash
cd backend
uv sync --group dev
uv run uvicorn app.main:app --reload
uv run pytest
```

Frontend workflow:

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
npm run build
npm run test
npm run lint
```

Run shared quality checks with `pre-commit run --all-files`.

## Coding Style & Naming Conventions
Python targets 3.12+ and uses Ruff for linting and formatting; follow 4-space indentation, `snake_case` for functions/modules, and explicit type hints where already used. Frontend code uses TypeScript, ESLint, and Prettier; follow 2-space indentation, `PascalCase` for React components (`WatchlistPage.tsx`), and `camelCase` for functions and props. Keep tests adjacent to the feature area using `*.test.tsx` or `test_*.py`.

## Testing Guidelines
Backend tests use `pytest` and FastAPI’s `TestClient`; prefer API-level tests in `backend/tests/` named `test_<feature>.py`. Frontend tests use `vitest` with Testing Library; keep component tests in `frontend/src/` next to the component or page they cover. Add tests for new API routes, UI states, and regressions before opening a PR.

## Commit & Pull Request Guidelines
Recent history mostly follows Conventional Commit style such as `feat: update README with quickstart and dev setup docs`; keep using prefixes like `feat:`, `fix:`, and `docs:` with a short imperative summary. Avoid vague messages like `added changes after start`. PRs should include a concise description, linked issue or plan doc when relevant, test results, and screenshots for UI changes.

## Configuration Tips
The main runtime setting is `DB_PATH` for the backend SQLite database; default behavior is documented in `README.md`. In local frontend development, set `VITE_API_URL=http://localhost:8000` so the client points at the API.
