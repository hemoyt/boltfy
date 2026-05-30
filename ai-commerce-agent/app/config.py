from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    SHOPIFY_STORE_DOMAIN: str
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: str
    REDIS_URL: str = "redis://localhost:6379"
    APP_NAME: str = "AI E-Commerce Agent"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
