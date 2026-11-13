"""Require a local operator token for private Brain API routes."""

import hmac
import os

from fastapi import Header, HTTPException


def require_operator(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("BRAIN_ADMIN_TOKEN", "")
    if len(expected) < 32:
        raise HTTPException(status_code=503, detail="Brain operator token is not configured")
    supplied = authorization.removeprefix("Bearer ") if authorization else ""
    if not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Operator token required")
