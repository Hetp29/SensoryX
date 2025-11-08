from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SymptomRequest(BaseModel):
    description: str

@router.post("/match-symptoms")
async def match_symptoms(req: SymptomRequest):
    # Placeholder logic for now
    return {
        "status": "ok",
        "input": req.description,
        "matches": [],
        "note": "Vector search not implemented yet"
    }
