from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from app.schemas.biomedical import (
    ResearchQueryRequest,
    ResearchQueryResult,
    ClarificationResponse
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
