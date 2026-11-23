from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from tallyboard_api.infrastructure.settings import get_settings


class SessionProvider:
    """Builds the engine on first use so that importing the app needs no configuration."""

    def __init__(self):
        self._factory = None

    def _session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._factory is None:
            engine = create_async_engine(get_settings().database_url.get_secret_value())
            self._factory = async_sessionmaker(engine, expire_on_commit=False)
        return self._factory

    async def session(self) -> AsyncIterator[AsyncSession]:
        async with self._session_factory()() as session:
            yield session
