from typing import Any

from tallyboard_api.domain.records import Record, RecordRepository, validate_key


async def put_record(repository: RecordRepository, key: str, value: Any) -> Record:
    return await repository.save(validate_key(key), value)


async def get_record(repository: RecordRepository, key: str) -> Record | None:
    return await repository.get(validate_key(key))
