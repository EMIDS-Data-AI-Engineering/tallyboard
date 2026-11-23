import ast

from conftest import API_ROOT

PACKAGE_ROOT = API_ROOT / "src" / "tallyboard_api"
INNER_LAYERS = ["domain", "application"]
FORBIDDEN_FOR_INNER_LAYERS = ("fastapi", "sqlalchemy", "asyncpg", "pydantic", "tallyboard_api.adapters", "tallyboard_api.infrastructure")


def imported_names(path):
    names = []
    for node in ast.walk(ast.parse(path.read_text())):
        if isinstance(node, ast.Import):
            names += [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.append(node.module)
    return names


def violations(layer):
    files = [path for path in (PACKAGE_ROOT / layer).glob("*.py") if path.name != "__init__.py"]
    assert files, f"layer {layer} has no modules"
    return [
        (path.name, name)
        for path in files
        for name in imported_names(path)
        if name.startswith(FORBIDDEN_FOR_INNER_LAYERS)
    ]


def test_domain_imports_no_framework_or_outer_layer():
    assert violations("domain") == []


def test_application_imports_no_framework_or_outer_layer():
    assert violations("application") == []
