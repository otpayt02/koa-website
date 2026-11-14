"""Read the locally cached, attributed public news intake."""

import json
import os
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(tags=["news"])


@router.get("")
def latest_news():
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    target = root / "brain-app" / "private" / "news-latest.json"
    if not target.is_file() or target.is_symlink() or not target.resolve().is_relative_to(root):
        return {"fetched_at": None, "articles": [], "source_errors": []}
    return json.loads(target.read_text(encoding="utf-8"))
