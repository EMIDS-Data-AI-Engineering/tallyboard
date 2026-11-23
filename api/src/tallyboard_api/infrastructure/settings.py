from pydantic import SecretStr, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DATABASE_URL_SCHEME = "postgresql+asyncpg://"


class SettingsError(RuntimeError):
    """Raised when configuration is missing or invalid; never carries a configured value."""


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    database_url: SecretStr

    @field_validator("database_url")
    @classmethod
    def require_asyncpg_url(cls, value: SecretStr) -> SecretStr:
        if not value.get_secret_value().startswith(DATABASE_URL_SCHEME):
            raise ValueError("unsupported scheme")
        return value


def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError:
        raise SettingsError(
            f"DATABASE_URL must be set in the environment to a {DATABASE_URL_SCHEME} URL"
        ) from None
