"""Germany Bound API package."""

from app.main import app


def create_app():
    """Factory for hosts that expect app:create_app (e.g. Render default)."""
    return app
