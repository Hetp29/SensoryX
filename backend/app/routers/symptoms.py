# backend/app/routers/symptoms.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ..services import vector_service
from ..services import ai_service
import uuid
import base64

router = APIRouter()

class SymptomRequest(BaseModel):
    description: str
    # Optional patient data for better AI analysis
    patientData: Optional[Dict[str, Any]] = None

class SymptomMatch(BaseModel):
    id: str
    similarity: float
    description: str
    condition: str
    treatment: str
    success_rate: float

class ConditionPrediction(BaseModel):
    name: str
    probability: float
    reasoning: str
    severity: str

class Recommendation(BaseModel):
    type: str
    action: str
    priority: str
    icon: Optional[str] = None

class EnhancedMatchResponse(BaseModel):
    # Symptom twins from vector search
    matches: List[SymptomMatch]
    # AI analysis
    ai_analysis: Dict[str, Any]
    # Top predicted conditions
    conditions: List[ConditionPrediction]
    # Personalized recommendations
    recommendations: List[Recommendation]
    # Urgency assessment
    urgency_level: str
    urgency_reasoning: str

@router.post("/match", response_model=EnhancedMatchResponse)
async def match_symptoms(request: SymptomRequest):
    """
    Find symptom twins and provide AI-powered analysis
    Returns matches, condition predictions, and recommendations
    """

    # Step 1: Find similar symptoms using vector search
    matches = await vector_service.query_similar_vectors(
        symptom=request.description,
        top_k=5
    )

    if not matches:
        # Fallback to demo data
        matches = vector_service.generate_fake_matches()

    # Step 2: Get AI analysis of symptoms
    ai_analysis = await ai_service.analyze_symptoms(
        symptom_description=request.description,
        patient_data=request.patientData
    )

    # Step 3: Build response
    return {
        "matches": matches,
        "ai_analysis": ai_analysis,
        "conditions": ai_analysis.get("conditions", []),
        "recommendations": ai_analysis.get("recommendations", []),
        "urgency_level": ai_analysis.get("urgency_level", "medium"),
        "urgency_reasoning": ai_analysis.get("urgency_reasoning", "Consult a healthcare provider")
    }

@router.post("/add")
async def add_symptom(request: dict):
    """Add new symptom to database"""

    result = await vector_service.upsert_symptom_vector(
        symptom_id=request.get("id", str(uuid.uuid4())),
        description=request["description"],
        metadata=request
    )

    return result


@router.post("/upload-image")
async def upload_symptom_image(file: UploadFile = File(...)):
    """
    Upload and analyze medical images (rashes, wounds, etc.)
    Uses GPT-4 Vision to extract relevant medical information
    """
    try:
        # Read image file
        contents = await file.read()

        # Convert to base64 for GPT-4 Vision
        base64_image = base64.b64encode(contents).decode('utf-8')

        # Analyze image with GPT-4 Vision
        analysis = await ai_service.analyze_medical_image(
            base64_image=base64_image,
            image_type=file.content_type
        )

        return {
            "status": "success",
            "filename": file.filename,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")