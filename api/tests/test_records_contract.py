import jsonschema
import pytest

RECORD_PATH = "/v1/records/{key}"


def response_schema(contract, method, status):
    operation = contract["paths"][RECORD_PATH][method]
    schema = operation["responses"][str(status)]["content"]["application/json"]["schema"]
    return {**schema, "components": contract["components"]}


def test_contract_declares_put_and_get_on_the_record_path(load_contract):
    contract = load_contract()
    assert set(contract["paths"][RECORD_PATH]) >= {"put", "get"}


@pytest.mark.asyncio
async def test_responses_match_contract_schemas(make_client, load_contract):
    async with make_client() as client:
        put_response = await client.put("/v1/records/player", json={"value": {"wins": 1}})
        get_response = await client.get("/v1/records/player")

    contract = load_contract()
    jsonschema.validate(put_response.json(), response_schema(contract, "put", 200))
    jsonschema.validate(get_response.json(), response_schema(contract, "get", 200))


@pytest.mark.asyncio
async def test_not_found_response_matches_contract_schema(make_client, load_contract):
    async with make_client() as client:
        response = await client.get("/v1/records/absent")

    jsonschema.validate(response.json(), response_schema(load_contract(), "get", 404))
