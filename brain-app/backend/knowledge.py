"""Small, private SQLite vector index using deterministic Unicode character n-grams.

The vectors support lexical similarity across scripts; they are not semantic embeddings.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import sqlite3
import struct
from pathlib import Path

DIMENSIONS = 256
MAX_FILE_BYTES = 1_000_000
MAX_CHUNKS = 10_000


def database_path() -> Path:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    private = root / "brain-app" / "private"
    if private.is_symlink() or not private.resolve().is_relative_to(root):
        raise ValueError("private index path must stay inside BRAIN_DATA_PATH")
    private.mkdir(parents=True, exist_ok=True)
    return private / "knowledge.sqlite3"


def vectorize(text: str) -> bytes:
    normalized = " ".join(text.casefold().split())
    values = [0.0] * DIMENSIONS
    for length in (2, 3, 4):
        for offset in range(max(0, len(normalized) - length + 1)):
            gram = normalized[offset:offset + length].encode("utf-8")
            digest = hashlib.blake2b(gram, digest_size=8).digest()
            bucket = int.from_bytes(digest[:4], "little") % DIMENSIONS
            values[bucket] += 1.0 if digest[4] & 1 else -1.0
    magnitude = math.sqrt(sum(value * value for value in values))
    if magnitude:
        values = [value / magnitude for value in values]
    return struct.pack(f"<{DIMENSIONS}f", *values)


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(database_path(), timeout=10)
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    connection.executescript("""
        CREATE TABLE IF NOT EXISTS documents (
            path TEXT PRIMARY KEY, source TEXT NOT NULL, title TEXT NOT NULL,
            digest TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chunks (
            path TEXT NOT NULL REFERENCES documents(path) ON DELETE CASCADE,
            ordinal INTEGER NOT NULL, content TEXT NOT NULL, vector BLOB NOT NULL,
            PRIMARY KEY (path, ordinal)
        );
    """)
    return connection


def _extract(path: Path, drive_revisions: dict[str, str] | None) -> tuple[str, str, str, str | None] | None:
    if path.stat().st_size > MAX_FILE_BYTES or path.is_symlink():
        return None
    if path.suffix.lower() == ".json":
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeError, json.JSONDecodeError):
            return None
        if not isinstance(record, dict):
            return None
        source = record.get("source", "local")
        if source not in {"drive", "github", "signal"}:
            return None
        if source == "drive" and (drive_revisions is None
                                  or drive_revisions.get(str(record.get("file_id"))) != record.get("revision")):
            return None
        if source == "signal" and (
            os.getenv("SIGNAL_INGEST_APPROVED") != "true"
            or not os.getenv("SIGNAL_GROUP_ID")
            or record.get("group_id") != os.getenv("SIGNAL_GROUP_ID")
        ):
            return None
        content = record.get("content_utf8") or record.get("text") or record.get("title") or ""
        title = record.get("name") or record.get("title") or path.stem
        if source == "github":
            content = " ".join(str(record.get(key) or "") for key in ("title", "message", "repository", "event", "action", "url"))
        fingerprint = hashlib.sha256(json.dumps(record, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
        return source, str(title)[:300], str(content)[:MAX_FILE_BYTES], fingerprint
    if path.suffix.lower() in {".md", ".txt", ".csv"}:
        return "local", path.name, path.read_text(encoding="utf-8", errors="replace"), None
    return None


def sync_processed() -> dict[str, int]:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    folder = root / "inbox" / "processed"
    scope_path = Path(os.getenv("GOOGLE_CURSOR_PATH", str(root / "brain-app/private/drive-cursor.txt"))).with_suffix(".scope.json")
    drive_revisions = json.loads(scope_path.read_text(encoding="utf-8")) if scope_path.exists() else None
    connection = _connect()
    indexed = 0
    seen: set[str] = set()
    seen_records: set[str] = set()
    try:
        for path in sorted(folder.rglob("*")) if folder.exists() else []:
            if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(folder.resolve()):
                continue
            if path.name == ".manifest.json":
                continue
            extracted = _extract(path, drive_revisions)
            if not extracted:
                continue
            source, title, content, fingerprint = extracted
            if not content.strip():
                continue
            if fingerprint and fingerprint in seen_records:
                continue
            if fingerprint:
                seen_records.add(fingerprint)
            relative = path.relative_to(root).as_posix()
            seen.add(relative)
            digest = hashlib.sha256(f"{source}\0{title}\0{content}".encode("utf-8")).hexdigest()
            current = connection.execute("SELECT digest FROM documents WHERE path=?", (relative,)).fetchone()
            if current and current[0] == digest:
                continue
            chunks = [content[start:start + 900] for start in range(0, min(len(content), MAX_FILE_BYTES), 780)]
            existing = connection.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
            if existing + len(chunks) > MAX_CHUNKS:
                raise ValueError("Brain vector index reached its 10,000 chunk limit")
            with connection:
                connection.execute("DELETE FROM documents WHERE path=?", (relative,))
                connection.execute("INSERT INTO documents(path,source,title,digest) VALUES (?,?,?,?)", (relative, source, title, digest))
                connection.executemany("INSERT INTO chunks(path,ordinal,content,vector) VALUES (?,?,?,?)",
                                       [(relative, number, chunk, vectorize(chunk)) for number, chunk in enumerate(chunks)])
            indexed += 1
        with connection:
            for (stored_path,) in connection.execute("SELECT path FROM documents").fetchall():
                if stored_path not in seen:
                    connection.execute("DELETE FROM documents WHERE path=?", (stored_path,))
        return {"updated": indexed, "documents": connection.execute("SELECT COUNT(*) FROM documents").fetchone()[0],
                "chunks": connection.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]}
    finally:
        connection.close()


def search(query: str, limit: int = 10) -> list[dict[str, object]]:
    if not query.strip():
        return []
    target = struct.unpack(f"<{DIMENSIONS}f", vectorize(query))
    connection = _connect()
    try:
        rows = connection.execute(
            "SELECT c.path,c.content,c.vector,d.source,d.title FROM chunks c JOIN documents d ON d.path=c.path"
        ).fetchall()
        ranked = []
        for path, content, blob, source, title in rows:
            values = struct.unpack(f"<{DIMENSIONS}f", blob)
            score = sum(a * b for a, b in zip(target, values))
            if score > 0:
                ranked.append({"path": path, "source": source, "title": title,
                               "excerpt": content[:500], "score": round(score, 4)})
        ranked.sort(key=lambda row: row["score"], reverse=True)
        return ranked[:limit]
    finally:
        connection.close()
