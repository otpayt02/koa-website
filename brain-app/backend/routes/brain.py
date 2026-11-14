"""Read-only graph projection of the local lexical vector index.

Edges represent character n-gram similarity, not inferred semantic facts.
"""

from __future__ import annotations

import hashlib
import math
import struct

from fastapi import APIRouter, HTTPException, Query

from knowledge import DIMENSIONS, _connect, search

router = APIRouter(tags=["brain"])
MAX_NODES = 120
MAX_EDGES = 240


def _node_id(path: str) -> str:
    return hashlib.sha256(path.encode("utf-8")).hexdigest()[:20]


def _position(path: str) -> list[float]:
    digest = hashlib.sha256(path.encode("utf-8")).digest()
    angle = int.from_bytes(digest[:4], "big") / 2**32 * 2 * math.pi
    height = int.from_bytes(digest[4:8], "big") / 2**32 * 2 - 1
    radius = math.sqrt(1 - height * height) * 4
    return [round(radius * math.cos(angle), 3), round(height * 3, 3), round(radius * math.sin(angle), 3)]


def graph_data() -> dict:
    connection = _connect()
    try:
        rows = connection.execute("""
            SELECT d.path, d.source, d.title, c.content, c.vector
            FROM documents d JOIN chunks c ON c.path=d.path AND c.ordinal=0
            ORDER BY d.path LIMIT ?
        """, (MAX_NODES,)).fetchall()
    finally:
        connection.close()
    nodes = [{"id": _node_id(path), "source": source, "title": title,
              "excerpt": content[:240], "position": _position(path)}
             for path, source, title, content, _ in rows]
    vectors = [struct.unpack(f"<{DIMENSIONS}f", row[4]) for row in rows]
    candidate_edges = []
    for left in range(len(nodes)):
        neighbors = []
        for right in range(left + 1, len(nodes)):
            score = sum(a * b for a, b in zip(vectors[left], vectors[right]))
            if score >= 0.35:
                neighbors.append((score, right))
        for score, right in sorted(neighbors, reverse=True)[:3]:
            candidate_edges.append({"source": nodes[left]["id"], "target": nodes[right]["id"],
                                    "score": round(score, 3)})
    return {"nodes": nodes, "edges": sorted(candidate_edges, key=lambda item: item["score"], reverse=True)[:MAX_EDGES],
            "similarity": "character n-gram cosine; visual positions are deterministic layout coordinates"}


@router.get("/graph")
def get_graph():
    return graph_data()


@router.get("/nodes")
def get_nodes():
    return {"nodes": graph_data()["nodes"]}


@router.get("/edges")
def get_edges():
    return {"edges": graph_data()["edges"]}


@router.get("/node/{node_id}")
def get_node(node_id: str):
    node = next((item for item in graph_data()["nodes"] if item["id"] == node_id), None)
    if node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.get("/search")
def search_nodes(q: str = Query(min_length=1, max_length=500), limit: int = Query(default=10, ge=1, le=30)):
    return {"results": search(q, limit)}
