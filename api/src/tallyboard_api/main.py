from collections.abc import AsyncIterator, Callable

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from tallyboard_api.adapters.records_router import build_records_router
from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository
from tallyboard_api.domain.records import RecordRepository
from tallyboard_api.infrastructure.database import create_session_factory
from tallyboard_api.infrastructure.settings import get_cors_origins, get_settings

RepositoryDependency = Callable[[], AsyncIterator[RecordRepository]]


ALLOWED_METHODS = ["GET", "PUT", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type"]
UNPROCESSABLE = 422
INVALID_REQUEST_MESSAGE = "The request was not valid."
logger = logging.getLogger(__name__)


def create_app(repository: RecordRepository | None = None, cors_origins: list[str] | None = None) -> FastAPI:
    """Without an injected repository the app is database-backed and CORS_ORIGINS is required."""
    app = FastAPI(title="Tallyboard API")
    if repository is None and cors_origins is None:
        cors_origins = get_cors_origins()
    if cors_origins:
        app.add_middleware(
            CORSMiddleware, allow_origins=cors_origins, allow_methods=ALLOWED_METHODS, allow_headers=ALLOWED_HEADERS
        )
    app.add_exception_handler(ValueError, _unprocessable)
    dependency = _fixed(repository) if repository else _database_backed()
    app.include_router(build_records_router(dependency))
    return app


async def _unprocessable(request: Request, error: ValueError) -> JSONResponse:
    logger.warning("Rejected request to %s: %s", request.url.path, error)
    return JSONResponse(status_code=UNPROCESSABLE, content={"detail": INVALID_REQUEST_MESSAGE})


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
