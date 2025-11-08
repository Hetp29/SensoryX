from fastapi import APIRouter
from pydantic import BaseModel
from app.services.vector_service import upsert_symptom_vector, query_similar_vectors
import uuid

router = APIRouter()

class SymptomRequest(BaseModel):
    description: str

@router.post("/match-symptoms")
async def match_symptoms(req: SymptomRequest):
    # TODO: Replace this with real embedding generation
    mock_vector = [0.0] * 1536  # placeholder embedding

    # Generate a unique id for this symptom
    symptom_id = str(uuid.uuid4())

    # Upsert to Pinecone
    upsert_symptom_vector(symptom_id, mock_vector, {"description": req.description})

    # Query similar vectors
    matches = query_similar_vectors(mock_vector, top_k=5)

    return {
        "status": "ok",
        "input": req.description,
        "matches": matches
    }