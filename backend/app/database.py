import os
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

engine = create_engine(
    f"sqlite:///{settings.db_path}", connect_args={"check_same_thread": False}
)


def create_db_and_tables() -> None:
    os.makedirs(os.path.dirname(settings.db_path), exist_ok=True)
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
