"""Shared, explainable KOA relevance profile for connector records."""
from __future__ import annotations

import re
import json
import os
import unicodedata
import urllib.request
import math

# These concept groups capture common language around KOA, Karen language and
# Myanmar community work. A single generic nonprofit/brain term is not enough.
CONCEPTS = {
    "koa_identity": ("koa", "karen organization of america", "karen org of america"),
    "karen_community": ("karen", "kawthoolei", "refugee community", "karen community"),
    "language": ("s'gaw", "sgaw", "pwo", "karen language", "karenni", "language ai", "language technology", "translation", "translator"),
    "myanmar": ("myanmar", "burma", "burmese", "chin state", "southeast myanmar"),
    "nonprofit": ("nonprofit", "non-profit", "organization", "organizational", "501(c)(3)", "charity", "ngo", "community organization"),
    "programs": ("humanitarian", "advocacy", "resettlement", "community services", "education program", "donor", "grant", "volunteer", "fundraising"),
    "brain_technology": ("brain", "company brain", "second brain", "knowledge graph", "vector database", "semantic search", "knowledge index", "brain-app", "viber nexus"),
}

STRONG_TERMS = {"koa_identity", "karen_community", "language", "myanmar", "brain_technology"}
SEMANTIC_THRESHOLD = 0.57
PROFILE = ("Karen Organization of America (KOA), a Karen community nonprofit serving Karen people and families, "
           "S'gaw Karen language and translation, Myanmar and Burma, refugee support, community programs, "
           "advocacy, education, humanitarian services, grants, volunteers, nonprofit operations, and the "
           "KOA Company Brain, second brain, vector database, knowledge graph, semantic search, and connected files.")
_profile_cache: tuple[str, tuple[float, ...]] | None = None
_semantic_unavailable = False


def _normalize(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).casefold().replace("’", "'")
    return re.sub(r"\s+", " ", value)


def _contains(haystack: str, term: str) -> bool:
    normalized = _normalize(term)
    if normalized == "koa":
        return re.search(r"\bkoa\b", haystack) is not None
    return normalized in haystack


def _semantic_score(text: str) -> float | None:
    """Compare content to the KOA profile using the configured local embedder."""
    global _profile_cache, _semantic_unavailable
    if _semantic_unavailable or not text.strip():
        return None
    model = os.getenv("BRAIN_EMBEDDING_MODEL", "embeddinggemma:300m")
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    try:
        if _profile_cache is None or _profile_cache[0] != model:
            _profile_cache = (model, _get_embeddings(base, model, [PROFILE])[0])
        target = _get_embeddings(base, model, [text[:12000]])[0]
        if len(target) != len(_profile_cache[1]) or not target:
            return None
        return sum(left * right for left, right in zip(_profile_cache[1], target))
    except (OSError, ValueError, KeyError, IndexError, TypeError):
        # A local model may be starting or not installed; keyword discovery remains available.
        _semantic_unavailable = True
        return None


def _get_embeddings(base: str, model: str, texts: list[str]) -> list[tuple[float, ...]]:
    body = json.dumps({"model": model, "input": texts}).encode()
    request = urllib.request.Request(f"{base}/api/embed", data=body,
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.load(response)
    result = []
    for values in payload["embeddings"]:
        norm = math.sqrt(sum(float(value) ** 2 for value in values)) or 1.0
        result.append(tuple(float(value) / norm for value in values))
    return result


def assess_relevance(*, title: str = "", path: str = "", text: str = "") -> dict:
    """Explain KOA relevance from identity and related domain concepts.

    This is a discovery score, not a trust, truth, or publication decision.
    Full text embeddings remain the semantic ranking mechanism when enabled.
    """
    title_text, path_text, body = _normalize(title), _normalize(path), _normalize(text[:250_000])
    haystack = f"{title_text} {path_text} {body}"
    matched = {}
    for category, terms in CONCEPTS.items():
        hits = [term for term in terms if _contains(haystack, term)]
        if hits:
            matched[category] = hits[:8]
    semantic_score = _semantic_score(f"{title_text} {path_text} {body}") if len(body) >= 80 else None
    categories = set(matched)
    identity_hit = "koa_identity" in categories
    community_context = bool(categories & {"karen_community", "language", "myanmar"})
    organization_context = bool(categories & {"nonprofit", "programs"})
    brain_context = "brain_technology" in categories and bool(categories & {"koa_identity", "karen_community", "language", "myanmar"})
    related_by_concepts = identity_hit or brain_context or (community_context and organization_context) or len(categories & STRONG_TERMS) >= 2
    related = related_by_concepts or (semantic_score is not None and semantic_score >= SEMANTIC_THRESHOLD)
    reasons = []
    if identity_hit:
        reasons.append("KOA identity term")
    if community_context:
        reasons.append("Karen, language, or Myanmar context")
    if organization_context:
        reasons.append("nonprofit or program context")
    if brain_context:
        reasons.append("brain/knowledge technology connected to KOA context")
    if semantic_score is not None and semantic_score >= SEMANTIC_THRESHOLD:
        reasons.append("local embedding similarity to KOA domain profile")
    return {
        "related": related,
        "score": round(max(semantic_score or 0.0, min(1.0, 0.45 * int(identity_hit) + 0.22 * int(community_context) + 0.18 * int(organization_context) + 0.15 * int(brain_context))), 3),
        "semantic_score": round(semantic_score, 4) if semantic_score is not None else None,
        "method": "keywords_domain_concepts_and_local_embedding" if semantic_score is not None else "keywords_and_domain_concepts",
        "reasons": reasons,
        "matched_concepts": matched,
        "review_required": True,
    }
