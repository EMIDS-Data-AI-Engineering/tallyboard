import json

from support import CONTRACT_PATH, InMemoryRecordRepository

RECORD_PATH = "/v1/records/{key}"
OPENAPI_DOCUMENT_SCHEMA = {
    "type": "object",
    "required": ["openapi", "info", "paths"],
    "properties": {"openapi": {"type": "string"}, "info": {"type": "object"}, "paths": {"type": "object"}},
}


def load_contract():
    return json.loads(CONTRACT_PATH.read_text())


def status_codes(document):
    operations = document["paths"][RECORD_PATH]
    return {method: set(operations[method]["responses"]) for method in ("get", "put")}


def test_contract_is_a_valid_openapi_document():
    import jsonschema

    jsonschema.validate(load_contract(), OPENAPI_DOCUMENT_SCHEMA)


def test_app_routes_match_contract():
    from app.main import create_app

    generated = create_app(InMemoryRecordRepository()).openapi()
    contract = load_contract()

    assert set(generated["paths"]) == set(contract["paths"])
    assert set(generated["paths"][RECORD_PATH]) == set(contract["paths"][RECORD_PATH])
    contract_codes = status_codes(contract)
    generated_codes = status_codes(generated)
    for method, codes in contract_codes.items():
        assert codes <= generated_codes[method]
