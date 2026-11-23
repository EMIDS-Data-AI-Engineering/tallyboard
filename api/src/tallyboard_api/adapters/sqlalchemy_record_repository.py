from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Column, DateTime, MetaData, String, Table, select
from sqlalchemy.dialects.postgresql import JSONB, insert
from sqlalchemy.ext.asyncio import AsyncSession

from tallyboard_api.domain.records import Record

SYNC_SCHEMA = "sync"

records_table = Table(
    "records",
    MetaData(),
    Column("key", String, primary_key=True),
    Column("value", JSONB, nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
    schema=SYNC_SCHEMA,
)


class SqlAlchemyRecordRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, key: str, value: Any) -> Record:
        stored_at = datetime.now(timezone.utc)
        upsert = insert(records_table).values(key=key, value=value, updated_at=stored_at)
        upsert = upsert.on_conflict_do_update(
            index_elements=[records_table.c.key],
            set_={"value": upsert.excluded.value, "updated_at": upsert.excluded.updated_at},
        )
        await self._session.execute(upsert)
        await self._session.commit()
        return Record(key=key, value=value, stored_at=stored_at)

    async def get(self, key: str) -> Record | None:
        result = await self._session.execute(select(records_table).where(records_table.c.key == key))
        row = result.mappings().first()
        if row is None:
            return None
        return Record(key=row["key"], value=row["value"], stored_at=row["updated_at"])
