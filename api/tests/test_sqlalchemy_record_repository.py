import pytest


class RecordingSession:
    """Fake AsyncSession that records executed statements; reads find nothing."""

    def __init__(self):
        self.statements = []
        self.commits = 0

    async def execute(self, statement, *args, **kwargs):
        self.statements.append(statement)
        return _EmptyResult()

    async def commit(self):
        self.commits += 1


class _EmptyResult:
    def scalar_one_or_none(self):
        return None

    def one_or_none(self):
        return None

    def first(self):
        return None

    def mappings(self):
        return self


def compiled(statement):
    from sqlalchemy.dialects import postgresql

    return str(statement.compile(dialect=postgresql.dialect()))


@pytest.mark.asyncio
async def test_save_issues_postgres_upsert_on_conflict_key():
    from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository

    session = RecordingSession()
    try:
        await SqlAlchemyRecordRepository(session).save("player", {"wins": 1})
    except Exception:
        pass  # the fake returns no rows; only the issued SQL matters here

    sql = compiled(session.statements[0])
    assert "INSERT INTO sync.records" in sql
    assert "ON CONFLICT (key) DO UPDATE" in sql


@pytest.mark.asyncio
async def test_save_commits_the_unit_of_work():
    from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository

    session = RecordingSession()
    try:
        await SqlAlchemyRecordRepository(session).save("player", 1)
    except Exception:
        pass

    assert session.commits == 1


@pytest.mark.asyncio
async def test_get_selects_from_the_sync_records_table_and_returns_none_when_absent():
    from tallyboard_api.adapters.sqlalchemy_record_repository import SqlAlchemyRecordRepository

    session = RecordingSession()

    result = await SqlAlchemyRecordRepository(session).get("absent")

    assert "FROM sync.records" in compiled(session.statements[0])
    assert result is None
