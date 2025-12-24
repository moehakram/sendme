import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import config
from .router import router

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI()

    if config.ACCESS_TOKEN:

        @app.middleware("http")
        async def token_guard(request: Request, call_next):
            prefix = config.API_PREFIX
            path = request.url.path

            if path == prefix or path.startswith(prefix + "/"):
                token = request.headers.get(config.ACCESS_TOKEN_KEY)
                if token != config.ACCESS_TOKEN:
                    logger.warning("Unauthorized request: %s", path)
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Invalid or missing token"},
                    )

            return await call_next(request)

    app.include_router(router)
    app.mount("/", StaticFiles(directory=config.FRONTEND_PATH, html=True))

    return app
