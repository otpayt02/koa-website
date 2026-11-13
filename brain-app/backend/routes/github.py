"""Validate GitHub webhook deliveries before writing inbox records."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re

from fastapi import APIRouter, HTTPException, Request

from connectors.inbox_writer import write_record


router = APIRouter(tags=["github"])
MAX_BODY = 1_000_000


@router.post("/webhook")
async def receive_webhook(request: Request) -> dict[str, str]:
    secret = os.getenv("GITHUB_WEBHOOK_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(status_code=503, detail="GitHub webhook is not configured")
    chunks = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_BODY:
            raise HTTPException(status_code=413, detail="Payload too large")
        chunks.append(chunk)
    raw = b"".join(chunks)
    supplied = request.headers.get("x-hub-signature-256", "")
    expected = "sha256=" + hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    delivery = request.headers.get("x-github-delivery", "")
    event = request.headers.get("x-github-event", "")
    if not re.fullmatch(r"[A-Za-z0-9-]{1,100}", delivery):
        raise HTTPException(status_code=400, detail="Invalid delivery ID")
    if event not in {"issues", "pull_request", "push", "ping"}:
        return {"status": "ignored"}
    try:
        payload = json.loads(raw)
    except (ValueError, UnicodeDecodeError) as error:
        raise HTTPException(status_code=400, detail="Invalid JSON") from error
    if not isinstance(payload, dict) or not isinstance(payload.get("repository"), dict) or payload["repository"].get("full_name") != "otpayt02/koa-website":
        raise HTTPException(status_code=400, detail="Unexpected repository")
    if event == "ping":
        return {"status": "ping"}
    item = payload.get("issue") if event == "issues" else payload.get("pull_request") if event == "pull_request" else None
    if event in {"issues", "pull_request"} and not isinstance(item, dict):
        raise HTTPException(status_code=400, detail="Missing event item")
    action = payload.get("action", "push")
    if event in {"issues", "pull_request"} and action not in {"opened", "edited", "closed", "reopened", "synchronize"}:
        return {"status": "ignored"}
    head_commit = payload.get("head_commit")
    if not isinstance(head_commit, dict):
        head_commit = {}
    record = {
        "source": "github", "repository": "otpayt02/koa-website", "event": event,
        "action": action, "delivery_id": delivery,
        "url": (item or {}).get("html_url") or payload.get("compare"),
        "title": (item or {}).get("title"),
        "source_id": (item or {}).get("id") or payload.get("after"),
        "created_at": (item or {}).get("created_at") or head_commit.get("timestamp"),
    }
    try:
        written = write_record("github", delivery, record)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Inbox write failed") from error
    return {"status": "created" if written else "duplicate"}
