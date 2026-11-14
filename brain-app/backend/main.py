import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI
from routes import brain, github, inbox, knowledge, sync
from security import require_operator


def initialize_data_dirs() -> Path:
    configured = os.environ.get('BRAIN_DATA_PATH')
    if not configured:
        raise RuntimeError('BRAIN_DATA_PATH must be configured')
    root = Path(configured).expanduser().resolve(strict=True)
    if not root.is_dir():
        raise RuntimeError('BRAIN_DATA_PATH must be a directory')
    for relative in ('inbox', 'inbox/new', 'inbox/processed'):
        folder = root / relative
        if folder.is_symlink():
            raise RuntimeError(f'{relative} must not be a symbolic link')
        folder.mkdir(exist_ok=True)
        if not folder.resolve().is_relative_to(root):
            raise RuntimeError(f'{relative} must stay inside BRAIN_DATA_PATH')
    return root


@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize_data_dirs()
    yield


app = FastAPI(title='KOA Company Brain API', lifespan=lifespan)
app.include_router(inbox.router, prefix='/api/inbox', dependencies=[Depends(require_operator)])
app.include_router(knowledge.router, prefix='/api/knowledge', dependencies=[Depends(require_operator)])
app.include_router(brain.router, prefix='/api/brain', dependencies=[Depends(require_operator)])
app.include_router(sync.router, prefix='/api/sync', dependencies=[Depends(require_operator)])
app.include_router(github.router, prefix='/github')

@app.get('/')
async def root():
    return {'message': 'KOA Company Brain API'}


@app.get('/health')
async def health():
    return {'status': 'ok'}
