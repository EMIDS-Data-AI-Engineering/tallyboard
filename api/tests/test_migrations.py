import io

from support import API_ROOT

FAKE_DATABASE_URL = "postgresql+asyncpg://user:placeholder@localhost/app"
INITIAL_REVISION = "0001"


def render_sql(monkeypatch, run):
    from alembic.config import Config

    monkeypatch.setenv("DATABASE_URL", FAKE_DATABASE_URL)
    monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:5173"]')
    config = Config(str(API_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(API_ROOT / "migrations"))
    config.output_buffer = io.StringIO()
    run(config)
    return config.output_buffer.getvalue()


def test_upgrade_creates_and_downgrade_drops_sync_records_table(monkeypatch):
    from alembic import command

    upgrade_sql = render_sql(monkeypatch, lambda config: command.upgrade(config, "head", sql=True))
    downgrade_sql = render_sql(
        monkeypatch, lambda config: command.downgrade(config, f"{INITIAL_REVISION}:base", sql=True)
    )

    assert "CREATE TABLE sync_records" in upgrade_sql
    assert "DROP TABLE sync_records" in downgrade_sql
