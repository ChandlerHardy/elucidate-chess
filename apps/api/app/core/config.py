from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # App
    app_name: str = "Elucidate Chess"
    environment: str = "development"
    debug: bool = True

    # Database
    database_url: str = "postgresql://chess_dev_user:chess_dev_password@localhost:5435/elucidate_chess_dev"

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    admin_secret: str = "local-admin-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # AI
    gemini_api_key: str = ""
    openrouter_api_key: str = ""

    # External APIs
    lichess_api_token: str = ""
    chess_com_api_key: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "https://chess.elucidate.com"]

    # Chess Engine
    stockfish_path: str = "/usr/bin/stockfish"  # Or custom path
    stockfish_depth: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
