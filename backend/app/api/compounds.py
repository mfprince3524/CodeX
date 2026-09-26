from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.biomedical import CompoundDetail
from app.services.explorer_service import ExplorerService

router = APIRouter(prefix="/compounds", tags=["Compound Explorer"])

@router.get("", response_model=List[CompoundDetail])
async def list_compounds(q: Optional[str] = Query(None)):
    return ExplorerService.get_compounds(q)

@router.get("/{identifier}", response_model=CompoundDetail)
async def get_compound_detail(identifier: str):
    compound = ExplorerService.get_compound_by_id(identifier)
    if not compound:
        raise HTTPException(status_code=404, detail=f"Compound '{identifier}' not found in registry.")
    return compound
