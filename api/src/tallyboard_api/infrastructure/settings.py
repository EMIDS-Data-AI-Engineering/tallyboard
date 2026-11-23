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
