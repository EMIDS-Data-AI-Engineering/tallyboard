import pytest
from sqlalchemy.ext.asyncio import AsyncEngine

from tallyboard_api.main import create_app

LOCAL_DATABASE = "postgresql+asyncpg://localhost/testdb"


@pytest.mark.asyncio
async def test_engine_is_disposed_when_the_application_shuts_down(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", LOCAL_DATABASE)
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5173")
    disposed = []

    async def record_dispose(self, *args, **kwargs):
        disposed.append(self)

    monkeypatch.setattr(AsyncEngine, "dispose", record_dispose)
    app = create_app()

    async with app.router.lifespan_context(app):
        assert disposed == []
    assert len(disposed) == 1


@pytest.mark.asyncio
async def test_an_app_with_an_injected_repository_has_no_engine_to_dispose(repository):
    app = create_app(repository=repository)
    async with app.router.lifespan_context(app):
        pass
