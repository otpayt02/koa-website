"""Hourly public headline intake from two Karen news RSS feeds.

This stores attribution and links only. It does not copy articles or publish commentary.
"""

import argparse
import json
import os
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

FEEDS = {
    "Karen News": "https://karennews.org/feed/",
    "KIC News": "https://karen.kicnews.org/feed/",
}


def fetch_feed(name: str, url: str) -> list[dict[str, str]]:
    request = Request(url, headers={"User-Agent": "KOA-Brain-Local-NewsReader/1.0"})
    with urlopen(request, timeout=20) as response:
        data = response.read(1_000_001)
    if len(data) > 1_000_000:
        raise ValueError("Feed exceeds 1 MB limit")
    root = ET.fromstring(data)
    articles = []
    for item in root.findall("./channel/item")[:30]:
        title = (item.findtext("title") or "").strip()[:300]
        link = (item.findtext("link") or "").strip()
        if title and link.startswith("https://"):
            articles.append({"title": title, "url": link, "source": name,
                             "published": (item.findtext("pubDate") or "").strip()[:100]})
    return articles


def sync_once() -> dict[str, object]:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    private = root / "brain-app" / "private"
    if private.is_symlink() or not private.resolve().is_relative_to(root):
        raise ValueError("Private news path must stay in the repository")
    private.mkdir(parents=True, exist_ok=True)
    articles = []
    errors = []
    for name, url in FEEDS.items():
        try:
            articles.extend(fetch_feed(name, url))
        except (OSError, ValueError, ET.ParseError) as error:
            errors.append({"source": name, "error": type(error).__name__})
    if not articles:
        return {"articles": 0, "errors": errors, "updated": False}
    unique = list({article["url"]: article for article in articles}.values())
    payload = {"fetched_at": datetime.now(timezone.utc).isoformat(), "articles": unique,
               "source_errors": errors}
    target = private / "news-latest.json"
    temporary = target.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    os.replace(temporary, target)
    return {"articles": len(unique), "errors": errors, "updated": True}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    while True:
        try:
            print(json.dumps(sync_once()), flush=True)
        except (OSError, ValueError) as error:
            print(json.dumps({"error": type(error).__name__}), flush=True)
        if args.once:
            return
        time.sleep(3600)


if __name__ == "__main__":
    main()
