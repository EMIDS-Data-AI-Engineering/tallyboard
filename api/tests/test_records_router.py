import pytest


@pytest.mark.asyncio
async def test_put_record_persists_value_and_returns_acknowledgement(make_client, repository):
    async with make_client() as client:
        response = await client.put("/v1/records/player", json={"value": {"wins": 1}})

    assert response.status_code == 200
    assert response.json()["key"] == "player"
    assert "stored_at" in response.json()
    assert repository.rows["player"].value == {"wins": 1}


@pytest.mark.asyncio
async def test_put_then_get_returns_the_same_value(make_client):
    async with make_client() as client:
        await client.put("/v1/records/board", json={"value": [1, 2, 3]})
        response = await client.get("/v1/records/board")

    assert response.status_code == 200
    assert response.json()["value"] == [1, 2, 3]


@pytest.mark.asyncio
async def test_put_overwrites_the_previous_value(make_client):
    async with make_client() as client:
        await client.put("/v1/records/k", json={"value": "old"})
        await client.put("/v1/records/k", json={"value": "new"})
        response = await client.get("/v1/records/k")

    assert response.json()["value"] == "new"


@pytest.mark.asyncio
async def test_get_missing_record_returns_404(make_client):
    async with make_client() as client:
        response = await client.get("/v1/records/absent")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_invalid_key_is_rejected_with_422(make_client):
    async with make_client() as client:
        response = await client.put("/v1/records/" + "k" * 1000, json={"value": 1})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_put_without_value_is_rejected_with_422(make_client):
    async with make_client() as client:
        response = await client.put("/v1/records/player", json={})

    assert response.status_code == 422
