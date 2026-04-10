from fastapi import FastAPI

app = FastAPI(title="Movie Planner API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
