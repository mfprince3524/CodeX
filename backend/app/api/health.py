from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "adapters": {
            "pubmed": "active",
            "chembl": "active",
            "clinical_trials": "active",
            "drugbank": "ready (key-configured or reference mode)"
        }
    }
