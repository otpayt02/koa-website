"""Read public KOA repository activity when no HTTPS webhook ingress is available."""

import json
import os
import base64
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from connectors.inbox_writer import write_record

REPO = "otpayt02/koa-website"
API = f"https://api.github.com/repos/{REPO}"
SOURCE_FILES = (
    "README.md",
    "docs/KOA-VISION.md",
    "docs/koa-content-map.md",
    "docs/koa-editorial-workflow.md",
    "docs/TEAM-WORKSPACE.md",
    "docs/adr/0001-versioned-bilingual-publication.md",
    "docs/cloudflare-migration.md",
)


def _get(path: str) -> list[dict]:
    token = os.getenv("GITHUB_TOKEN", "")
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "koa-company-brain"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    with urlopen(Request(f"{API}/{path}", headers=headers), timeout=25) as response:
        result = json.load(response)
    if not isinstance(result, list):
        raise ValueError("GitHub returned an unexpected response")
    return result


def _get_source_file(path: str, ref: str) -> dict:
    token = os.getenv("GITHUB_TOKEN", "")
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "koa-company-brain"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = Request(f"{API}/contents/{path}?{urlencode({'ref': ref})}", headers=headers)
    with urlopen(request, timeout=25) as response:
        item = json.load(response)
    if (not isinstance(item, dict) or item.get("type") != "file" or item.get("encoding") != "base64"
            or not isinstance(item.get("sha"), str) or int(item.get("size", 0)) > 100_000):
        raise ValueError(f"Unexpected GitHub source file: {path}")
    content = base64.b64decode(item["content"], validate=False).decode("utf-8")
    return {"source": "github", "repository": REPO, "event": "source_file",
            "source_id": f"{path}:{item['sha']}", "path": path, "sha": item["sha"],
            "title": path, "content_utf8": content, "url": item.get("html_url")}


def _save_source_scope(revisions: dict[str, str]) -> None:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    private = root / "brain-app" / "private"
    if private.is_symlink() or not private.resolve().is_relative_to(root):
        raise ValueError("GitHub scope path must stay inside BRAIN_DATA_PATH")
    private.mkdir(parents=True, exist_ok=True)
    path = private / "github-files.scope.json"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(revisions, sort_keys=True), encoding="utf-8")
    os.replace(temporary, path)


def sync_once() -> dict[str, int]:
    written = 0
    for commit in _get("commits?" + urlencode({"per_page": 30})):
        sha = commit.get("sha")
        details = commit.get("commit") or {}
        if not isinstance(sha, str):
            continue
        record = {"source": "github", "repository": REPO, "event": "commit",
                  "source_id": sha, "title": (details.get("message") or "").splitlines()[0][:300],
                  "message": (details.get("message") or "")[:2000],
                  "created_at": (details.get("author") or {}).get("date"),
                  "url": commit.get("html_url")}
        written += int(write_record("github", f"commit:{sha}", record))
    for issue in _get("issues?" + urlencode({"state": "all", "per_page": 30})):
        number = issue.get("number")
        if not isinstance(number, int):
            continue
        revision = issue.get("updated_at") or issue.get("created_at") or ""
        kind = "pull_request" if "pull_request" in issue else "issue"
        record = {"source": "github", "repository": REPO, "event": kind,
                  "source_id": number, "title": str(issue.get("title") or "")[:300],
                  "message": str(issue.get("body") or "")[:2000],
                  "created_at": issue.get("created_at"), "url": issue.get("html_url")}
        written += int(write_record("github", f"{kind}:{number}:{revision}", record))
    revisions: dict[str, str] = {}
    ref = os.getenv("GITHUB_REF", "codex/koa-company-brain-connectors")
    for path in SOURCE_FILES:
        record = _get_source_file(path, ref)
        revisions[path] = record["sha"]
        written += int(write_record("github", f"file:{record['source_id']}", record))
    _save_source_scope(revisions)
    return {"ingested": written, "source_files": len(revisions)}
