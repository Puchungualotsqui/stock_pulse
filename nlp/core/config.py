from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    news_api_key: str

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"

settings = Settings()
