# backend/app/services/ai_doctor_service.py
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import json
from datetime import datetime

load_dotenv()

# Initialize Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_model = None

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')


# In-memory conversation store (replace with Redis/DB in production)
conversation_store: Dict[str, List[Dict]] = {}


async def start_ai_consultation(
    user_id: str,
    symptom_data: Dict,
    patient_data: Optional[Dict] = None
) -> Dict:
    """
    Start a new AI doctor consultation session
    """
    # Build patient context
    patient_context = _build_patient_context(patient_data, symptom_data)

    # Generate initial greeting and questions
    initial_message = await _generate_initial_consultation(patient_context, symptom_data)

    # Initialize conversation
    session_id = f"{user_id}_{datetime.utcnow().timestamp()}"
    conversation_store[session_id] = [
        {
            "role": "system",
            "content": f"You are Dr. AI, a compassionate and knowledgeable virtual medical consultant. {patient_context}"
        },
        {
            "role": "assistant",
            "content": initial_message,
            "timestamp": datetime.utcnow().isoformat()
        }
    ]

    return {
        "session_id": session_id,
        "message": initial_message,
        "timestamp": datetime.utcnow().isoformat(),
        "consultation_type": "ai_doctor",
        "cost": 0  # Free tier
    }


async def continue_consultation(
    session_id: str,
    user_message: str,
    tier: str = "free"
) -> Dict:
    """
    Continue an existing AI doctor consultation
    tier: "free" or "premium"
    """
    if session_id not in conversation_store:
        return {
            "error": "Session not found. Please start a new consultation.",
            "session_expired": True
        }

    # Add user message to conversation
    conversation_store[session_id].append({
        "role": "user",
        "content": user_message,
        "timestamp": datetime.utcnow().isoformat()
    })

    # Generate AI response
    ai_response = await _generate_ai_doctor_response(
        conversation_store[session_id],
        tier=tier
    )

    # Add AI response to conversation
    conversation_store[session_id].append({
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "session_id": session_id,
        "message": ai_response,
        "timestamp": datetime.utcnow().isoformat(),
        "tier": tier,
        "message_count": len([m for m in conversation_store[session_id] if m["role"] == "user"])
    }


async def get_consultation_summary(session_id: str) -> Dict:
    """
    Generate a summary of the consultation
    """
    if session_id not in conversation_store:
        return {"error": "Session not found"}

    conversation = conversation_store[session_id]

    # Extract all messages (skip system message)
    messages = [msg for msg in conversation if msg["role"] != "system"]

    # Generate summary using Gemini
    summary = await _generate_consultation_summary(conversation)

    return {
        "session_id": session_id,
        "summary": summary,
        "total_messages": len(messages),
        "duration": _calculate_duration(conversation),
        "recommendations": summary.get("key_recommendations", []),
        "follow_up_needed": summary.get("follow_up_needed", False)
    }


async def _generate_initial_consultation(patient_context: str, symptom_data: Dict) -> str:
    """
    Generate initial AI doctor greeting and questions
    """
    symptoms = symptom_data.get("symptoms", "Not provided")

    prompt = f"""You are Dr. AI, a compassionate virtual medical consultant. You are starting a consultation.

{patient_context}

Patient's main complaint:
{symptoms}

Generate a warm, professional initial greeting that:
1. Introduces yourself briefly
2. Acknowledges their symptoms
3. Asks 2-3 targeted follow-up questions to gather more information
4. Shows empathy and professionalism

Keep it conversational and friendly, like a real doctor consultation. Don't be overly formal.
Return ONLY the greeting message, no JSON or extra formatting."""

    if not gemini_model:
        return _fallback_initial_message(symptoms)

    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error in initial consultation: {e}")
        return _fallback_initial_message(symptoms)


async def _generate_ai_doctor_response(conversation: List[Dict], tier: str = "free") -> str:
    """
    Generate AI doctor response based on conversation history
    """
    if not gemini_model:
        return "I apologize, but I'm experiencing technical difficulties. Please try again later or consult with a human doctor."

    # Build conversation context for Gemini
    # Skip system message, format for natural conversation
    conversation_text = ""
    for msg in conversation:
        if msg["role"] == "system":
            continue
        elif msg["role"] == "user":
            conversation_text += f"Patient: {msg['content']}\n\n"
        elif msg["role"] == "assistant":
            conversation_text += f"Dr. AI: {msg['content']}\n\n"

    prompt = f"""You are Dr. AI, a compassionate and knowledgeable virtual medical consultant. Continue this consultation naturally.

Previous conversation:
{conversation_text}

Guidelines:
1. Be empathetic and professional
2. Ask clarifying questions when needed
3. Provide medical insights responsibly
4. Recommend seeing a human doctor for serious conditions
5. {"Provide detailed analysis (premium tier)" if tier == "premium" else "Provide helpful but general guidance (free tier)"}
6. Keep responses concise (2-4 paragraphs)
7. Don't repeat information already discussed

Respond as Dr. AI would naturally respond. No JSON, no formatting markers."""

    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error in doctor response: {e}")
        return "I apologize for the technical difficulty. Based on what you've shared, I recommend consulting with a healthcare provider for a proper evaluation. Is there anything specific you'd like me to clarify about your symptoms?"


async def _generate_consultation_summary(conversation: List[Dict]) -> Dict:
    """
    Generate a summary of the entire consultation
    """
    if not gemini_model:
        return _fallback_summary()

    # Build conversation for summary
    conversation_text = ""
    for msg in conversation[1:]:  # Skip system message
        role = "Patient" if msg["role"] == "user" else "Dr. AI"
        conversation_text += f"{role}: {msg['content']}\n\n"

    prompt = f"""Summarize this medical consultation between Dr. AI and a patient.

Conversation:
{conversation_text}

Provide a JSON summary with:
{{
  "chief_complaint": "Main symptom/issue discussed",
  "key_points": ["point 1", "point 2", "point 3"],
  "key_recommendations": ["recommendation 1", "recommendation 2"],
  "follow_up_needed": true/false,
  "urgency_level": "low|medium|high",
  "summary": "2-3 sentence overall summary"
}}

Return ONLY valid JSON."""

    try:
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()

        # Clean response
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Parse JSON
        if "{" in text:
            json_start = text.index("{")
            json_end = text.rindex("}") + 1
            return json.loads(text[json_start:json_end])
        else:
            return _fallback_summary()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return _fallback_summary()


def _build_patient_context(patient_data: Optional[Dict], symptom_data: Dict) -> str:
    """
    Build patient context string for AI
    """
    if not patient_data:
        return "Patient context: Limited information available"

    context_parts = []

    if patient_data.get("age"):
        context_parts.append(f"Age: {patient_data['age']}")
    if patient_data.get("gender"):
        context_parts.append(f"Gender: {patient_data['gender']}")
    if patient_data.get("medicalHistory") and patient_data["medicalHistory"] != "None":
        context_parts.append(f"Medical History: {patient_data['medicalHistory']}")
    if patient_data.get("medications") and patient_data["medications"] != "None":
        context_parts.append(f"Current Medications: {patient_data['medications']}")
    if patient_data.get("allergyDetails") and patient_data["allergyDetails"] != "None":
        context_parts.append(f"Allergies: {patient_data['allergyDetails']}")

    return "Patient Profile:\n" + "\n".join(f"- {part}" for part in context_parts)


def _fallback_initial_message(symptoms: str) -> str:
    """
    Fallback initial message when Gemini is unavailable
    """
    return f"""Good day! I'm Dr. AI, your virtual medical consultant. I've reviewed your symptom report.

I understand you're experiencing: {symptoms[:150]}{'...' if len(symptoms) > 150 else ''}

To provide you with the most accurate guidance, I'd like to ask a few questions:

1. When did you first notice these symptoms?
2. Have the symptoms been getting worse, staying the same, or improving?
3. On a scale of 1-10, how would you rate your current discomfort level?

Please share any additional details that might be relevant."""


def _fallback_summary() -> Dict:
    """
    Fallback summary when generation fails
    """
    return {
        "chief_complaint": "Medical consultation completed",
        "key_points": ["Symptoms discussed with AI doctor", "Recommendations provided"],
        "key_recommendations": ["Follow up with healthcare provider if symptoms persist"],
        "follow_up_needed": True,
        "urgency_level": "medium",
        "summary": "Consultation completed. Patient advised to monitor symptoms and seek professional care if condition worsens."
    }


def _calculate_duration(conversation: List[Dict]) -> str:
    """
    Calculate consultation duration
    """
    if len(conversation) < 2:
        return "< 1 minute"

    try:
        start_time = datetime.fromisoformat(conversation[1]["timestamp"])
        end_time = datetime.fromisoformat(conversation[-1]["timestamp"])
        duration = (end_time - start_time).total_seconds() / 60

        if duration < 1:
            return "< 1 minute"
        elif duration < 60:
            return f"{int(duration)} minutes"
        else:
            hours = int(duration / 60)
            minutes = int(duration % 60)
            return f"{hours}h {minutes}m"
    except:
        return "Unknown"
