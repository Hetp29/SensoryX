# backend/app/routers/ai_doctor.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.services import ai_doctor_service, elevenlabs_service

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


# ============================================
# ELEVENLABS VOICE INTEGRATION
# ============================================

@router.post("/voice-question")
async def voice_question(
    session_id: str,
    tier: str = "free",
    audio: UploadFile = File(...)
):
    """
    Ask AI Doctor a question using voice input (ElevenLabs)

    Upload audio file, get transcribed and AI response.
    Supports: mp3, wav, m4a, aac, ogg, flac, webm

    Track: ElevenLabs (MLH) - Voice-enabled medical consultation
    """
    try:
        # Read audio file
        audio_data = await audio.read()

        # Transcribe using ElevenLabs
        transcription = await elevenlabs_service.transcribe_audio(
            audio_data=audio_data,
            filename=audio.filename
        )

        user_message = transcription["text"]

        # Get AI doctor response
        result = await ai_doctor_service.continue_consultation(
            session_id=session_id,
            user_message=user_message,
            tier=tier
        )

        if result.get("session_expired"):
            raise HTTPException(status_code=404, detail="Session not found or expired")

        return {
            "success": True,
            "data": {
                "transcription": {
                    "text": user_message,
                    "duration": transcription.get("duration"),
                    "language": transcription.get("language")
                },
                "ai_response": result["message"],
                "session_id": session_id,
                "timestamp": result["timestamp"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text-to-speech")
async def convert_response_to_speech(
    text: str,
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"  # Rachel (calm, professional)
):
    """
    Convert AI Doctor's text response to speech (ElevenLabs TTS)

    Returns audio file (MP3) of the AI doctor's response.
    Perfect for accessibility and natural conversation flow.

    Track: ElevenLabs (MLH) - Text-to-speech for medical consultation
    """
    try:
        # Convert text to speech using ElevenLabs
        audio_data = await elevenlabs_service.text_to_speech(
            text=text,
            voice_id=voice_id
        )

        # Return audio as MP3
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=ai_doctor_response.mp3"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_available_voices():
    """
    Get list of available ElevenLabs voices for AI Doctor

    Choose different voices for the AI doctor consultation.
    """
    try:
        voices = await elevenlabs_service.get_available_voices()
        return {
            "success": True,
            "data": voices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice-consultation-full")
async def full_voice_consultation(
    session_id: str,
    tier: str = "free",
    voice_id: str = "21m00Tcm4TlvDq8ikWAM",
    audio: UploadFile = File(...)
):
    """
    Complete voice-enabled consultation flow (ElevenLabs)

    1. Transcribe user's voice question
    2. Get AI doctor's text response
    3. Convert response to speech
    4. Return both text and audio

    Track: ElevenLabs (MLH) - Full voice-to-voice medical consultation
    """
    try:
        # Read audio file
        audio_data = await audio.read()

        # Transcribe using ElevenLabs
        transcription = await elevenlabs_service.transcribe_audio(
            audio_data=audio_data,
            filename=audio.filename
        )

        user_message = transcription["text"]

        # Get AI doctor response
        result = await ai_doctor_service.continue_consultation(
            session_id=session_id,
            user_message=user_message,
            tier=tier
        )

        if result.get("session_expired"):
            raise HTTPException(status_code=404, detail="Session not found or expired")

        ai_response_text = result["message"]

        # Convert AI response to speech
        audio_response = await elevenlabs_service.text_to_speech(
            text=ai_response_text,
            voice_id=voice_id
        )

        # For now, return JSON with base64 audio
        # Frontend can decode and play
        import base64
        audio_base64 = base64.b64encode(audio_response).decode('utf-8')

        return {
            "success": True,
            "data": {
                "user_question": {
                    "text": user_message,
                    "duration": transcription.get("duration"),
                    "language": transcription.get("language")
                },
                "ai_response": {
                    "text": ai_response_text,
                    "audio_base64": audio_base64,
                    "voice_id": voice_id
                },
                "session_id": session_id,
                "timestamp": result["timestamp"],
                "elevenlabs_track": "Voice-to-voice medical consultation"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
