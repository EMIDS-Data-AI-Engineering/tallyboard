"""Shared fixtures. Production imports happen only when a fixture's product is used inside a test."""
import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

API_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_FILE = API_ROOT.parent / "contracts" / "records-v1.openapi.json"
FIXED_STORED_AT = datetime(2026, 1, 1, tzinfo=timezone.utc)


class InMemoryRecordRepository:
    """Fake RecordRepository: save(key, value) -> Record, get(key) -> Record | None."""

    def __init__(self):
        self.rows = {}

    async def save(self, key, value):
        from tallyboard_api.domain.records import Record

        self.rows[key] = Record(key=key, value=value, stored_at=FIXED_STORED_AT)
        return self.rows[key]

    async def get(self, key):
        return self.rows.get(key)


@pytest.fixture
def repository():
    return InMemoryRecordRepository()


@pytest.fixture
def make_client(repository):
    def build():
        import httpx

        from tallyboard_api.main import create_app

        app = create_app(repository=repository)
        return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver")

    return build


@pytest.fixture
def load_contract():
    return lambda: json.loads(CONTRACT_FILE.read_text())
