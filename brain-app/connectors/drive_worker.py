"""Backfill and poll direct children of one explicitly approved Drive folder."""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from connectors.inbox_writer import write_record

API = "https://www.googleapis.com/drive/v3"
EXPORTS = {
    "application/vnd.google-apps.document": ("text/plain", ".txt"),
    "application/vnd.google-apps.spreadsheet": ("text/csv", ".csv"),
}
TEXT_MIME = {"text/plain", "text/markdown", "text/csv", "application/json"}
MAX_BYTES = 10_000_000
FIELDS = "id,name,mimeType,parents,size,md5Checksum,modifiedTime,webViewLink,trashed"


def access_token(token_path: Path) -> str:
    saved = json.loads(token_path.read_text(encoding="utf-8"))
    required = {"client_id", "client_secret", "refresh_token"}
    if not required.issubset(saved):
        raise ValueError("OAuth token file needs client ID, secret, and refresh token")
    body = urlencode({"client_id": saved["client_id"], "client_secret": saved["client_secret"],
                      "refresh_token": saved["refresh_token"], "grant_type": "refresh_token"}).encode()
    request = Request("https://oauth2.googleapis.com/token", data=body, method="POST")
    with urlopen(request, timeout=30) as response:
        result = json.load(response)
    return result["access_token"]


def drive_get(token: str, path: str, params: dict[str, str]) -> bytes:
    request = Request(f"{API}/{path}?{urlencode(params)}", headers={"Authorization": f"Bearer {token}"})
    with urlopen(request, timeout=60) as response:
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("Drive response exceeds size limit")
    return data


def save_cursor(path: Path, token: str) -> None:
    temporary = path.with_suffix(".tmp")
    temporary.write_text(token, encoding="utf-8")
    os.replace(temporary, path)


def save_scope(path: Path, revisions: dict[str, str]) -> None:
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(revisions, sort_keys=True), encoding="utf-8")
    os.replace(temporary, path)


def _approved_revision(item: dict, folder: str) -> tuple[str, str] | None:
    if item.get("trashed") or folder not in item.get("parents", []):
        return None
    file_id = item.get("id")
    revision = item.get("md5Checksum") or item.get("modifiedTime")
    if (not file_id or not revision or int(item.get("size", 0)) > MAX_BYTES
            or item.get("mimeType") not in {*EXPORTS, *TEXT_MIME}):
        return None
    return file_id, revision


def _configured_paths() -> tuple[str, str, Path, Path, Path]:
    folder = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "")
    if not re.fullmatch(r"[A-Za-z0-9_-]{10,200}", folder):
        raise ValueError("An approved Drive folder ID is required")
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    private_path = root / "brain-app" / "private"
    if private_path.is_symlink():
        raise ValueError("Drive private path must not be a symbolic link")
    private = private_path.resolve()
    if not private.is_relative_to(root):
        raise ValueError("Drive private path must stay inside BRAIN_DATA_PATH")
    token_path = Path(os.environ["GOOGLE_TOKEN_PATH"]).resolve()
    cursor_path = Path(os.environ["GOOGLE_CURSOR_PATH"]).resolve()
    if not token_path.is_relative_to(private) or not cursor_path.is_relative_to(private):
        raise ValueError("Drive token and cursor must stay inside the private path")
    cursor_path.parent.mkdir(parents=True, exist_ok=True)
    return folder, os.getenv("GOOGLE_DRIVE_ID", ""), root, token_path, cursor_path


def _ingest_file(token: str, root: Path, folder: str, item: dict) -> bool:
    approved = _approved_revision(item, folder)
    if not approved:
        return False
    file_id, revision = approved
    mime = item.get("mimeType", "")
    if mime in EXPORTS:
        export_mime, suffix = EXPORTS[mime]
        content = drive_get(token, f"files/{file_id}/export", {"mimeType": export_mime})
    elif mime in TEXT_MIME:
        suffix = Path(item.get("name", "")).suffix
        content = drive_get(token, f"files/{file_id}", {"alt": "media", "supportsAllDrives": "true"})
    else:
        return False
    record = {"source": "drive", "file_id": file_id, "revision": revision,
              "name": item.get("name"), "mime_type": mime, "url": item.get("webViewLink"),
              "content_format": suffix, "content_utf8": content.decode("utf-8", errors="replace")}
    return write_record("drive", f"{file_id}:{revision}", record, root)


def sync_once() -> dict[str, int]:
    folder, drive_id, root, token_path, cursor_path = _configured_paths()
    token = access_token(token_path)
    params = {"supportsAllDrives": "true", "includeItemsFromAllDrives": "true"}
    if drive_id:
        params.update({"driveId": drive_id, "corpora": "drive"})
    if not cursor_path.exists():
        start = json.loads(drive_get(token, "changes/startPageToken", {"supportsAllDrives": "true", **({"driveId": drive_id} if drive_id else {})}))
        save_cursor(cursor_path, start["startPageToken"])
    ingested = 0
    backfill_marker = cursor_path.with_suffix(".backfill-complete")
    scope_path = cursor_path.with_suffix(".scope.json")
    revisions = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else {}
    if not backfill_marker.exists():
        revisions = {}
        page = ""
        while True:
            listing = json.loads(drive_get(token, "files", {
                **params, "q": f"'{folder}' in parents and trashed = false", "pageSize": "1000",
                "fields": f"nextPageToken,files({FIELDS})", **({"pageToken": page} if page else {}),
            }))
            for item in listing.get("files", []):
                approved = _approved_revision(item, folder)
                if approved:
                    revisions[approved[0]] = approved[1]
                ingested += int(_ingest_file(token, root, folder, item))
            page = listing.get("nextPageToken", "")
            if not page:
                break
        save_scope(scope_path, revisions)
        backfill_marker.touch()
    while True:
        cursor = cursor_path.read_text(encoding="utf-8").strip()
        response = json.loads(drive_get(token, "changes", {
            "pageToken": cursor, "spaces": "drive", **params,
            "fields": f"nextPageToken,newStartPageToken,changes(fileId,removed,file({FIELDS}))",
        }))
        for change in response.get("changes", []):
            item = change.get("file") or {}
            file_id = change.get("fileId") or item.get("id")
            approved = None if change.get("removed") else _approved_revision(item, folder)
            if approved:
                ingested += int(_ingest_file(token, root, folder, item))
                revisions[approved[0]] = approved[1]
            elif file_id:
                revisions.pop(file_id, None)
        save_scope(scope_path, revisions)
        next_token = response.get("nextPageToken") or response.get("newStartPageToken")
        if next_token:
            save_cursor(cursor_path, next_token)
        if not response.get("nextPageToken"):
            break
    return {"ingested": ingested}


def interval_seconds() -> int:
    raw = int(os.getenv("DRIVE_SYNC_INTERVAL_SECONDS", "60"))
    if raw < 15 or raw > 3600:
        raise ValueError("DRIVE_SYNC_INTERVAL_SECONDS must be between 15 and 3600")
    return raw


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    if args.once:
        print(json.dumps(sync_once()))
        return
    delay = interval_seconds()
    failures = 0
    while True:
        try:
            print(json.dumps(sync_once()), flush=True)
            failures = 0
            time.sleep(delay)
        except (OSError, ValueError, KeyError, HTTPError) as error:
            failures += 1
            print(f"Drive worker retrying: {type(error).__name__}", flush=True)
            time.sleep(min(delay * (2 ** min(failures, 5)), 3600))


if __name__ == "__main__":
    main()
