import pytest

LONGEST_ALLOWED_KEY = "k" * 128


def test_record_holds_key_value_and_timestamp():
    from datetime import datetime, timezone

    from tallyboard_api.domain.records import Record

    stored_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    record = Record(key="player", value={"a": 1}, stored_at=stored_at)

    assert (record.key, record.value, record.stored_at) == ("player", {"a": 1}, stored_at)


@pytest.mark.parametrize("bad_key", ["", " ", "has/slash", "k" * 1000])
def test_validate_key_refuses_malformed_keys(bad_key):
    from tallyboard_api.domain.records import validate_key

    with pytest.raises(ValueError):
        validate_key(bad_key)


def test_validate_key_accepts_an_ordinary_key():
    from tallyboard_api.domain.records import validate_key

    assert validate_key("tallyboard.player-1") == "tallyboard.player-1"
