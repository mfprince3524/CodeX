from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.biomedical import ClinicalTrialDetail
from app.services.explorer_service import ExplorerService

router = APIRouter(prefix="/clinical-trials", tags=["Clinical Trials Explorer"])

@router.get("", response_model=List[ClinicalTrialDetail])
async def list_clinical_trials(
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    phase: Optional[str] = Query(None)
):
    return ExplorerService.get_clinical_trials(query=q, phase=phase, status=status)
