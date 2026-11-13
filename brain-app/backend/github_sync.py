"""Read public KOA repository activity when no HTTPS webhook ingress is available."""

import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from connectors.inbox_writer import write_record

REPO = "otpayt02/koa-website"
API = f"https://api.github.com/repos/{REPO}"


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
    return {"ingested": written}
