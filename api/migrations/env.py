import asyncio

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from tallyboard_api.infrastructure.settings import get_settings

VERSION_TABLE_SCHEMA = "public"


def database_url() -> str:
    return get_settings().database_url.get_secret_value()


def configure(**options) -> None:
    context.configure(target_metadata=None, version_table_schema=VERSION_TABLE_SCHEMA, **options)


def run_offline() -> None:
    configure(url=database_url(), literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_with(connection: Connection) -> None:
    configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_online() -> None:
    engine = create_async_engine(database_url(), poolclass=pool.NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(run_with)
    await engine.dispose()


if context.is_offline_mode():
    run_offline()
else:
    asyncio.run(run_online())
