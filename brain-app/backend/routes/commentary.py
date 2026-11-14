"""Private commentary ideas and drafts, with no automatic publication."""

import json
import os
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from routes.news import latest_news

router = APIRouter(tags=["commentary"])
_lock = threading.Lock()
CENTRAL = ZoneInfo("America/Chicago")


class DraftInput(BaseModel):
    headline: str = Field(min_length=5, max_length=300)
    source_url: str = Field(max_length=1000)
    angle_en: str = Field(min_length=10, max_length=2000)
    body_en: str = Field(default="", max_length=10000)
    body_ksw: str = Field(default="", max_length=10000)


def _path() -> Path:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    private = root / "brain-app" / "private"
    if private.is_symlink() or not private.resolve().is_relative_to(root):
        raise ValueError("Private commentary path must stay in the repository")
    private.mkdir(parents=True, exist_ok=True)
    return private / "commentary-drafts.json"


def _read() -> list[dict]:
    target = _path()
    if target.is_symlink():
        raise ValueError("Commentary draft file must not be a symbolic link")
    return json.loads(target.read_text(encoding="utf-8")) if target.is_file() else []


@router.get("")
def list_drafts():
    return {"drafts": _read()}


@router.get("/schedule")
def schedule():
    current = datetime.now(CENTRAL)
    days = []
    cursor = current.date()
    while len(days) < 6:
        if cursor.weekday() in (0, 2, 4):
            slot = datetime.combine(cursor, datetime.min.time(), CENTRAL).replace(hour=9)
            if slot > current:
                days.append(slot.isoformat())
        cursor += timedelta(days=1)
    return {"timezone": "America/Chicago", "draft_review_slots": days,
            "note": "Editorial review reminders only; nothing publishes automatically."}


@router.get("/suggestions")
def suggestions():
    articles = latest_news()["articles"][:20]
    return {"suggestions": [{"headline": item["title"], "source_url": item["url"],
                             "source": item["source"], "published": item["published"],
                             "review_question": "What does this source mean for Karen communities, and what facts need independent verification?"}
                            for item in articles]}


@router.get("/{draft_id}")
def get_draft(draft_id: str):
    draft = next((item for item in _read() if item["id"] == draft_id), None)
    if draft is None:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.post("", status_code=201)
def create_draft(value: DraftInput):
    parsed = urlparse(value.source_url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise HTTPException(status_code=422, detail="A public HTTPS source URL is required")
    draft = {"id": uuid4().hex, "headline": value.headline.strip(),
             "source_url": value.source_url, "angle_en": value.angle_en.strip(),
             "body_en": value.body_en.strip(), "body_ksw": value.body_ksw.strip(),
             "translation_status": "pending_review" if value.body_ksw.strip() else "not_provided",
             "status": "draft", "created_at": datetime.now(timezone.utc).isoformat()}
    with _lock:
        target = _path()
        drafts = _read()
        drafts.append(draft)
        temporary = target.with_suffix(".tmp")
        temporary.write_text(json.dumps(drafts, ensure_ascii=False), encoding="utf-8")
        os.replace(temporary, target)
    return draft


@router.post("/publish")
def publish_requires_review():
    raise HTTPException(status_code=409, detail="Public publication requires editorial and S'gaw Karen review in the site release workflow")
