from support import SAVED_AT_DATETIME


def test_save_compiles_to_postgres_upsert_on_key():
    from sqlalchemy.dialects import postgresql

    from app.adapters.sqlalchemy_record_repository import build_upsert_statement
    from app.domain.records import SyncRecord

    statement = build_upsert_statement(SyncRecord(key="player", value={"a": 1}, saved_at=SAVED_AT_DATETIME))
    sql = str(statement.compile(dialect=postgresql.dialect()))

    assert "INSERT INTO sync_records" in sql
    assert "ON CONFLICT (key) DO UPDATE" in sql
    assert "value = " in sql
    assert "saved_at = " in sql
