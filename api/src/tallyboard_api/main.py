from collections.abc import AsyncIterator, Callable

from fastapi import FastAPI

from tallyboard_api.adapters.records_router import build_records_router
from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository
from tallyboard_api.domain.records import RecordRepository
from tallyboard_api.infrastructure.database import create_session_factory
from tallyboard_api.infrastructure.settings import get_settings

RepositoryDependency = Callable[[], AsyncIterator[RecordRepository]]


def create_app(repository: RecordRepository | None = None) -> FastAPI:
    app = FastAPI(title="Tallyboard API")
    dependency = _fixed(repository) if repository else _database_backed()
    app.include_router(build_records_router(dependency))
    return app


def _fixed(repository: RecordRepository) -> RepositoryDependency:
    async def provide() -> AsyncIterator[RecordRepository]:
        yield repository

    return provide


def _database_backed() -> RepositoryDependency:
    session_factory = create_session_factory(get_settings())

    async def provide() -> AsyncIterator[RecordRepository]:
        async with session_factory() as session:
            yield SqlAlchemyRecordRepository(session)

    return provide
