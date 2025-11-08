# backend/app/routers/symptoms.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ..services import vector_service
from ..db import snowflake_client
from ..services import ai_service
from ..services import knot_service
from ..services import elevenlabs_service
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
    matches: List[SymptomMatch]
    ai_analysis: Dict[str, Any]
    conditions: List[ConditionPrediction]
    recommendations: List[Recommendation]
    urgency_level: str
    urgency_reasoning: str
    treatment_costs: Optional[List[Dict[str, Any]]] = None
    financial_summary: Optional[Dict[str, Any]] = None

@router.post("/match", response_model=EnhancedMatchResponse)
async def match_symptoms(request: SymptomRequest):
    matches = await vector_service.query_similar_vectors(
        symptom=request.description,
        top_k=5
    )

    if not matches:
        matches = vector_service.generate_fake_matches()

    ai_analysis = await ai_service.analyze_symptoms(
        symptom_description=request.description,
        patient_data=request.patientData
    )

    treatment_costs = []
    for match in matches[:3]:
        cost_estimate = await knot_service.estimate_treatment_cost(
            condition=match.get("condition", "Unknown"),
            treatment=match.get("treatment", "Standard care")
        )
        treatment_costs.append(cost_estimate)

    avg_treatment_cost = sum(c["average"] for c in treatment_costs) / len(treatment_costs) if treatment_costs else 0
    financial_summary = {
        "estimated_cost_range": {
            "min": min((c["min"] for c in treatment_costs), default=0),
            "max": max((c["max"] for c in treatment_costs), default=0),
            "average": round(avg_treatment_cost, 2)
        },
        "insurance_coverage_avg": round(sum(c["insurance_covered"] for c in treatment_costs) / len(treatment_costs), 1) if treatment_costs else 70
    }

    return {
        "matches": matches,
        "ai_analysis": ai_analysis,
        "conditions": ai_analysis.get("conditions", []),
        "recommendations": ai_analysis.get("recommendations", []),
        "urgency_level": ai_analysis.get("urgency_level", "medium"),
        "urgency_reasoning": ai_analysis.get("urgency_reasoning", "Consult a healthcare provider"),
        "treatment_costs": treatment_costs,
        "financial_summary": financial_summary
    }

@router.post("/add")
async def add_symptom(request: dict):
    """Add new symptom to database"""

    result = await vector_service.upsert_symptom_vector(
        symptom_id=request.get("id", str(uuid.uuid4())),
        description=request["description"],
        metadata=request
    )

    # Persist to Snowflake (best-effort). Don't fail the request if warehouse is unavailable.
    try:
        snow_result = await snowflake_client.insert_symptom_record({
            "id": request.get("id", result.get("id")),
            "description": request.get("description"),
            "metadata": request
        })
    except Exception as e:
        snow_result = {"status": "error", "error": str(e)}

    return {"vector_upsert": result, "warehouse": snow_result}


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


@router.post("/upload-voice")
async def upload_voice_symptom(file: UploadFile = File(...), language: Optional[str] = None):
    """
    Transcribe voice recording of symptoms using ElevenLabs
    Supports: mp3, wav, m4a, aac, ogg, flac, webm (up to 3GB)
    """
    try:
        contents = await file.read()

        transcription = await elevenlabs_service.transcribe_audio(
            audio_data=contents,
            filename=file.filename,
            language_code=language
        )

        return {
            "status": "success",
            "filename": file.filename,
            "transcription": transcription
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice transcription failed: {str(e)}")


@router.post("/voice-match", response_model=EnhancedMatchResponse)
async def voice_symptom_match(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    patient_data: Optional[str] = None
):
    """
    Complete voice-to-diagnosis pipeline:
    1. Transcribe voice to text
    2. Match symptoms with vector search
    3. AI analysis with Gemini
    4. Financial cost estimates
    """
    try:
        contents = await file.read()

        transcription = await elevenlabs_service.transcribe_audio(
            audio_data=contents,
            filename=file.filename,
            language_code=language
        )

        symptom_text = transcription["text"]

        import json
        patient_dict = json.loads(patient_data) if patient_data else None

        matches = await vector_service.query_similar_vectors(
            symptom=symptom_text,
            top_k=5
        )

        if not matches:
            matches = vector_service.generate_fake_matches()

        ai_analysis = await ai_service.analyze_symptoms(
            symptom_description=symptom_text,
            patient_data=patient_dict
        )

        treatment_costs = []
        for match in matches[:3]:
            cost_estimate = await knot_service.estimate_treatment_cost(
                condition=match.get("condition", "Unknown"),
                treatment=match.get("treatment", "Standard care")
            )
            treatment_costs.append(cost_estimate)

        avg_treatment_cost = sum(c["average"] for c in treatment_costs) / len(treatment_costs) if treatment_costs else 0
        financial_summary = {
            "estimated_cost_range": {
                "min": min((c["min"] for c in treatment_costs), default=0),
                "max": max((c["max"] for c in treatment_costs), default=0),
                "average": round(avg_treatment_cost, 2)
            },
            "insurance_coverage_avg": round(sum(c["insurance_covered"] for c in treatment_costs) / len(treatment_costs), 1) if treatment_costs else 70,
            "transcription": transcription
        }

        return {
            "matches": matches,
            "ai_analysis": ai_analysis,
            "conditions": ai_analysis.get("conditions", []),
            "recommendations": ai_analysis.get("recommendations", []),
            "urgency_level": ai_analysis.get("urgency_level", "medium"),
            "urgency_reasoning": ai_analysis.get("urgency_reasoning", "Consult a healthcare provider"),
            "treatment_costs": treatment_costs,
            "financial_summary": financial_summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice symptom matching failed: {str(e)}")