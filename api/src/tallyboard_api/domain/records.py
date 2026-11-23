import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol

MAX_KEY_LENGTH = 128
KEY_PATTERN = re.compile(rf"^[A-Za-z0-9._:-]{{1,{MAX_KEY_LENGTH}}}$")


@dataclass(frozen=True)
class Record:
    key: str
    value: Any
    stored_at: datetime


class RecordRepository(Protocol):
    async def save(self, key: str, value: Any) -> Record: ...

    async def get(self, key: str) -> Record | None: ...


def validate_key(key: str) -> str:
    if not KEY_PATTERN.fullmatch(key):
        raise ValueError(f"record key must match {KEY_PATTERN.pattern}")
    return key
