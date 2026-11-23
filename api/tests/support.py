"""Shared helpers for the API tests. Application imports stay inside functions."""
from datetime import datetime, timezone
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
API_ROOT = REPOSITORY_ROOT / "api"
CONTRACT_PATH = REPOSITORY_ROOT / "contracts" / "persistence-sync-v1.json"
SAVED_AT = "2026-01-01T00:00:00+00:00"
SAVED_AT_DATETIME = datetime(2026, 1, 1, tzinfo=timezone.utc)


class InMemoryRecordRepository:
    def __init__(self, failure=None):
        self.records = {}
        self.failure = failure

    async def save(self, record):
        if self.failure:
            raise self.failure
        self.records[record.key] = record
        return record

    async def get(self, key):
        if self.failure:
            raise self.failure
        return self.records.get(key)


def build_client(repository):
    import httpx
    from app.main import create_app

    transport = httpx.ASGITransport(app=create_app(repository))
    return httpx.AsyncClient(transport=transport, base_url="http://testserver")
