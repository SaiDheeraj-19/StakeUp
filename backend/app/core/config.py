from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "StakeUp API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "stakeup_user"
    POSTGRES_PASSWORD: str = "stakeup_password"
    POSTGRES_DB: str = "stakeup_db"
    POSTGRES_PORT: int = 5433
    
    DATABASE_URL: Optional[str] = None
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            # Render PostgreSQL uses postgres:// instead of postgresql:// sometimes, SQLAlchemy needs postgresql://
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    
    # Cloudinary for ProofIQ
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")

settings = Settings()
