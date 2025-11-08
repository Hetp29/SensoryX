# backend/app/routers/ai_doctor.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.services import ai_doctor_service

router = APIRouter()


class ConsultationStartRequest(BaseModel):
    user_id: str
    symptom_data: Dict
    patient_data: Optional[Dict] = None


class ConsultationContinueRequest(BaseModel):
    session_id: str
    message: str
    tier: Optional[str] = "free"  # "free" or "premium"


class ConsultationSummaryRequest(BaseModel):
    session_id: str


@router.post("/start")
async def start_consultation(request: ConsultationStartRequest):
    """
    Start a new AI doctor consultation session

    This endpoint initializes a conversational AI doctor consultation.
    - Free tier: General guidance and recommendations
    - Premium tier: Detailed analysis and personalized advice ($25-50)
    """
    try:
        result = await ai_doctor_service.start_ai_consultation(
            user_id=request.user_id,
            symptom_data=request.symptom_data,
            patient_data=request.patient_data
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/continue")
async def continue_consultation(request: ConsultationContinueRequest):
    """
    Continue an existing AI doctor consultation

    Send a message and receive AI doctor's response.
    Free tier has basic responses, premium tier has detailed analysis.
    """
    try:
        result = await ai_doctor_service.continue_consultation(
            session_id=request.session_id,
            user_message=request.message,
            tier=request.tier
        )

        if result.get("session_expired"):
            raise HTTPException(status_code=404, detail="Session not found or expired")

        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summary")
async def get_consultation_summary(request: ConsultationSummaryRequest):
    """
    Get a summary of the AI doctor consultation

    Returns:
    - Chief complaint
    - Key discussion points
    - Recommendations
    - Follow-up requirements
    """
    try:
        result = await ai_doctor_service.get_consultation_summary(
            session_id=request.session_id
        )

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pricing")
async def get_pricing_info():
    """
    Get AI doctor consultation pricing information
    """
    return {
        "success": True,
        "data": {
            "tiers": [
                {
                    "name": "Free",
                    "price": 0,
                    "currency": "USD",
                    "features": [
                        "Basic symptom analysis",
                        "General recommendations",
                        "24/7 availability",
                        "Instant responses",
                        "Unlimited questions"
                    ],
                    "limitations": [
                        "General guidance only",
                        "No detailed treatment plans"
                    ]
                },
                {
                    "name": "Premium",
                    "price": 35,
                    "currency": "USD",
                    "features": [
                        "Detailed symptom analysis",
                        "Personalized treatment suggestions",
                        "Follow-up recommendations",
                        "24/7 priority support",
                        "Detailed medical insights",
                        "Export consultation summary"
                    ],
                    "limitations": []
                }
            ],
            "comparison": {
                "ai_doctor_cost": "$0 - $35",
                "human_doctor_cost": "$150 - $300",
                "savings": "$115 - $265",
                "time_to_consultation": {
                    "ai": "Instant",
                    "human": "2-7 days"
                }
            }
        }
    }
