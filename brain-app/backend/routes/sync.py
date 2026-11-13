"""Run one local source sync on demand and report its actual outcome."""

import json
import os
import subprocess
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from github_sync import sync_once as sync_github
from knowledge import sync_processed
from routes.inbox import _run_router

router = APIRouter(tags=["sync"])
DRIVE_SCRIPT = Path(__file__).resolve().parents[2] / "connectors" / "drive_worker.py"
_lock = threading.Lock()
_state = {"status": "idle", "started_at": None, "finished_at": None, "results": {}, "error": None}


def _run() -> None:
    results: dict[str, object] = {}
    failures = []
    try:
        results["github"] = sync_github()
    except Exception as cause:
        failures.append(f"GitHub: {type(cause).__name__}")
    folder = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")
    token_path = Path(os.getenv("GOOGLE_TOKEN_PATH", "/missing"))
    if folder and token_path.is_file():
        try:
            completed = subprocess.run([sys.executable, str(DRIVE_SCRIPT), "--once"],
                                       capture_output=True, text=True, timeout=240, check=True)
            results["drive"] = json.loads(completed.stdout)
        except Exception as cause:
            failures.append(f"Drive: {type(cause).__name__}")
    else:
        results["drive"] = {"status": "not_configured"}
    try:
        results["inbox"] = _run_router()
        results["knowledge"] = sync_processed()
    except Exception as cause:
        failures.append(f"Local index: {type(cause).__name__}")
    status = "partial" if failures else "completed"
    error = "; ".join(failures) if failures else None
    with _lock:
        _state.update(status=status, finished_at=datetime.now(timezone.utc).isoformat(),
                      results=results, error=error)


@router.get("/status")
def status():
    with _lock:
        snapshot = dict(_state)
    snapshot["connections"] = {
        "github_public": True,
        "drive_ready": bool(os.getenv("GOOGLE_DRIVE_FOLDER_ID") and Path(os.getenv("GOOGLE_TOKEN_PATH", "/missing")).is_file()),
        "signal_ready": bool(os.getenv("SIGNAL_INGEST_APPROVED") == "true"
                             and os.getenv("SIGNAL_ACCOUNT") and os.getenv("SIGNAL_GROUP_ID")),
    }
    return snapshot


@router.post("/run", status_code=202)
def run():
    with _lock:
        if _state["status"] == "running":
            raise HTTPException(status_code=409, detail="A sync is already running")
        _state.update(status="running", started_at=datetime.now(timezone.utc).isoformat(),
                      finished_at=None, results={}, error=None)
    threading.Thread(target=_run, daemon=True, name="koa-brain-sync").start()
    return {"status": "running"}
