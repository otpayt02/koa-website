"""Poll changes in one approved Drive folder with a durable cursor."""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
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


def main() -> None:
    folder = os.environ["GOOGLE_DRIVE_FOLDER_ID"]
    if not folder:
        raise SystemExit("Approved Drive folder ID is required")
    drive_id = os.getenv("GOOGLE_DRIVE_ID", "")
    root = Path(os.environ["BRAIN_DATA_PATH"])
    token_path = Path(os.environ["GOOGLE_TOKEN_PATH"])
    cursor_path = Path(os.environ["GOOGLE_CURSOR_PATH"])
    cursor_path.parent.mkdir(parents=True, exist_ok=True)
    token = access_token(token_path)
    refreshed_at = time.monotonic()
    drive_params = {"driveId": drive_id} if drive_id else {}
    if not cursor_path.exists():
        result = json.loads(drive_get(token, "changes/startPageToken", {"supportsAllDrives": "true", **drive_params}))
        save_cursor(cursor_path, result["startPageToken"])
    while True:
        try:
            if time.monotonic() - refreshed_at > 2700:
                token = access_token(token_path)
                refreshed_at = time.monotonic()
            cursor = cursor_path.read_text(encoding="utf-8").strip()
            params = {"pageToken": cursor, "spaces": "drive", "supportsAllDrives": "true",
                      "includeItemsFromAllDrives": "true",
                      "fields": "nextPageToken,newStartPageToken,changes(fileId,removed,file(id,name,mimeType,parents,size,md5Checksum,modifiedTime,webViewLink,trashed))",
                      **drive_params}
            response = json.loads(drive_get(token, "changes", params))
            for change in response.get("changes", []):
                item = change.get("file") or {}
                if change.get("removed") or item.get("trashed") or folder not in item.get("parents", []):
                    continue
                file_id = item.get("id")
                mime = item.get("mimeType", "")
                revision = item.get("md5Checksum") or item.get("modifiedTime")
                if not file_id or not revision or int(item.get("size", 0)) > MAX_BYTES:
                    continue
                if mime in EXPORTS:
                    export_mime, suffix = EXPORTS[mime]
                    content = drive_get(token, f"files/{file_id}/export", {"mimeType": export_mime})
                elif mime in TEXT_MIME:
                    suffix = Path(item.get("name", "")).suffix
                    content = drive_get(token, f"files/{file_id}", {"alt": "media", "supportsAllDrives": "true"})
                else:
                    continue
                record = {"source": "drive", "file_id": file_id, "revision": revision,
                          "name": item.get("name"), "mime_type": mime, "url": item.get("webViewLink"),
                          "content_format": suffix, "content_utf8": content.decode("utf-8", errors="replace")}
                write_record("drive", f"{file_id}:{revision}", record, root)
            next_token = response.get("nextPageToken") or response.get("newStartPageToken")
            if next_token:
                save_cursor(cursor_path, next_token)
            time.sleep(1 if response.get("nextPageToken") else 60)
        except Exception as error:
            print(f"Drive worker retrying: {type(error).__name__}: {error}", flush=True)
            time.sleep(60)


if __name__ == "__main__":
    main()
