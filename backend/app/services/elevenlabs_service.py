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
                "audio": (filename, audio_data, get_content_type(filename))
            }
            headers = {
                "xi-api-key": ELEVENLABS_API_KEY
            }
            data = {}
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
