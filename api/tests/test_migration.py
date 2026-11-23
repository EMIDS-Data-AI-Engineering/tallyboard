import io

from alembic import command
from alembic.config import Config

from conftest import API_ROOT


def offline_sql(monkeypatch, run):
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://localhost/tallyboard")
    buffer = io.StringIO()
    config = Config(str(API_ROOT / "alembic.ini"), output_buffer=buffer)
    config.set_main_option("script_location", str(API_ROOT / "migrations"))
    run(config)
    return buffer.getvalue()


def test_upgrade_creates_records_table_and_downgrade_drops_it(monkeypatch):
    upgrade_sql = offline_sql(monkeypatch, lambda config: command.upgrade(config, "head", sql=True))
    downgrade_sql = offline_sql(monkeypatch, lambda config: command.downgrade(config, "0001:base", sql=True))

    assert "CREATE SCHEMA sync" in upgrade_sql
    assert "CREATE TABLE sync.records" in upgrade_sql
    assert "DROP TABLE sync.records" in downgrade_sql
    assert "DROP SCHEMA sync" in downgrade_sql
