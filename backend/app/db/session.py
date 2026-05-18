from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

_engine = None
_SessionLocal = None


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def _get_engine():
    global _engine, _SessionLocal
    if _engine is not None:
        return _engine
    settings = get_settings()
    if not settings.database_url:
        return None
    _engine = create_engine(
        _normalize_database_url(settings.database_url),
        pool_pre_ping=True,
    )
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def init_db() -> bool:
    """Verify database connectivity. Schema is applied via Alembic migrations."""
    engine = _get_engine()
    if engine is None:
        return False
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        conn.commit()
    return True


def get_db() -> Generator[Session, None, None]:
    _get_engine()
    if _SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()
