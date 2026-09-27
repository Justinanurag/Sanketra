from fastapi import FastAPI
from app.api import analyze

app = FastAPI(
    title="AIService - Explainable SIF Precursor Intelligence",
    description="AI microservice for NLP fact extraction and SIF rule evaluation.",
    version="1.0.0"
)

app.include_router(analyze.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
