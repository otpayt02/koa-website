#!/usr/bin/env python3
"""Capture every static localized public route from a running KOA site preview."""

from __future__ import annotations

import argparse
import html
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
LANG_ROOT = ROOT / "app" / "[lang]"
LANGUAGES = ("en", "ksw", "my", "th")
BLOCK_TAGS = {"address", "article", "blockquote", "caption", "dd", "dt", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6", "li", "p", "pre", "section", "summary", "td", "th"}
SKIP_TAGS = {"script", "style", "noscript", "template", "svg"}
ACCESSIBLE_ATTRIBUTES = ("aria-label", "aria-description", "placeholder", "title", "alt", "data-tooltip")
META_NAMES = {"description", "og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description", "twitter:image:alt", "application-name"}


class CopyParser(HTMLParser):
    """Read route copy, including text hidden visually and accessibility labels."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[str] = []
        self.accessible: list[str] = []
        self.meta: list[str] = []
        self.buffer: list[str] = []
        self.block_stack: list[str] = []
        self.skipped: list[str] = []
        self.title: list[str] = []
        self.in_title = False

    @staticmethod
    def clean(value: str) -> str:
        return re.sub(r"\s+", " ", html.unescape(value)).strip()

    def flush(self) -> None:
        value = self.clean("".join(self.buffer))
        self.buffer.clear()
        if value:
            block = self.block_stack[-1] if self.block_stack else "text"
            if block.startswith("h") and len(block) == 2 and block[1].isdigit():
                self.blocks.append(f"{block.upper()}: {value}")
            else:
                self.blocks.append(value)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        for name in ACCESSIBLE_ATTRIBUTES:
            value = self.clean(attr.get(name) or "")
            if value:
                self.accessible.append(f"[{name}] {value}")
        input_type = (attr.get("type") or "").lower()
        if tag == "input" and input_type in {"button", "submit", "reset"}:
            value = self.clean(attr.get("value") or "")
            if value:
                self.accessible.append(f"[value] {value}")
        if self.skipped:
            if tag == self.skipped[-1]:
                self.skipped.append(tag)
            return
        if tag in SKIP_TAGS:
            self.flush()
            self.skipped.append(tag)
            return
        if tag in BLOCK_TAGS:
            self.flush()
            self.block_stack.append(tag)
        if tag == "title":
            self.flush()
            self.in_title = True
        if tag == "meta":
            key = (attr.get("name") or attr.get("property") or "").lower()
            value = self.clean(attr.get("content") or "")
            if key in META_NAMES and value:
                self.meta.append(f"[{key}] {value}")
    def handle_endtag(self, tag: str) -> None:
        if self.skipped:
            if tag == self.skipped[-1]:
                self.skipped.pop()
            return
        if tag == "title":
            self.in_title = False
            return
        if tag in BLOCK_TAGS:
            self.flush()
            if self.block_stack and self.block_stack[-1] == tag:
                self.block_stack.pop()
            elif tag in self.block_stack:
                self.block_stack.remove(tag)

    def handle_data(self, data: str) -> None:
        if self.skipped:
            return
        if data:
            if self.in_title:
                self.title.append(data)
            else:
                self.buffer.append(data)

    def finish(self) -> tuple[str, list[str], list[str], list[str]]:
        self.flush()
        title_text = self.clean("".join(self.title))
        return title_text, self.blocks, self.accessible, self.meta


def public_routes() -> list[str]:
    routes: set[str] = set()
    for page in LANG_ROOT.rglob("page.tsx"):
        parts = page.parent.relative_to(LANG_ROOT).parts
        if "admin" in parts:
            continue
        if any(part.startswith("[") and part.endswith("]") for part in parts):
            continue
        route = "/".join(part for part in parts if not (part.startswith("(") and part.endswith(")")))
        routes.add(route)
    return sorted(routes, key=lambda route: (route != "", route))


def fetch_page(base_url: str, path: str) -> tuple[int, str]:
    url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"
    request = Request(url, headers={"User-Agent": "KOA-Published-Copy-Exporter/1.0"})
    with urlopen(request, timeout=35) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:3004", help="running local or staging preview origin")
    parser.add_argument("--output", default=str(ROOT / "content" / "published-site-copy.txt"), help="output UTF-8 text file")
    args = parser.parse_args()

    routes = public_routes()
    if not routes:
        print(f"No static page.tsx routes found under {LANG_ROOT}", file=sys.stderr)
        return 2

    lines = [
        "KOA PUBLISHED WEBSITE COPY",
        f"Captured: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        f"Source preview: {args.base_url.rstrip('/')}",
        f"Scope: {len(routes) * len(LANGUAGES)} static public routes ({len(routes)} routes x {len(LANGUAGES)} languages: {', '.join(LANGUAGES)}).",
        "Each route records rendered text in reading order, including visually hidden text, accessibility labels, image alt text, placeholders, tooltips, and share metadata.",
        "Dynamic record/profile URLs and admin routes are excluded. Text that only exists in a non-rendered source branch is tracked by the translation inventory, not represented as rendered page copy here.",
        "",
    ]
    errors: list[str] = []
    page_count = 0
    text_count = 0
    for lang in LANGUAGES:
        for route in routes:
            page_path = f"/{lang}/{route}" if route else f"/{lang}/"
            lines.extend(["=" * 78, f"PAGE {page_path}"])
            try:
                status, source = fetch_page(args.base_url, page_path)
            except (HTTPError, URLError, TimeoutError, OSError) as error:
                message = f"{page_path}: {error}"
                errors.append(message)
                lines.append(f"FETCH ERROR: {error}")
                continue
            if status != 200:
                message = f"{page_path}: HTTP {status}"
                errors.append(message)
                lines.append(f"HTTP STATUS: {status}")
                continue
            copy = CopyParser()
            copy.feed(source)
            title, blocks, accessible, meta = copy.finish()
            lines.append(f"HTTP STATUS: {status}")
            if title:
                lines.append(f"PAGE TITLE: {title}")
            if blocks:
                lines.append("RENDERED PAGE TEXT:")
                lines.extend(blocks)
                text_count += len(blocks)
            if accessible:
                lines.append("ACCESSIBLE AND INTERACTION LABELS:")
                lines.extend(accessible)
                text_count += len(accessible)
            if meta:
                lines.append("PUBLIC SHARE METADATA:")
                lines.extend(meta)
                text_count += len(meta)
            page_count += 1
            lines.append("")

    lines.extend([
        "=" * 78,
        "CAPTURE SUMMARY",
        f"Successful route captures: {page_count}/{len(routes) * len(LANGUAGES)}",
        f"Captured text and label records: {text_count}",
        f"Source inventory: {len(routes)} static page routes x {len(LANGUAGES)} languages",
        "",
    ])
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {output} ({page_count}/{len(routes) * len(LANGUAGES)} routes; {text_count} text/label records)")
    if errors:
        print("Incomplete capture:", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
