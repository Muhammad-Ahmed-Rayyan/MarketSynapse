"""
Centralized app configuration, loaded from environment variables / .env
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    news_api_key: str = ""
    database_url: str = "sqlite:///./marketsynapse.db"

    # NewsAPI free tier = 100 requests/day, so we keep default page sizes small
    news_default_page_size: int = 20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Single shared settings instance, imported wherever config is needed
settings = Settings()