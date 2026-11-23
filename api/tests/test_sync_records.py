import pytest

from support import SAVED_AT_DATETIME, InMemoryRecordRepository


@pytest.mark.asyncio
async def test_save_record_stores_the_record_in_the_repository():
    from app.application.sync_records import SaveRecord
    from app.domain.records import SyncRecord

    repository = InMemoryRecordRepository()
    record = SyncRecord(key="player", value={"level": 1}, saved_at=SAVED_AT_DATETIME)

    await SaveRecord(repository).execute(record)

    assert repository.records["player"] == record


@pytest.mark.asyncio
async def test_fetch_record_returns_the_stored_record():
    from app.application.sync_records import FetchRecord
    from app.domain.records import SyncRecord

    repository = InMemoryRecordRepository()
    record = SyncRecord(key="player", value=[1, 2], saved_at=SAVED_AT_DATETIME)
    await repository.save(record)

    assert await FetchRecord(repository).execute("player") == record


@pytest.mark.asyncio
async def test_fetch_record_for_a_missing_key_raises_record_not_found():
    from app.application.sync_records import FetchRecord
    from app.domain.records import RecordNotFoundError

    with pytest.raises(RecordNotFoundError):
        await FetchRecord(InMemoryRecordRepository()).execute("absent")
