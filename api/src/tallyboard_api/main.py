import logging
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncEngine

from tallyboard_api.adapters.records_router import build_records_router
from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository
from tallyboard_api.domain.records import InvalidRecordInput, RecordRepository
from tallyboard_api.infrastructure.database import create_engine, create_session_factory
from tallyboard_api.infrastructure.settings import get_cors_origins, get_settings

RepositoryDependency = Callable[[], AsyncIterator[RecordRepository]]


ALLOWED_METHODS = ["GET", "PUT", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type"]
UNPROCESSABLE = 422
INTERNAL_ERROR = 500
INVALID_REQUEST_MESSAGE = "The request was not valid."
INTERNAL_ERROR_MESSAGE = "Internal server error."
logger = logging.getLogger(__name__)


def create_app(repository: RecordRepository | None = None, cors_origins: list[str] | None = None) -> FastAPI:
    """Without an injected repository the app is database-backed and CORS_ORIGINS is required."""
    if repository is None and cors_origins is None:
        cors_origins = get_cors_origins()
    engine = create_engine(get_settings()) if repository is None else None
    app = FastAPI(title="Tallyboard API", lifespan=_dispose_engine_on_shutdown(engine))
    if cors_origins:
        app.add_middleware(
            CORSMiddleware, allow_origins=cors_origins, allow_methods=ALLOWED_METHODS, allow_headers=ALLOWED_HEADERS
        )
    app.add_exception_handler(InvalidRecordInput, _unprocessable)
    app.add_exception_handler(Exception, _internal_error)
    dependency = _fixed(repository) if repository is not None else _database_backed(engine)
    app.include_router(build_records_router(dependency))
    return app


def _dispose_engine_on_shutdown(engine: AsyncEngine | None):
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        if engine is not None:
            await engine.dispose()

    return lifespan


async def _unprocessable(request: Request, error: InvalidRecordInput) -> JSONResponse:
    logger.warning("Rejected request to %s: %s", request.url.path, error)
    return JSONResponse(status_code=UNPROCESSABLE, content={"detail": INVALID_REQUEST_MESSAGE})


async def _internal_error(request: Request, error: Exception) -> JSONResponse:
    logger.error("Unhandled error on %s", request.url.path, exc_info=error)
    return JSONResponse(status_code=INTERNAL_ERROR, content={"detail": INTERNAL_ERROR_MESSAGE})


def _fixed(repository: RecordRepository) -> RepositoryDependency:
    async def provide() -> AsyncIterator[RecordRepository]:
        yield repository

    return provide


def _database_backed(engine: AsyncEngine) -> RepositoryDependency:
    session_factory = create_session_factory(engine)

    async def provide() -> AsyncIterator[RecordRepository]:
        async with session_factory() as session:
            yield SqlAlchemyRecordRepository(session)

    return provide
