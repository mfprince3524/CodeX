from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from app.schemas.biomedical import CollectionResponse, CollectionCreate
from app.services.explorer_service import ExplorerService

router = APIRouter(prefix="/collections", tags=["Research Collections"])

@router.get("", response_model=List[CollectionResponse])
async def list_collections():
    return ExplorerService.get_collections()

@router.post("", response_model=CollectionResponse)
async def create_collection(payload: CollectionCreate):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Collection title is required.")
    return ExplorerService.create_collection(payload)

@router.post("/{collection_id}/items")
async def add_item_to_collection(collection_id: str, item: Dict[str, Any] = Body(...)):
    success = ExplorerService.add_to_collection(collection_id, item)
    if not success:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_id}' not found.")
    return {"status": "success", "message": "Evidence saved to collection."}
