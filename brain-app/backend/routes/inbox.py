"""Local API endpoints for the KOA Company Brain inbox."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path, PurePosixPath

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(tags=["inbox"])
ROUTER_SCRIPT = Path(__file__).resolve().parents[2] / "inbox-processor" / "route-inbox.py"


class MarkProcessedRequest(BaseModel):
    item_path: str = Field(min_length=1, max_length=1024)


def _data_root() -> Path:
    configured = os.environ.get("BRAIN_DATA_PATH")
    if not configured:
        raise HTTPException(status_code=500, detail="BRAIN_DATA_PATH is not configured")
    return Path(configured).expanduser().resolve()


def _list_items(bucket: str) -> dict[str, object]:
    root = _data_root()
    folder = root / "inbox" / bucket
    if folder.is_symlink() or not folder.resolve().is_relative_to(root):
        raise HTTPException(status_code=400, detail="Inbox folder must stay inside BRAIN_DATA_PATH")
    if not folder.exists():
        return {"items": [], "count": 0}
    items = []
    for path in sorted(folder.rglob("*"), key=lambda value: value.relative_to(folder).as_posix().casefold()):
        if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(folder.resolve()):
            continue
        if bucket == "processed" and path.name == ".manifest.json":
            continue
        relative = path.relative_to(folder).as_posix()
        items.append({"item_path": relative, "name": path.name, "size_bytes": path.stat().st_size})
    return {"items": items, "count": len(items)}


def _run_router(item_path: str | None = None) -> dict[str, object]:
    root = _data_root()
    if not ROUTER_SCRIPT.is_file():
        raise HTTPException(status_code=503, detail="Inbox processor script is not installed")
    command = [sys.executable, str(ROUTER_SCRIPT)]
    if item_path is not None:
        command.extend(["--item", item_path])
    environment = os.environ.copy()
    environment["BRAIN_DATA_PATH"] = str(root)
    try:
        completed = subprocess.run(
            command,
            cwd=str(ROUTER_SCRIPT.parent),
            env=environment,
            capture_output=True,
            text=True,
            timeout=300,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise HTTPException(status_code=504, detail="Inbox processing exceeded 5 minutes") from error
    if completed.returncode != 0:
        detail = completed.stderr.strip() or "Inbox processor failed"
        try:
            detail = json.loads(completed.stderr).get("error", detail)
        except (json.JSONDecodeError, AttributeError):
            pass
        raise HTTPException(status_code=400, detail=detail)
    try:
        result = json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=500, detail="Inbox processor returned invalid output") from error
    if result.get("status") == "locked":
        raise HTTPException(status_code=409, detail="Inbox processor is already running")
    return result


@router.get("/new")
def list_new_items() -> dict[str, object]:
    return _list_items("new")


@router.get("/processed")
def list_processed_items() -> dict[str, object]:
    return _list_items("processed")


@router.post("/process")
def trigger_inbox_processor() -> dict[str, object]:
    return _run_router()


@router.post("/mark-processed")
def mark_item_processed(request: MarkProcessedRequest) -> dict[str, object]:
    normalized = request.item_path.replace("\\", "/")
    path = PurePosixPath(normalized)
    if path.is_absolute() or ".." in path.parts or not path.parts or normalized in {".", ""}:
        raise HTTPException(status_code=400, detail="item_path must be relative to inbox/new")
    return _run_router(normalized)
