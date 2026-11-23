import pytest

SECRET_URL = "postgresql+asyncpg://user:hunter2@db.example.com/app"


def test_missing_database_url_raises_without_leaking_values(monkeypatch):
    from app.settings import Settings

    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("CORS_ORIGINS", "http://secret-origin.example.com")

    with pytest.raises(Exception) as failure:
        Settings(_env_file=None)

    assert "secret-origin" not in str(failure.value)


def test_missing_cors_origins_raises_without_leaking_the_database_url(monkeypatch):
    from app.settings import Settings

    monkeypatch.setenv("DATABASE_URL", SECRET_URL)
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    with pytest.raises(Exception) as failure:
        Settings(_env_file=None)

    assert "hunter2" not in str(failure.value)


def test_settings_read_database_url_from_the_environment(monkeypatch):
    from app.settings import Settings

    monkeypatch.setenv("DATABASE_URL", SECRET_URL)
    monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:5173"]')

    assert Settings(_env_file=None).database_url == SECRET_URL
