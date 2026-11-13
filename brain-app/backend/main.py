from fastapi import FastAPI
from routes import github, inbox

app = FastAPI(title='KOA Company Brain API')
app.include_router(inbox.router, prefix='/api/inbox')
app.include_router(github.router, prefix='/github')

@app.get('/')
async def root():
    return {'message': 'KOA Company Brain API'}
