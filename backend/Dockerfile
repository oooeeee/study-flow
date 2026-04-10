FROM python:3.13-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy project files
COPY pyproject.toml uv.lock ./
COPY backend/pyproject.toml ./backend/pyproject.toml

# Sync dependencies
RUN uv sync --frozen --no-dev --package backend

# Copy application code
COPY backend/app ./app

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
