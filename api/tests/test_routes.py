import pytest

from support import SAVED_AT, InMemoryRecordRepository, build_client

PLAYER_VALUE = {"name": "Test Player", "level": 3}


@pytest.mark.asyncio
async def test_put_record_persists_value_and_returns_acknowledgement():
    repository = InMemoryRecordRepository()
    async with build_client(repository) as client:
        response = await client.put("/v1/records/player", json={"value": PLAYER_VALUE, "savedAt": SAVED_AT})

    assert response.status_code == 200
    body = response.json()
    assert body["key"] == "player"
    assert body["acknowledged"] is True
    assert repository.records["player"].value == PLAYER_VALUE


@pytest.mark.asyncio
async def test_get_record_returns_previously_saved_value():
    async with build_client(InMemoryRecordRepository()) as client:
        await client.put("/v1/records/player", json={"value": PLAYER_VALUE, "savedAt": SAVED_AT})
        response = await client.get("/v1/records/player")

    assert response.status_code == 200
    assert response.json()["value"] == PLAYER_VALUE
    assert response.json()["key"] == "player"


@pytest.mark.asyncio
async def test_get_missing_record_returns_404_not_error():
    async with build_client(InMemoryRecordRepository()) as client:
        response = await client.get("/v1/records/absent")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_put_overwrites_the_previous_value_for_the_same_key():
    async with build_client(InMemoryRecordRepository()) as client:
        await client.put("/v1/records/player", json={"value": 1, "savedAt": SAVED_AT})
        await client.put("/v1/records/player", json={"value": 2, "savedAt": SAVED_AT})
        response = await client.get("/v1/records/player")

    assert response.json()["value"] == 2


@pytest.mark.asyncio
async def test_put_without_saved_at_is_rejected_as_invalid():
    async with build_client(InMemoryRecordRepository()) as client:
        response = await client.put("/v1/records/player", json={"value": 1})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_repository_failure_returns_503_with_generic_message():
    secret = "password=hunter2"
    repository = InMemoryRecordRepository(failure=RuntimeError(secret))
    async with build_client(repository) as client:
        response = await client.put("/v1/records/player", json={"value": 1, "savedAt": SAVED_AT})

    assert response.status_code == 503
    assert secret not in response.text
