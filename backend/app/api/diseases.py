from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.biomedical import DiseaseDetail
from app.services.explorer_service import ExplorerService

router = APIRouter(prefix="/diseases", tags=["Disease Explorer"])

@router.get("", response_model=List[DiseaseDetail])
async def list_diseases(q: Optional[str] = Query(None)):
    return ExplorerService.get_diseases(q)

@router.get("/{identifier}", response_model=DiseaseDetail)
async def get_disease_detail(identifier: str):
    disease = ExplorerService.get_disease_by_id(identifier)
    if not disease:
        raise HTTPException(status_code=404, detail=f"Disease '{identifier}' not found.")
    return disease
