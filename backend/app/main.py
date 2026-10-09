from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.core.logging import logger
from app.api import research, compounds, diseases, clinical_trials, collections, health, simulator

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    await init_db()
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BioMindQ: Biomedical Intelligence. Grounded in Evidence.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under configured prefix
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(simulator.router, prefix=settings.API_PREFIX)
app.include_router(research.router, prefix=settings.API_PREFIX)
app.include_router(compounds.router, prefix=settings.API_PREFIX)
app.include_router(diseases.router, prefix=settings.API_PREFIX)
app.include_router(clinical_trials.router, prefix=settings.API_PREFIX)
app.include_router(collections.router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "api_url": f"{settings.API_PREFIX}/health"
    }
