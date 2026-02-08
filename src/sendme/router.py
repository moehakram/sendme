import logging
import mimetypes
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from pathlib import Path
import shutil
from urllib.parse import quote, unquote
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from .domain import Node, nodes
from .config import config, node_id_from_stat

router = APIRouter(prefix=config.API_PREFIX)

logger = logging.getLogger(__name__)


def resolve_path(raw_path: str) -> Path:
    decoded = unquote(raw_path)
    full_path = (config.BASE_DIR / decoded).resolve()
    base = config.BASE_DIR.resolve()

    if not full_path.is_relative_to(base):
        raise HTTPException(status_code=400, detail="Invalid path")

    return full_path


def get_node_or_404(node_id: str) -> Node:
    node = nodes.get(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node ID not found")
    if not node.path.exists():
        del nodes[node_id]
        raise HTTPException(status_code=404, detail="Resource missing on disk")
    return node


def format_node_response(p: Path, node: Node, stat: Any) -> Dict[str, Any]:
    is_dir = p.is_dir()
    mime, _ = mimetypes.guess_type(p.name)

    is_previewable = mime and (
        mime.startswith(("image/", "video/", "audio/", "text/"))
        or mime == "application/pdf"
    )

    rel_path = p.relative_to(config.BASE_DIR)
    encoded_path = quote(str(rel_path))

    # Construct Links
    links = {"self": {"href": f"{config.API_PREFIX}/files/{node.id}", "method": "GET"}}

    if is_dir:
        # Link untuk masuk ke dalam folder
        links["contents"] = {
            "href": f"{config.API_PREFIX}/tree/{encoded_path}",
            "method": "GET",
        }

    else:
        links["download"] = {
            "href": f"{config.API_PREFIX}/files/{node.id}/download",
            "method": "GET",
        }
        # Hanya munculkan preview jika browser bisa merender
        if is_previewable:
            links["preview"] = {
                "href": f"{config.API_PREFIX}/files/{node.id}/download?view=true",
                "method": "GET",
            }

        if config.ALLOW_DELETE:
            links["delete"] = {
                "href": f"{config.API_PREFIX}/files/{node.id}",
                "method": "DELETE",
            }

    return {
        "id": node.id,
        "name": p.name,
        "path": str(rel_path),
        "size_byte": stat.st_size if not is_dir else None,
        "type": "folder" if is_dir else mime or "unknown",
        "modified_at": stat.st_mtime,
        "_links": links,
    }


@router.get("/tree/{target_path:path}")
async def list_files(target_path: str = ""):
    target = resolve_path(target_path)

    if not target.exists() or not target.is_dir():
        raise HTTPException(404, "Directory not found")

    items = []
    # Loop isi direktori
    try:
        for p in target.iterdir():
            stat = p.stat()
            nid = node_id_from_stat(stat)

            # Update cache nodes
            if nid not in nodes:
                nodes[nid] = Node(id=nid, name=p.name, path=p)
            else:
                nodes[nid].path = p
                nodes[nid].name = p.name

            items.append(format_node_response(p, nodes[nid], stat))
    except PermissionError:
        raise HTTPException(403, "Permission denied accessing directory")

    # Sorting: Folder dulu, lalu nama
    items.sort(key=lambda x: (x["type"] != "folder", x["name"].lower()))

    # Build Root Links
    rel_path = target.relative_to(config.BASE_DIR)
    current_encoded = quote(str(rel_path))

    collection_links = {
        "self": {
            "href": f"{config.API_PREFIX}/tree/{current_encoded}",
            "method": "GET",
        },
        "upload": {
            "href": f"{config.API_PREFIX}/tree/{current_encoded}",
            "method": "POST",
        },
    }

    return {
        "path": str(rel_path),
        "items": items,
        "_links": collection_links,
    }


@router.get("/files/{node_id}")
async def get_metadata(target_node: Node = Depends(get_node_or_404)):
    return format_node_response(target_node.path, target_node, target_node.path.stat())


# download
@router.api_route("/files/{node_id}/download", methods=["GET", "HEAD"])
async def get_file(
    target_node=Depends(get_node_or_404), view: bool = Query(default=False)
):
    target = target_node.path

    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if target.is_dir():
        raise HTTPException(status_code=400, detail="Cannot open directory")

    mime, _ = mimetypes.guess_type(target.name)
    mime = mime or "application/octet-stream"

    filename = quote(target.name)
    disposition = "inline" if view else "attachment"

    return FileResponse(
        target,
        media_type=mime,
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


# UPLOAD FILE
@router.post("/tree/{target_dir:path}", status_code=201)
async def upload_file(target_dir: str, files: list[UploadFile] = File(...)):
    target_dir = resolve_path(target_dir)

    if not target_dir.exists():
        raise HTTPException(status_code=404, detail="Target directory not found")

    if not target_dir.is_dir():
        raise HTTPException(
            status_code=400, detail="Target directory is not a directory"
        )

    uploaded = []
    for f in files:
        filename = Path(f.filename).name
        dest = target_dir / filename
        if dest.exists():
            raise HTTPException(
                status_code=409, detail=f'File "{filename}" already exists.'
            )

        with dest.open("wb") as out:
            shutil.copyfileobj(f.file, out)
        uploaded.append(f.filename)

    return {
        "uploaded": uploaded,
        "message": f"All {len(uploaded)} files uploaded successfully.",
    }


# DELETE FILE / FOLDER
@router.delete("/files/{node_id}", status_code=204)
async def delete_path(
    recursive: bool = Query(default=False), target_node: Node = Depends(get_node_or_404)
):
    path = target_node.path

    try:
        if path.is_file():
            path.unlink()
        elif path.is_dir():
            is_empty = not any(path.iterdir())

            if not is_empty and not recursive:
                raise HTTPException(
                    status_code=400,
                    detail="Directory is not empty. Use recursive=True to force delete.",
                )

            if recursive:
                shutil.rmtree(path)
            else:
                path.rmdir()

        # Hapus dari memory store setelah fisik terhapus
        if target_node.id in nodes:
            del nodes[target_node.id]

    except OSError as e:
        raise HTTPException(status_code=500, detail=f"System error: {e.strerror}")

    return  # 204 No Content
