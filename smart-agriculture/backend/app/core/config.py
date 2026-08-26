from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Smart Agriculture System"
    app_env: str = "development"

    # Database: prefer DATABASE_URL (e.g. Supabase connection string)
    database_url: str | None = None
    use_sqlite_fallback: bool = True

    # Supabase settings (for clients / storage)
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    jwt_secret_key: str = "change-me-please"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    upload_dir: str = "uploads"
    max_upload_size: int = 5 * 1024 * 1024
    allowed_extensions: str = ".jpg,.jpeg,.png,.webp"

    disease_model_path: str = "../ml-models/disease"
    crop_model_path: str = "../ml-models/crop"

    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), env_file_encoding="utf-8", extra="ignore")

    @property
    def db_url(self) -> str:
        if self.database_url:
            return self.database_url
        if self.use_sqlite_fallback or self.app_env.lower() == "test":
            return "sqlite:///./smart_agriculture_dev.db"
        # default to sqlite fallback; production should set DATABASE_URL (Postgres/Supabase)
        return "sqlite:///./smart_agriculture_dev.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
