import logging
import sys

from core.logging import InterceptHandler, logger
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    PROJECT_NAME: str = "ethindia_agents"
    API_PREFIX: str = "/api/v1"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    MAX_CONNECTIONS_COUNT: int = 10
    MIN_CONNECTIONS_COUNT: int = 10

    LM_NAME: SecretStr = SecretStr("")
    LM_API_KEY: SecretStr = SecretStr("")

    class Config:
        env_file = ".env", ".env.local"
        env_nested_delimiter = "__"


config = Config()

LOGGING_LEVEL = logging.DEBUG if config.DEBUG else logging.INFO
logging.basicConfig(
    handlers=[InterceptHandler(level=LOGGING_LEVEL)], level=LOGGING_LEVEL
)
logger.configure(handlers=[{"sink": sys.stderr, "level": LOGGING_LEVEL}])
