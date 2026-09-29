import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DealMind AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/dealmind.db")
    
    # LLM & Memory APIs
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_BASE_URL: str = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.ai/v1")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
