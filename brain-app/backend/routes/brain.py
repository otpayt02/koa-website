"""Read-only semantic similarity projection of locally embedded records."""

from __future__ import annotations

import hashlib
import math
import struct

from fastapi import APIRouter, HTTPException, Query

from knowledge import _connect, search

router = APIRouter(tags=["brain"])
MAX_NODES = 120
MAX_EDGES = 240


def _node_id(path: str) -> str:
    return hashlib.sha256(path.encode("utf-8")).hexdigest()[:20]


def _layout(vectors: list[tuple[float, ...]]) -> list[list[float]]:
    """Project document embeddings onto three deterministic principal axes."""
    if not vectors:
        return []
    dimensions = len(vectors[0])
    means = [sum(vector[i] for vector in vectors) / len(vectors) for i in range(dimensions)]
    centered = [[value - means[i] for i, value in enumerate(vector)] for vector in vectors]
    axes = []
    for axis_number in range(3):
        axis = [math.sin((i + 1) * (axis_number + 1) * 1.618) for i in range(dimensions)]
        for _ in range(32):
            projected = [sum(value * component for value, component in zip(row, axis)) for row in centered]
            candidate = [sum(row[i] * value for row, value in zip(centered, projected)) for i in range(dimensions)]
            for prior in axes:
                dot = sum(a * b for a, b in zip(candidate, prior))
                candidate = [a - dot * b for a, b in zip(candidate, prior)]
            magnitude = math.sqrt(sum(value * value for value in candidate))
            if magnitude < 1e-9:
                break
            axis = [value / magnitude for value in candidate]
        axes.append(axis)
    coords = [[sum(value * axis[i] for i, value in enumerate(row)) for axis in axes] for row in centered]
    scale = max((abs(value) for row in coords for value in row), default=1.0) or 1.0
    return [[round(value * 4 / scale, 3) for value in row] for row in coords]


def graph_data() -> dict:
    connection = _connect()
    try:
        rows = connection.execute("""
            SELECT d.path, d.source, d.title, c.content, c.vector
            FROM (SELECT * FROM documents ORDER BY path LIMIT ?) d
            JOIN chunks c ON c.path=d.path
            ORDER BY d.path, c.ordinal
        """, (MAX_NODES,)).fetchall()
    finally:
        connection.close()
    grouped = {}
    for path, source, title, content, blob in rows:
        dimensions = len(blob) // 4
        vector = struct.unpack(f"<{dimensions}f", blob)
        if path not in grouped:
            grouped[path] = {"source": source, "title": title, "excerpt": content[:240], "vectors": [], "id": _node_id(path)}
        grouped[path]["vectors"].append(vector)
    grouped = dict(list(grouped.items())[:MAX_NODES])
    vectors = [tuple(sum(vector[i] for vector in item["vectors"]) / len(item["vectors"]) for i in range(len(item["vectors"][0]))) for item in grouped.values()]
    positions = _layout(vectors)
    nodes = [{"id": item["id"], "source": item["source"], "title": item["title"], "excerpt": item["excerpt"], "position": positions[index]} for index, item in enumerate(grouped.values())]
    candidate_edges = []
    for left in range(len(nodes)):
        neighbors = []
        for right in range(left + 1, len(nodes)):
            score = sum(a * b for a, b in zip(vectors[left], vectors[right])) if len(vectors[left]) == len(vectors[right]) else 0
            if score >= 0.45:
                neighbors.append((score, right))
        for score, right in sorted(neighbors, reverse=True)[:3]:
            candidate_edges.append({"source": nodes[left]["id"], "target": nodes[right]["id"],
                                    "score": round(score, 3)})
    return {"nodes": nodes, "edges": sorted(candidate_edges, key=lambda item: item["score"], reverse=True)[:MAX_EDGES],
            "similarity": "local embedding cosine; links indicate topic similarity, not proven factual relationships"}


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
