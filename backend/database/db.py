"""
SQLAlchemy engine, session, and declarative base.
Scaffolded in Phase 1 (Day 1 requirements.txt included sqlalchemy), left
unused until Phase 2 Workstream A needed actual persistence.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import settings

# check_same_thread=False is required for SQLite when used with FastAPI's
# threaded request handling — SQLite connections are otherwise thread-bound.
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Create all tables. Call once at app startup (main.py)."""
    from backend.database import models  # noqa: F401 — ensures models are registered on Base before create_all
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency — yields a session, closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()