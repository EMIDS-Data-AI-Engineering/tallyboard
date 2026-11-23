from pydantic import SecretStr, ValidationError, field_validator
from pydantic_settings import BaseSettings

DATABASE_URL_VARIABLE = "DATABASE_URL"
SUPPORTED_URL_PREFIX = "postgresql+asyncpg://"


class SettingsError(RuntimeError):
    """Configuration is missing or invalid. Never carries a configured value."""


class Settings(BaseSettings):
    database_url: SecretStr

    @field_validator("database_url")
    @classmethod
    def require_asyncpg_url(cls, value: SecretStr) -> SecretStr:
        if not value.get_secret_value().startswith(SUPPORTED_URL_PREFIX):
            raise ValueError("unsupported scheme")
        return value


def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError:
        raise SettingsError(
            f"{DATABASE_URL_VARIABLE} must be set in the environment to a {SUPPORTED_URL_PREFIX} URL."
        ) from None


CORS_ORIGINS_VARIABLE = "CORS_ORIGINS"


class CorsSettings(BaseSettings):
    cors_origins: str


def get_cors_origins() -> list[str]:
    """Comma-separated CORS_ORIGINS from the environment; fails loudly and never echoes the value."""
    try:
        raw_origins = CorsSettings().cors_origins
    except ValidationError:
        raise SettingsError(f"{CORS_ORIGINS_VARIABLE} must be set in the environment.") from None
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if not origins or "*" in origins:
        raise SettingsError(f"{CORS_ORIGINS_VARIABLE} must list explicit origins and no wildcard.")
    return origins
