import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol

MAX_KEY_LENGTH = 128
KEY_PATTERN = re.compile(r"^[A-Za-z0-9._:-]+$")


@dataclass(frozen=True)
class Record:
    key: str
    value: Any
    stored_at: datetime


class RecordRepository(Protocol):
    async def save(self, key: str, value: Any) -> Record: ...

    async def get(self, key: str) -> Record | None: ...


def validate_key(key: str) -> str:
    if len(key) > MAX_KEY_LENGTH or not KEY_PATTERN.fullmatch(key):
        raise ValueError(f"Record key must be 1-{MAX_KEY_LENGTH} characters of letters, digits, '.', '_', ':' or '-'.")
    return key
