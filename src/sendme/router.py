import mimetypes
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pathlib import Path
import shutil
from urllib.parse import quote, unquote
from fastapi.responses import FileResponse
from .config import config

router = APIRouter(prefix=config.API_PREFIX)


def resolve_path(raw_path: str) -> Path:
    decoded = unquote(raw_path)
    full_path = (config.BASE_DIR / decoded).resolve()
    base = config.BASE_DIR.resolve()

    if not full_path.is_relative_to(base):
        raise HTTPException(status_code=400, detail="Invalid path")

    return full_path


@router.get("/files")
async def list_files(path: str = Query(default="")):
    target = resolve_path(path)

    if not target.exists() or not target.is_dir():
        raise HTTPException(404, "Directory not found")

    items = []
    for p in target.iterdir():
        stat = p.stat()
        mime = None
        size = None

        if p.is_file():
            mime, _ = mimetypes.guess_type(p.name)
            size = stat.st_size

        items.append(
            {
                "name": p.name,
                "path": str(Path(path) / p.name),
                "is_dir": p.is_dir(),
                "size_byte": size,
                "mime_type": mime,
                "modified_at": stat.st_mtime,
            }
        )

    return {
        "path": path,
        "items": sorted(items, key=lambda x: (not x["is_dir"], x["name"].lower())),
    }


@router.get("/file")
async def get_file(
    path: str = Query(...),
    preview: bool = Query(default=False),
):
    target = resolve_path(path)

    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if target.is_dir():
        raise HTTPException(status_code=400, detail="Cannot open directory")

    mime, _ = mimetypes.guess_type(target.name)
    mime = mime or "application/octet-stream"

    filename = quote(target.name)
    disposition = "inline" if preview else "attachment"

    return FileResponse(
        target,
        media_type=mime,
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


# UPLOAD FILE
@router.post("/files")
async def upload_file(
    path: str = Query(default=""), files: list[UploadFile] = File(...)
):
    target_dir = resolve_path(path)

    if not target_dir.exists():
        raise HTTPException(status_code=404, detail="Target directory not found")

    if not target_dir.is_dir():
        raise HTTPException(status_code=400, detail="Target path is not a directory")

    uploaded = []
    for f in files:
        # dest = target_dir / f.filename
        dest = target_dir / Path(f.filename).name
        if dest.exists():
            raise HTTPException(status_code=409, detail="File already exists")

        with dest.open("wb") as out:
            shutil.copyfileobj(f.file, out)
        uploaded.append(f.filename)

    return {"uploaded": uploaded, "path": path}


# DELETE FILE / FOLDER
@router.delete("/files")
async def delete_path(path: str = Query(...), recursive: bool = Query(default=False)):
    target = resolve_path(path)

    if not target.exists():
        raise HTTPException(status_code=404, detail="Path not found")

    if target.is_file():
        target.unlink()
        return {"message": "File deleted"}

    if target.is_dir():
        if any(target.iterdir()) and not recursive:
            raise HTTPException(
                status_code=400,
                detail="Directory is not empty. Use recursive=True to force delete.",
            )
        if recursive:
            shutil.rmtree(target)
            return {"message": "Directory deleted recursively"}
        else:
            target.rmdir()
            return {"message": "Directory deleted"}
