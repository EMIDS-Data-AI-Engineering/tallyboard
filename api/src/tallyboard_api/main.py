from fastapi import Depends, FastAPI

from tallyboard_api.adapters.records_router import build_records_router
from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository
from tallyboard_api.domain.records import RecordRepository
from tallyboard_api.infrastructure.database import SessionProvider


def create_app(repository: RecordRepository | None = None) -> FastAPI:
    if repository is None:
        sessions = SessionProvider()

        async def repository_dependency(session=Depends(sessions.session)) -> RecordRepository:
            return SqlAlchemyRecordRepository(session)
    else:

        async def repository_dependency() -> RecordRepository:
            return repository

    app = FastAPI(title="Tallyboard API")
    app.include_router(build_records_router(repository_dependency))
    return app
