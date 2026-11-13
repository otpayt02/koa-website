"""Write attributed connector records once, without exposing source secrets."""

from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path


def write_record(source: str, identity: str, record: dict, root: Path | None = None) -> bool:
    if source not in {"github", "drive", "signal"} or not identity or len(identity) > 512:
        raise ValueError("invalid connector identity")
    root = root or Path(os.environ["BRAIN_DATA_PATH"])
    root = root.resolve()
    inbox = root / "inbox" / "new"
    if inbox.is_symlink() or not inbox.resolve().is_relative_to(root):
        raise ValueError("inbox/new must stay inside BRAIN_DATA_PATH")
    inbox.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(f"{source}:{identity}".encode()).hexdigest()
    name = re.sub(r"[^a-z0-9-]", "-", source) + "-" + key[:24] + ".json"
    destination = inbox / name
    state = root / "brain-app" / ".connector-state" / source
    state.mkdir(parents=True, exist_ok=True)
    if state.is_symlink() or not state.resolve().is_relative_to(root):
        raise ValueError("connector state must stay inside BRAIN_DATA_PATH")
    marker = state / key
    try:
        descriptor = os.open(marker, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        if destination.exists():
            return False
        marker.unlink(missing_ok=True)
        descriptor = os.open(marker, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(descriptor)
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=inbox, prefix=".connector-", suffix=".tmp", delete=False) as output:
            json.dump(record, output, ensure_ascii=False, indent=2)
            output.write("\n")
            temporary = Path(output.name)
        os.replace(temporary, destination)
    except Exception:
        marker.unlink(missing_ok=True)
        raise
    return True
