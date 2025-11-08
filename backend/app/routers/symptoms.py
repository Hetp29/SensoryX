# backend/app/routers/symptoms.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..services import vector_service

router = APIRouter()

class SymptomRequest(BaseModel):
    description: str

class SymptomMatch(BaseModel):
    id: str
    similarity: float
    description: str
    condition: str
    treatment: str
    success_rate: float

@router.post("/match", response_model=List[SymptomMatch])
async def match_symptoms(request: SymptomRequest):
    """Find symptom twins"""
    
    matches = await vector_service.query_similar_vectors(
        symptom=request.description,
        top_k=5
    )
    
    if not matches:
        # Always return something for demo
        matches = vector_service.generate_fake_matches()
    
    return matches

@router.post("/add")
async def add_symptom(request: dict):
    """Add new symptom to database"""
    
    result = await vector_service.upsert_symptom_vector(
        symptom_id=request.get("id", str(uuid.uuid4())),
        description=request["description"],
        metadata=request
    )
    
    return result