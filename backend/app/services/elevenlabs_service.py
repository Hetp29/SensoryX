# backend/app/services/elevenlabs_service.py
import os
import httpx
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
MOCK_ENABLED = not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == ""


async def transcribe_audio(
    audio_data: bytes,
    filename: str,
    language_code: Optional[str] = None
) -> Dict:
    if MOCK_ENABLED:
        return {
            "text": "I have been experiencing severe headaches on the left side of my head, along with nausea and sensitivity to light. The pain is throbbing and lasts for several hours.",
            "duration": 15.2,
            "language": language_code or "en",
            "model": "scribe_v1_mock"
        }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {
                "file": (filename, audio_data, get_content_type(filename))
            }
            headers = {
                "xi-api-key": ELEVENLABS_API_KEY
            }
            data = {
                "model_id": "scribe_v1"
            }
            if language_code:
                data["language_code"] = language_code

            response = await client.post(
                f"{ELEVENLABS_BASE_URL}/speech-to-text",
                headers=headers,
                files=files,
                data=data
            )
            response.raise_for_status()

            result = response.json()
            return {
                "text": result.get("text", ""),
                "duration": result.get("duration"),
                "language": result.get("language_code", language_code or "en"),
                "model": "scribe_v1"
            }

    except httpx.HTTPError as e:
        raise Exception(f"ElevenLabs API error: {str(e)}")


async def text_to_speech(
    text: str,
    voice_id: str = "21m00Tcm4TlvDq8ikWAM",  # Rachel - Professional, calm voice
    model_id: str = "eleven_monolingual_v1",
    stability: float = 0.5,
    similarity_boost: float = 0.75
) -> bytes:
    """
    Convert text to speech using ElevenLabs TTS

    Args:
        text: Text to convert to speech
        voice_id: ElevenLabs voice ID (default: Rachel)
        model_id: TTS model to use
        stability: Voice stability (0-1)
        similarity_boost: Voice similarity (0-1)

    Returns:
        Audio bytes (MP3 format)
    """
    if MOCK_ENABLED:
        # Return mock audio data (empty bytes for now)
        return b"MOCK_AUDIO_DATA"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            }

            payload = {
                "text": text,
                "model_id": model_id,
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity_boost
                }
            }

            response = await client.post(
                f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            return response.content

    except httpx.HTTPError as e:
        raise Exception(f"ElevenLabs TTS error: {str(e)}")


async def get_available_voices() -> Dict:
    """
    Get list of available ElevenLabs voices
    """
    if MOCK_ENABLED:
        return {
            "voices": [
                {
                    "voice_id": "21m00Tcm4TlvDq8ikWAM",
                    "name": "Rachel",
                    "category": "premade",
                    "description": "Calm, professional female voice - perfect for medical consultations"
                },
                {
                    "voice_id": "AZnzlk1XvdvUeBnXmlld",
                    "name": "Domi",
                    "category": "premade",
                    "description": "Strong, confident female voice"
                },
                {
                    "voice_id": "EXAVITQu4vr4xnSDxMaL",
                    "name": "Bella",
                    "category": "premade",
                    "description": "Soft, soothing female voice"
                }
            ]
        }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {"xi-api-key": ELEVENLABS_API_KEY}

            response = await client.get(
                f"{ELEVENLABS_BASE_URL}/voices",
                headers=headers
            )
            response.raise_for_status()

            return response.json()

    except httpx.HTTPError as e:
        raise Exception(f"ElevenLabs API error: {str(e)}")


def get_content_type(filename: str) -> str:
    extension = filename.lower().split('.')[-1]
    content_types = {
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "m4a": "audio/mp4",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "flac": "audio/flac",
        "webm": "audio/webm"
    }
    return content_types.get(extension, "audio/mpeg")
