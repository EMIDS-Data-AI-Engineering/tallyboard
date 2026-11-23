import pytest


@pytest.mark.asyncio
async def test_put_record_stores_value_through_the_port(repository):
    from tallyboard_api.application.record_service import put_record

    record = await put_record(repository, "player", {"wins": 2})

    assert repository.rows["player"].value == {"wins": 2}
    assert record.key == "player"


@pytest.mark.asyncio
async def test_put_record_overwrites_an_existing_value(repository):
    from tallyboard_api.application.record_service import put_record

    await put_record(repository, "player", 1)
    await put_record(repository, "player", 2)

    assert repository.rows["player"].value == 2


@pytest.mark.asyncio
async def test_get_record_returns_none_for_unknown_key(repository):
    from tallyboard_api.application.record_service import get_record

    assert await get_record(repository, "absent") is None


@pytest.mark.asyncio
async def test_put_record_refuses_an_invalid_key(repository):
    from tallyboard_api.application.record_service import put_record

    with pytest.raises(ValueError):
        await put_record(repository, "", 1)
