from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    db_path: str = "/app/data/movies.db"
    app_env: str = "development"


settings = Settings()
