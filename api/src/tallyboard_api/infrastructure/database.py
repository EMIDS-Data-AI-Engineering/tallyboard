from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from tallyboard_api.infrastructure.settings import Settings


def create_session_factory(settings: Settings) -> async_sessionmaker[AsyncSession]:
    """The engine connects lazily, so building it opens no connection."""
    engine = create_async_engine(settings.database_url.get_secret_value())
    return async_sessionmaker(engine, expire_on_commit=False)
