from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, Optional
from app.schemas.biomedical import (
    ResearchQueryRequest,
    ResearchQueryResult,
    ClarificationResponse,
    LiteratureSearchRequest,
    LiteratureSearchResponse,
    ConflictRadarAnalysis,
    ResearchGapAnalysis
)
from app.services.research_service import research_service

router = APIRouter(prefix="/research", tags=["Research Engine"])

@router.post("/clarify", response_model=ClarificationResponse)
async def clarify_query(payload: Optional[Dict[str, Any]] = None, q: Optional[str] = Query(None)):
    query_text = (payload and payload.get("query")) or q or ""
    if not query_text.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")
    return await research_service.check_clarification(query_text)

@router.post("/query", response_model=ResearchQueryResult)
async def run_research_query(request: ResearchQueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query string is required.")
    return await research_service.execute_research(request)

@router.post("/literature", response_model=LiteratureSearchResponse)
async def search_literature_endpoint(request: LiteratureSearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query string is required.")
    return await research_service.search_literature(request)

@router.post("/conflicts", response_model=ConflictRadarAnalysis)
async def analyze_conflicts_endpoint(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query string is required for conflict analysis.")
    return await research_service.analyze_conflicts(query)

@router.post("/gaps", response_model=ResearchGapAnalysis)
async def identify_gaps_endpoint(payload: Dict[str, Any] = Body(...)):
    topic = payload.get("topic", payload.get("query", "")).strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic or query string is required for gap analysis.")
    return await research_service.identify_gaps(topic)

@router.post("/graph")
async def explore_graph_endpoint(payload: Dict[str, Any] = Body(...)):
    entity = payload.get("entity", payload.get("query", "")).strip()
    if not entity:
        raise HTTPException(status_code=400, detail="Entity name is required.")
    return await research_service.explore_graph(entity)

@router.get("/settings")
async def get_settings_endpoint():
    return research_service.get_settings_status()

@router.post("/settings")
async def update_settings_endpoint(payload: Dict[str, Any] = Body(...)):
    return research_service.update_settings(payload)
