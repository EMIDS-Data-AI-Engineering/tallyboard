from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from tallyboard_api.infrastructure.settings import Settings


def create_engine(settings: Settings) -> AsyncEngine:
    """The engine connects lazily, so building it opens no connection."""
    return create_async_engine(settings.database_url.get_secret_value())


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False)
