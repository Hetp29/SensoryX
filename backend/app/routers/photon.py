# backend/app/routers/photon.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from uuid import uuid4
from app.services import predictive_service, ai_doctor_service

router = APIRouter()

# Simple in-memory session store for demo
SESSIONS: Dict[str, Dict[str, Any]] = {}


@router.post("/start")
async def start_session(context: Dict[str, Any]):
    """Start a Photon hybrid session. Returns a session id."""
    session_id = str(uuid4())
    SESSIONS[session_id] = {"context": context, "messages": []}
    return {"session_id": session_id, "message": "Photon session started"}


@router.post("/message")
async def send_message(payload: Dict[str, Any]):
    """Send a message to the hybrid agent. Expects {session_id, text, user_profile}

    For demo, this will call predictive_service or ai_doctor_service heuristically.
    """
    session_id = payload.get("session_id")
    text = payload.get("text")
    user_profile = payload.get("user_profile")

    if not session_id or session_id not in SESSIONS:
        raise HTTPException(status_code=400, detail="Invalid session_id")

    # Heuristic: if text contains 'treatment' or 'outcome', call predictive_service
    if any(k in text.lower() for k in ["treatment", "outcome", "success", "cost"]):
        # Use a default mapping for demo
        prediction = await predictive_service.predict_treatment_outcome(
            condition=payload.get("condition", "migraine"),
            treatment=payload.get("treatment", "sumatriptan"),
            patient_profile=user_profile
        )
        resp = {"type": "prediction", "data": prediction}
    else:
        # Fallback to ai_doctor_service for general medical advice
        advice = await ai_doctor_service.get_medical_advice(text, user_profile)
        resp = {"type": "advice", "data": advice}

    # Append to session messages
    SESSIONS[session_id]["messages"].append({"from": "agent", "payload": resp})

    return {"success": True, "response": resp}


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    return SESSIONS[session_id]
