import pytest

FAKE_URL = "postgresql+asyncpg://localhost/tallyboard?options=fake-marker-123"


def test_missing_database_url_raises_naming_the_variable(monkeypatch):
    from tallyboard_api.infrastructure.settings import get_settings

    monkeypatch.delenv("DATABASE_URL", raising=False)

    with pytest.raises(Exception, match="DATABASE_URL"):
        get_settings()


def test_settings_error_never_contains_the_url_value(monkeypatch):
    from tallyboard_api.infrastructure.settings import get_settings

    monkeypatch.setenv("DATABASE_URL", "not-a-valid-url-fake-marker-123")

    try:
        get_settings()
    except Exception as error:
        assert "fake-marker-123" not in str(error)


def test_settings_repr_hides_the_url_value(monkeypatch):
    from tallyboard_api.infrastructure.settings import get_settings

    monkeypatch.setenv("DATABASE_URL", FAKE_URL)

    assert "fake-marker-123" not in repr(get_settings())
