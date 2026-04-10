from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_path: str = "/app/data/movies.db"
    app_env: str = "production"


settings = Settings()
