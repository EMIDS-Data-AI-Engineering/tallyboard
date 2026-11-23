import ast

import pytest

from support import API_ROOT

FORBIDDEN_ROOTS = {"fastapi", "sqlalchemy", "asyncpg", "pydantic_settings", "alembic", "httpx"}
INNER_LAYERS = ["domain", "application"]


def imported_roots(source_file):
    roots = set()
    for node in ast.walk(ast.parse(source_file.read_text())):
        if isinstance(node, ast.Import):
            roots.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
            roots.add(node.module.split(".")[0])
    return roots


@pytest.mark.parametrize("layer", INNER_LAYERS)
def test_inner_layers_import_no_framework_or_driver(layer):
    layer_files = list((API_ROOT / "app" / layer).glob("*.py"))

    assert layer_files, f"app/{layer} has no modules"
    for source_file in layer_files:
        assert imported_roots(source_file) & FORBIDDEN_ROOTS == set(), source_file.name


def test_application_layer_does_not_import_adapters():
    layer_files = list((API_ROOT / "app" / "application").glob("*.py"))
    assert layer_files, "app/application has no modules"
    for source_file in layer_files:
        assert "app.adapters" not in source_file.read_text(), source_file.name
