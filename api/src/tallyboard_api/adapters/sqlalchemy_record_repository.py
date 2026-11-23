from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Column, DateTime, MetaData, String, Table, select
from sqlalchemy.dialects.postgresql import JSONB, insert
from sqlalchemy.ext.asyncio import AsyncSession

from tallyboard_api.domain.records import Record

records_table = Table(
    "records",
    MetaData(),
    Column("key", String, primary_key=True),
    Column("value", JSONB, nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
    schema="sync",
)


class SqlAlchemyRecordRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, key: str, value: Any) -> Record:
        stored_at = datetime.now(timezone.utc)
        statement = insert(records_table).values(key=key, value=value, updated_at=stored_at)
        statement = statement.on_conflict_do_update(
            index_elements=[records_table.c.key],
            set_={"value": statement.excluded.value, "updated_at": statement.excluded.updated_at},
        )
        await self._session.execute(statement)
        await self._session.commit()
        return Record(key=key, value=value, stored_at=stored_at)

    async def get(self, key: str) -> Record | None:
        statement = select(records_table.c.key, records_table.c.value, records_table.c.updated_at).where(
            records_table.c.key == key
        )
        row = (await self._session.execute(statement)).one_or_none()
        if row is None:
            return None
        return Record(key=row.key, value=row.value, stored_at=row.updated_at)
