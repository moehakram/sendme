import logging
import sys
from pathlib import Path
from . import __version__


class Config:
    DESCRIPTION = "SendMe - simple file sharing server"
    VERSION: str = __version__
    BASE_DIR: Path
    ACCESS_TOKEN: str | None = None
    ACCESS_TOKEN_KEY: str = "x-token"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SHOW_QR: bool = False
    API_PREFIX: str = "/sendme"
    FRONTEND_PATH = Path(__file__).resolve().parent / "dist"


config = Config()


def setup_logging(level=logging.INFO) -> None:
    root = logging.getLogger()
    if root.handlers:
        return

    formatter = logging.Formatter(fmt="%(levelname)-10s%(message)s")
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)

    root.setLevel(level)
    root.addHandler(handler)
