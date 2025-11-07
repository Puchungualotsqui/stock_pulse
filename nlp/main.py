from fastapi import FastAPI
from .routers import analyze

app = FastAPI(title="Financial News Analyzer", version="1.0")

app.include_router(analyze.router)

@app.get("/")
async def root():
    return {"message": "Financial News Analyzer API running!"}
