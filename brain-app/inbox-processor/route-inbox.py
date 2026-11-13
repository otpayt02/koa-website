#!/usr/bin/env python3
"""Route files from inbox/new into topic indexes and inbox/processed."""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote


TOPICS = ("projects", "decisions", "references", "prompts", "connections", "brain")
TEXT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".text", ".rst", ".csv", ".tsv", ".json",
    ".yaml", ".yml", ".toml", ".ini", ".log", ".html", ".htm", ".xml",
}
MAX_TEXT_BYTES = 1_000_000
LOCK_STALE_SECONDS = 6 * 60 * 60


def data_root() -> Path:
    configured = os.environ.get("BRAIN_DATA_PATH")
    # Local invocation defaults to the repository root; containers set the env.
    root = Path(configured).expanduser() if configured else Path(__file__).resolve().parents[2]
    return root.resolve()


def _contained(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def _logger(root: Path) -> logging.Logger:
    inbox_path = root / "inbox"
    if inbox_path.is_symlink():
        raise ValueError("inbox must not be a symbolic link")
    inbox_path.mkdir(parents=True, exist_ok=True)
    if not _contained(inbox_path, root):
        raise ValueError("inbox must be inside BRAIN_DATA_PATH")
    log_path = inbox_path / "processor.log"
    if log_path.is_symlink():
        raise ValueError("inbox/processor.log must not be a symbolic link")
    log_path.parent.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("koa.inbox.processor")
    logger.setLevel(logging.INFO)
    if not any(getattr(handler, "baseFilename", None) == str(log_path) for handler in logger.handlers):
        handler = logging.FileHandler(log_path, encoding="utf-8")
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
        logger.addHandler(handler)
    return logger


def _digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _text_for_classification(path: Path) -> str:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return ""
    try:
        with path.open("rb") as source:
            raw = source.read(MAX_TEXT_BYTES + 1)
        return raw[:MAX_TEXT_BYTES].decode("utf-8", errors="ignore")
    except OSError:
        return ""


def classify(path: Path, relative_path: Path) -> str:
    haystack = f"{relative_path.as_posix()}\n{_text_for_classification(path)}".lower()
    matches: list[tuple[int, int, str]] = []
    for order, topic in enumerate(TOPICS):
        stem = topic[:-1] if topic.endswith("s") else topic
        count = len(re.findall(rf"(?<![a-z0-9]){re.escape(stem)}s?(?![a-z0-9])", haystack))
        if count:
            matches.append((count, -order, topic))
    return max(matches)[2] if matches else "brain"


def _read_manifest(path: Path) -> dict[str, dict[str, str]]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _write_manifest(path: Path, manifest: dict[str, dict[str, str]]) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(temporary, path)


def _unique_destination(base: Path, relative: Path, digest: str) -> Path:
    target = base / relative
    if not target.exists():
        return target
    if target.is_file() and _digest(target) == digest:
        return target
    suffix = target.suffix
    stem = target.name[:-len(suffix)] if suffix else target.name
    candidate = target.with_name(f"{stem}__{digest[:8]}{suffix}")
    counter = 2
    while candidate.exists():
        if candidate.is_file() and _digest(candidate) == digest:
            return candidate
        candidate = target.with_name(f"{stem}__{digest[:8]}_{counter}{suffix}")
        counter += 1
    return candidate


def _write_reference(root: Path, topic: str, stored_path: Path, digest: str) -> None:
    topic_dir = root / topic
    if topic_dir.is_symlink():
        raise ValueError(f"{topic} must not be a symbolic link")
    topic_dir.mkdir(parents=True, exist_ok=True)
    if not _contained(topic_dir, root):
        raise ValueError(f"{topic} must be inside BRAIN_DATA_PATH")
    index_path = topic_dir / f"{topic}.md"
    if index_path.is_symlink():
        raise ValueError(f"{index_path.relative_to(root)} must not be a symbolic link")
    if not index_path.exists():
        index_path.write_text(f"# {topic.title()}\n\n", encoding="utf-8")
    relative_link = Path(os.path.relpath(stored_path, index_path.parent)).as_posix()
    href = quote(relative_link, safe="/._-()")
    label = stored_path.name.replace("[", "\\[").replace("]", "\\]")
    marker = f"<!-- inbox-item:{digest} -->"
    existing = index_path.read_text(encoding="utf-8")
    if marker in existing:
        return
    with index_path.open("a", encoding="utf-8", newline="\n") as index:
        if existing and not existing.endswith("\n"):
            index.write("\n")
        index.write(f"- [{label}]({href}) {marker}\n")


def _process_one(root: Path, source: Path, new_dir: Path, processed_dir: Path,
                 manifest: dict[str, dict[str, str]], logger: logging.Logger) -> dict[str, str]:
    if source.is_symlink() or not source.is_file() or not _contained(source, new_dir):
        raise ValueError("item must be a regular file under inbox/new")
    relative = source.relative_to(new_dir)
    digest = _digest(source)

    if digest in manifest:
        duplicate_root = processed_dir / "duplicates"
        if not _contained(duplicate_root / relative.parent, processed_dir):
            raise ValueError("duplicate destination must stay inside inbox/processed")
        destination = _unique_destination(duplicate_root, relative, digest)
        destination.parent.mkdir(parents=True, exist_ok=True)
        source.replace(destination)
        logger.info("Skipped duplicate %s -> %s", relative.as_posix(), destination.relative_to(root).as_posix())
        return {"item_path": relative.as_posix(), "status": "skipped_duplicate",
                "processed_path": destination.relative_to(root).as_posix()}

    topic = classify(source, relative)
    if not _contained(processed_dir / relative.parent, processed_dir):
        raise ValueError("processed destination must stay inside inbox/processed")
    destination = _unique_destination(processed_dir, relative, digest)
    destination.parent.mkdir(parents=True, exist_ok=True)
    source.replace(destination)
    try:
        _write_reference(root, topic, destination, digest)
    except Exception:
        destination.replace(source)
        raise
    manifest[digest] = {
        "topic": topic,
        "path": destination.relative_to(root).as_posix(),
        "source": relative.as_posix(),
    }
    logger.info("Routed %s -> %s (topic=%s)", relative.as_posix(), destination.relative_to(root).as_posix(), topic)
    return {"item_path": relative.as_posix(), "status": "processed", "topic": topic,
            "processed_path": destination.relative_to(root).as_posix(),
            "reference_path": f"{topic}/{topic}.md"}


def process_inbox(root: Path | None = None, item_path: str | None = None) -> dict[str, object]:
    root = (root or data_root()).resolve()
    inbox_dir = root / "inbox"
    new_dir = inbox_dir / "new"
    processed_dir = inbox_dir / "processed"
    if inbox_dir.is_symlink() or new_dir.is_symlink() or processed_dir.is_symlink():
        raise ValueError("inbox, inbox/new, and inbox/processed must not be symbolic links")
    new_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    if not _contained(new_dir, root) or not _contained(processed_dir, root):
        raise ValueError("inbox folders must stay inside BRAIN_DATA_PATH")
    logger = _logger(root)

    lock = inbox_dir / ".route-inbox.lock"
    try:
        lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        try:
            if time.time() - lock.stat().st_mtime > LOCK_STALE_SECONDS:
                lock.unlink()
                lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            else:
                logger.info("Skipped run because another processor holds the lock")
                return {"status": "locked", "processed_count": 0, "skipped_count": 0, "items": []}
        except (FileNotFoundError, FileExistsError):
            return {"status": "locked", "processed_count": 0, "skipped_count": 0, "items": []}

    os.close(lock_fd)
    try:
        manifest_path = processed_dir / ".manifest.json"
        if manifest_path.is_symlink():
            raise ValueError("inbox/processed/.manifest.json must not be a symbolic link")
        manifest = _read_manifest(manifest_path)
        if item_path is not None:
            normalized = item_path.replace("\\", "/")
            relative = Path(normalized)
            if relative.is_absolute() or ".." in relative.parts or not relative.parts:
                raise ValueError("item_path must be a relative path inside inbox/new")
            candidates = [new_dir / relative]
            if not _contained(candidates[0], new_dir):
                raise ValueError("item_path must be inside inbox/new")
        else:
            candidates = sorted(
                (path for path in new_dir.rglob("*")
                 if path.is_file() and not path.is_symlink() and _contained(path, new_dir)),
                key=lambda path: path.relative_to(new_dir).as_posix().casefold(),
            )

        results: list[dict[str, str]] = []
        for source in candidates:
            if not source.exists():
                if item_path is not None:
                    raise FileNotFoundError(f"inbox item not found: {item_path}")
                continue
            results.append(_process_one(root, source, new_dir, processed_dir, manifest, logger))
            _write_manifest(manifest_path, manifest)

        return {
            "status": "completed",
            "processed_count": sum(item["status"] == "processed" for item in results),
            "skipped_count": sum(item["status"] == "skipped_duplicate" for item in results),
            "items": results,
        }
    except Exception as error:
        logger.exception("Inbox processing failed: %s", error)
        raise
    finally:
        try:
            lock.unlink()
        except FileNotFoundError:
            pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--item", help="Process one relative path under inbox/new")
    args = parser.parse_args()
    try:
        print(json.dumps(process_inbox(item_path=args.item), ensure_ascii=False))
        return 0
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
