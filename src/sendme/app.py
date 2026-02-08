import logging
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import secrets
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from .config import config
from .router import router

logger = logging.getLogger(__name__)
REALM = "SendMe"
security = HTTPBasic(realm=REALM)


def verify_auth(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Logika verifikasi Basic Auth yang hanya aktif jika AUTH_CREDENTIALS diset.
    """
    # Jika token tidak diset di config, izinkan akses tanpa verifikasi
    if not config.AUTH_CREDENTIALS:
        return None

    username, password = config.AUTH_CREDENTIALS.split(":", 1)
    # Menggunakan secrets.compare_digest untuk mitigasi Timing Attacks
    is_valid_username = secrets.compare_digest(credentials.username, username)
    is_valid_password = secrets.compare_digest(credentials.password, password)

    if not (is_valid_username and is_valid_password):
        logger.warning("Failed login attempt with username: %s", credentials.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": f'Basic realm="{REALM}"'},
        )

    return credentials.username


def create_app() -> FastAPI:
    app = FastAPI(title="SendMe", version=config.VERSION)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.detail},
            headers=getattr(exc, "headers", {}),
        )

    auth_deps = [Depends(verify_auth)] if config.AUTH_CREDENTIALS else []
    app.include_router(router, dependencies=auth_deps)

    @app.get("/tree")
    @app.get("/tree/{full_path:path}")
    async def serve_spa(full_path: str = None):
        index_path = config.FRONTEND_PATH / "index.html"
        if not index_path.exists():
            return JSONResponse({"error": "Frontend build not found"}, status_code=500)
        return FileResponse(index_path)

    app.mount(
        "/", StaticFiles(directory=str(config.FRONTEND_PATH), html=True), name="static"
    )

    return app
