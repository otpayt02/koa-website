"""Authenticated local vector index endpoints."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from knowledge import ask, search, sync_processed

router = APIRouter(tags=["knowledge"])


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


@router.get("/search")
def search_knowledge(q: str = Query(min_length=1, max_length=500), limit: int = Query(default=10, ge=1, le=30)):
    try:
        return {"results": search(q, limit)}
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Knowledge index is unavailable") from error


@router.post("/ask")
def ask_knowledge(request: AskRequest):
    try:
        return ask(request.question)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Knowledge answer service is unavailable") from error


@router.post("/index")
def index_processed():
    try:
        return sync_processed()
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Knowledge indexing failed") from error
