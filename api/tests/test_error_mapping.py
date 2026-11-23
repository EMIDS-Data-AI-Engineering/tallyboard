import httpx
import pytest

from tallyboard_api.domain.records import InvalidRecordInput
from tallyboard_api.main import create_app


class ExplodingRepository:
    def __init__(self, error):
        self.error = error

    async def save(self, key, value):
        raise self.error

    async def get(self, key):
        raise self.error


def client_for(error):
    app = create_app(repository=ExplodingRepository(error))
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    return httpx.AsyncClient(transport=transport, base_url="http://testserver")


@pytest.mark.asyncio
async def test_domain_validation_error_maps_to_the_fixed_422():
    async with client_for(InvalidRecordInput("secret detail")) as client:
        response = await client.put("/v1/records/score", json={"value": 1})
    assert response.status_code == 422
    assert response.json() == {"detail": "The request was not valid."}


@pytest.mark.asyncio
async def test_other_value_errors_are_a_generic_500_with_details_only_in_the_log(caplog):
    async with client_for(ValueError("internal secret detail")) as client:
        response = await client.get("/v1/records/score")
    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error."}
    assert "internal secret detail" not in response.text
    assert "internal secret detail" in caplog.text


@pytest.mark.asyncio
async def test_unexpected_exceptions_are_a_generic_500():
    async with client_for(RuntimeError("database exploded")) as client:
        response = await client.put("/v1/records/score", json={"value": 1})
    assert response.status_code == 500
    assert "database exploded" not in response.text
