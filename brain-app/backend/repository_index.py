"""Import readable, non-secret repository files as local Brain sources."""
from __future__ import annotations

import hashlib
import os
import re
import sqlite3
import subprocess
from pathlib import Path

from knowledge import MAX_CHUNKS, _chunks, _connect, embed

ALLOW = {".md", ".txt", ".py", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".yml", ".yaml", ".toml", ".sql", ".sh", ".ps1", ".csv", ".xml", ".svg"}
SKIP = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build", ".next", "coverage", "private", ".connector-state", "inbox", ".codex", "output"}
SECRET = re.compile(r"(?i)(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*['\"]?[^\s'\"]{12,}")


def sync_repository() -> dict[str, int]:
    root = Path(os.environ["BRAIN_DATA_PATH"]).resolve(strict=True)
    process = subprocess.run(["git", "-C", str(root), "ls-files", "--cached", "--others", "--exclude-standard", "-z"], check=True, capture_output=True)
    files = []
    for raw in process.stdout.split(b"\0"):
        if not raw:
            continue
        relative = Path(os.fsdecode(raw))
        if relative.name.lower() == ".env" or relative.suffix.lower() not in ALLOW or any(part.lower() in SKIP for part in relative.parts):
            continue
        path = root / relative
        try:
            if path.is_symlink() or path.stat().st_size > 500_000:
                continue
            content = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        if SECRET.search(content):
            continue
        files.append((relative.as_posix(), path.name, content))
    connection = _connect()
    seen, updated = set(), 0
    try:
        for path, title, content in files:
            key = f"repo/{path}"
            seen.add(key)
            digest = hashlib.sha256(content.encode()).hexdigest()
            current = connection.execute("SELECT digest FROM documents WHERE path=?", (key,)).fetchone()
            if current and current[0] == digest:
                continue
            parts = _chunks(content)
            count = connection.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
            if count + len(parts) > MAX_CHUNKS:
                raise ValueError(f"Brain vector index reached its {MAX_CHUNKS:,} chunk limit")
            vectors = [embed(part) for part in parts]
            with connection:
                connection.execute("DELETE FROM documents WHERE path=?", (key,))
                connection.execute("INSERT INTO documents(path,source,title,digest) VALUES (?,?,?,?)", (key, "repo", title, digest))
                connection.executemany("INSERT INTO chunks(path,ordinal,content,vector) VALUES (?,?,?,?)", [(key, i, part, vector) for i, (part, vector) in enumerate(zip(parts, vectors))])
            updated += 1
        with connection:
            for (path,) in connection.execute("SELECT path FROM documents WHERE source='repo'").fetchall():
                if path not in seen:
                    connection.execute("DELETE FROM documents WHERE path=?", (path,))
        return {"updated": updated, "eligible_files": len(files), "documents": connection.execute("SELECT COUNT(*) FROM documents WHERE source='repo'").fetchone()[0], "chunks": connection.execute("SELECT COUNT(*) FROM chunks c JOIN documents d ON d.path=c.path WHERE d.source='repo'").fetchone()[0]}
    finally:
        connection.close()
