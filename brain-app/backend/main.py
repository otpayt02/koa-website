from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import search, graph, prompts, inbox

app = FastAPI(title='KOA Company Brain API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(search.router, prefix='/api/search')
app.include_router(graph.router, prefix='/api/graph')
app.include_router(prompts.router, prefix='/api/prompts')
app.include_router(inbox.router, prefix='/api/inbox')

@app.get('/')
async def root():
    return {'message': 'KOA Company Brain API'}