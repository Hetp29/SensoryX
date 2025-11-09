# backend/app/routers/symptoms.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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

# Simple in-memory cache for analyses (in production, use Redis or database)
ANALYSIS_CACHE: Dict[str, Dict[str, Any]] = {}

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


@router.post("/analyze")
async def analyze_symptoms_endpoint(
    user_id: str = Form(...),
    symptoms: str = Form(...),
    patient_data: str = Form(...),
    image_0: Optional[UploadFile] = File(None),
    image_1: Optional[UploadFile] = File(None),
    image_2: Optional[UploadFile] = File(None),
    image_3: Optional[UploadFile] = File(None),
    image_4: Optional[UploadFile] = File(None)
):
    """
    Frontend-friendly symptom analysis endpoint
    Accepts FormData with user_id, symptoms, patient_data (JSON string), and optional images
    """
    try:
        import json

        # Parse patient data JSON
        patient_dict = json.loads(patient_data) if patient_data else {}

        # Collect all uploaded images
        images = [img for img in [image_0, image_1, image_2, image_3, image_4] if img is not None]

        # Process images if provided
        image_analyses = []
        if images:
            for image in images:
                contents = await image.read()
                base64_image = base64.b64encode(contents).decode('utf-8')
                image_analysis = await ai_service.analyze_medical_image(
                    base64_image=base64_image,
                    image_type=image.content_type
                )
                image_analyses.append(image_analysis)

        # Query similar symptoms
        matches = await vector_service.query_similar_vectors(
            symptom=symptoms,
            top_k=5
        )

        if not matches:
            matches = vector_service.generate_fake_matches()

        # Get best match as twin
        best_match = matches[0] if matches else {}

        # AI analysis
        # Note: Include image analysis context in the symptom description if available
        enhanced_symptoms = symptoms
        if image_analyses:
            image_context = "\n\nImage Analysis Findings:\n" + "\n".join([str(analysis) for analysis in image_analyses])
            enhanced_symptoms = symptoms + image_context

        ai_analysis = await ai_service.analyze_symptoms(
            symptom_description=enhanced_symptoms,
            patient_data=patient_dict
        )

        # Generate analysis ID
        analysis_id = str(uuid.uuid4())

        # Format twin data
        twin = {
            "id": best_match.get("id", "twin-1"),
            "similarity": int(best_match.get("similarity", 0.95) * 100),
            "age": patient_dict.get("age", 32) if isinstance(patient_dict.get("age"), int) else 32,
            "gender": patient_dict.get("gender", "Unknown"),
            "location": patient_dict.get("location", "Unknown"),
            "symptom_description": best_match.get("description", symptoms),
            "diagnosis": best_match.get("condition", ai_analysis.get("primary_condition", "Under evaluation")),
            "timeline": best_match.get("timeline", "Consult with healthcare provider for timeline"),
            "treatment": best_match.get("treatment", "Individualized treatment plan recommended"),
            "outcome": best_match.get("outcome", "Positive outcomes expected with proper treatment")
        }

        # Format conditions
        conditions = ai_analysis.get("conditions", [])
        formatted_conditions = []
        for cond in conditions[:3]:
            formatted_conditions.append({
                "name": cond.get("name", ""),
                "probability": int(cond.get("probability", 0) * 100) if cond.get("probability", 0) <= 1 else cond.get("probability", 0),
                "description": cond.get("reasoning", cond.get("description", ""))
            })

        # Format recommendations
        recommendations = ai_analysis.get("recommendations", [])
        formatted_recommendations = []
        for rec in recommendations[:4]:
            formatted_recommendations.append({
                "type": rec.get("priority", rec.get("type", "general")),
                "title": rec.get("action", rec.get("title", "")),
                "description": rec.get("reasoning", rec.get("description", "")),
                "icon": rec.get("icon", rec.get("type", "general"))
            })

        result = {
            "success": True,
            "analysis_id": analysis_id,
            "twin": twin,
            "conditions": formatted_conditions,
            "recommendations": formatted_recommendations
        }

        # Cache the analysis for retrieval
        ANALYSIS_CACHE[analysis_id] = result

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Symptom analysis failed: {str(e)}")


@router.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str):
    """
    Get cached analysis by ID
    Checks in-memory cache first, falls back to mock data if not found
    """
    # Check cache first
    if analysis_id in ANALYSIS_CACHE:
        return ANALYSIS_CACHE[analysis_id]

    # Fallback to mock data if analysis not found in cache
    # This can happen if server restarts or for old analysis IDs
    return {
        "success": True,
        "analysis_id": analysis_id,
        "twin": {
            "id": "twin-1",
            "similarity": 95,
            "age": 32,
            "gender": "Female",
            "location": "Boston, MA",
            "symptom_description": "Sharp, stabbing pain behind my left eye that gets worse when I swallow. Started 3 days ago and comes in waves throughout the day.",
            "diagnosis": "Trigeminal Neuralgia",
            "timeline": "Diagnosed after 2 weeks",
            "treatment": "Carbamazepine 200mg twice daily + Physical therapy",
            "outcome": "90% reduction in symptoms after 6 weeks of treatment"
        },
        "conditions": [
            {
                "name": "Trigeminal Neuralgia",
                "probability": 87,
                "description": "A chronic pain condition affecting the trigeminal nerve, causing sudden, severe facial pain."
            },
            {
                "name": "Cluster Headache",
                "probability": 72,
                "description": "Severe headaches that occur in cyclical patterns, often around one eye."
            },
            {
                "name": "Temporal Arteritis",
                "probability": 45,
                "description": "Inflammation of blood vessels in the head causing headaches and jaw pain."
            }
        ],
        "recommendations": [
            {
                "type": "immediate",
                "title": "Seek Medical Attention",
                "description": "Based on your symptom match, consult a neurologist within 48 hours for proper diagnosis.",
                "icon": "immediate"
            },
            {
                "type": "consult",
                "title": "Specialist Consultation",
                "description": "Request referral to a facial pain specialist or neurology department.",
                "icon": "consult"
            },
            {
                "type": "monitor",
                "title": "Track Symptoms",
                "description": "Keep a daily log of pain episodes, triggers, and intensity on a scale of 1-10.",
                "icon": "monitor"
            },
            {
                "type": "lifestyle",
                "title": "Avoid Known Triggers",
                "description": "Based on your twin's experience: avoid cold air exposure, chewing hard foods, and touching the affected area.",
                "icon": "lifestyle"
            }
        ]
    }