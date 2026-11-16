"""Read-only metadata view of all files on the KOA GitHub branch."""

from fastapi import APIRouter, HTTPException

from github_sync import list_repository_files

router = APIRouter(tags=["github"])


@router.get("/files")
def repository_files():
    try:
        return list_repository_files()
    except (OSError, ValueError, KeyError) as error:
        raise HTTPException(status_code=503, detail="GitHub repository listing is unavailable") from error
