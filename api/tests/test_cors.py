import httpx
import pytest

from tallyboard_api.infrastructure.settings import SettingsError, get_cors_origins

ALLOWED_ORIGIN = "http://localhost:5173"
OTHER_ORIGIN = "http://other.example.com"


def preflight_from(app, origin):
    client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver")
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "content-type",
    }
    return client.options("/v1/records/some-key", headers=headers)


@pytest.fixture
def app(repository):
    from tallyboard_api.main import create_app

    return create_app(repository=repository, cors_origins=[ALLOWED_ORIGIN])


@pytest.mark.asyncio
async def test_preflight_from_allowed_origin_is_granted(app):
    response = await preflight_from(app, ALLOWED_ORIGIN)

    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


@pytest.mark.asyncio
async def test_preflight_from_other_origin_is_not_granted(app):
    response = await preflight_from(app, OTHER_ORIGIN)

    assert "access-control-allow-origin" not in response.headers


@pytest.mark.asyncio
async def test_invalid_key_422_hides_the_exception_text(make_client):
    async with make_client() as client:
        response = await client.put("/v1/records/%20", json={"value": 1})

    assert response.status_code == 422
    assert response.json() == {"detail": "The request was not valid."}


def test_origins_are_split_from_a_comma_separated_variable(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", f"{ALLOWED_ORIGIN}, {OTHER_ORIGIN}")

    assert get_cors_origins() == [ALLOWED_ORIGIN, OTHER_ORIGIN]


def test_missing_origins_raise_naming_the_variable(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    with pytest.raises(SettingsError, match="CORS_ORIGINS"):
        get_cors_origins()


def test_wildcard_origin_is_refused_without_echoing_the_value(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "*")

    with pytest.raises(SettingsError) as refusal:
        get_cors_origins()

    assert "'*'" not in str(refusal.value)
