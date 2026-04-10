from fastapi import FastAPI

app = FastAPI(title="Movie Planner")


@app.get("/health")
def health():
    return {"status": "ok"}
