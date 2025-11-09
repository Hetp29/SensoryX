# backend/app/services/photon_service.py
"""
Photon Hybrid Intelligence Service

Implements true human-AI collaboration where:
- AI agents analyze and suggest
- Human doctors review and validate
- System combines both for optimal outcome

Track: Photon - Hybrid Intelligence
"""

from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
import json

class CollaborationStage(str, Enum):
    AI_ANALYZING = "ai_analyzing"
    HUMAN_REVIEW_PENDING = "human_review_pending"
    HUMAN_REVIEWING = "human_reviewing"
    CONSENSUS_REACHED = "consensus_reached"
    DISAGREEMENT = "disagreement"
    COMPLETED = "completed"


class HybridSession:
    """Represents a hybrid intelligence consultation session"""

    def __init__(self, session_id: str, patient_data: Dict):
        self.session_id = session_id
        self.patient_data = patient_data
        self.stage = CollaborationStage.AI_ANALYZING
        self.ai_analysis = None
        self.human_review = None
        self.final_recommendation = None
        self.conversation_history = []
        self.confidence_scores = {"ai": 0.0, "human": 0.0, "hybrid": 0.0}
        self.created_at = datetime.now()
        self.updated_at = datetime.now()


# In-memory session store (replace with Redis/DB in production)
hybrid_sessions: Dict[str, HybridSession] = {}


async def start_hybrid_consultation(
    patient_data: Dict,
    symptoms: str,
    urgency: str = "medium"
) -> Dict:
    """
    Start a hybrid intelligence consultation

    Step 1: AI agents analyze symptoms
    Step 2: Human doctor validates
    Step 3: Combine insights

    Track: Photon Hybrid Intelligence
    """
    session_id = f"hybrid_{datetime.now().timestamp()}"

    # Create hybrid session
    session = HybridSession(session_id=session_id, patient_data=patient_data)
    hybrid_sessions[session_id] = session

    # Initiate AI analysis (would call Dedalus multi-agent in real implementation)
    ai_analysis = await _get_ai_analysis(symptoms, patient_data, urgency)

    session.ai_analysis = ai_analysis
    session.stage = CollaborationStage.HUMAN_REVIEW_PENDING
    session.confidence_scores["ai"] = ai_analysis.get("confidence", 0.75)
    session.updated_at = datetime.now()

    # Determine if human review is needed
    needs_human = _should_escalate_to_human(ai_analysis, urgency)

    if needs_human:
        session.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "actor": "system",
            "message": "AI analysis complete. Escalating to human doctor for validation.",
            "reason": ai_analysis.get("escalation_reason", "Complex case requiring human expertise")
        })
    else:
        session.stage = CollaborationStage.COMPLETED
        session.final_recommendation = ai_analysis

    return {
        "session_id": session_id,
        "stage": session.stage.value,
        "ai_analysis": ai_analysis,
        "needs_human_review": needs_human,
        "estimated_wait_time": "5-15 minutes" if needs_human else "0 minutes",
        "collaboration_type": "hybrid" if needs_human else "ai_only",
        "track": "Photon - Hybrid Intelligence"
    }


async def submit_human_review(
    session_id: str,
    doctor_id: str,
    doctor_name: str,
    review: Dict
) -> Dict:
    """
    Human doctor submits review of AI analysis

    This creates true hybrid intelligence - AI suggests, human validates

    Track: Photon Hybrid Intelligence
    """
    if session_id not in hybrid_sessions:
        return {"error": "Session not found"}

    session = hybrid_sessions[session_id]
    session.stage = CollaborationStage.HUMAN_REVIEWING
    session.human_review = {
        "doctor_id": doctor_id,
        "doctor_name": doctor_name,
        "timestamp": datetime.now().isoformat(),
        **review
    }

    # Combine AI + Human insights
    hybrid_result = await _create_hybrid_recommendation(
        ai_analysis=session.ai_analysis,
        human_review=session.human_review,
        patient_data=session.patient_data
    )

    # Check for consensus or disagreement
    if _check_consensus(session.ai_analysis, session.human_review):
        session.stage = CollaborationStage.CONSENSUS_REACHED
    else:
        session.stage = CollaborationStage.DISAGREEMENT

    session.final_recommendation = hybrid_result
    session.confidence_scores["human"] = review.get("confidence", 0.90)
    session.confidence_scores["hybrid"] = (
        session.confidence_scores["ai"] * 0.4 +
        session.confidence_scores["human"] * 0.6
    )
    session.updated_at = datetime.now()

    session.conversation_history.append({
        "timestamp": datetime.now().isoformat(),
        "actor": "human_doctor",
        "doctor_name": doctor_name,
        "action": "review_submitted",
        "agrees_with_ai": _check_consensus(session.ai_analysis, session.human_review)
    })

    return {
        "session_id": session_id,
        "stage": session.stage.value,
        "hybrid_recommendation": hybrid_result,
        "consensus": session.stage == CollaborationStage.CONSENSUS_REACHED,
        "confidence": session.confidence_scores["hybrid"],
        "track": "Photon - Hybrid Intelligence"
    }


async def get_hybrid_consultation_status(session_id: str) -> Dict:
    """
    Get current status of hybrid consultation

    Shows collaboration workflow in real-time
    """
    if session_id not in hybrid_sessions:
        return {"error": "Session not found"}

    session = hybrid_sessions[session_id]

    return {
        "session_id": session_id,
        "stage": session.stage.value,
        "ai_analysis": session.ai_analysis,
        "human_review": session.human_review,
        "final_recommendation": session.final_recommendation,
        "confidence_scores": session.confidence_scores,
        "conversation_history": session.conversation_history,
        "collaboration_timeline": {
            "started": session.created_at.isoformat(),
            "last_updated": session.updated_at.isoformat(),
            "duration_minutes": (datetime.now() - session.created_at).total_seconds() / 60
        },
        "track": "Photon - Hybrid Intelligence"
    }


async def add_collaboration_message(
    session_id: str,
    actor: str,  # "patient", "ai_agent", "human_doctor"
    message: str,
    metadata: Optional[Dict] = None
) -> Dict:
    """
    Add a message to the hybrid collaboration thread

    Enables real-time conversation between patient, AI, and human doctor
    iMessage Kit Integration Point

    Track: Photon Hybrid Intelligence
    """
    if session_id not in hybrid_sessions:
        return {"error": "Session not found"}

    session = hybrid_sessions[session_id]

    message_entry = {
        "timestamp": datetime.now().isoformat(),
        "actor": actor,
        "message": message,
        "metadata": metadata or {}
    }

    session.conversation_history.append(message_entry)
    session.updated_at = datetime.now()

    # If patient asks question, AI can respond immediately while human is reviewing
    response = None
    if actor == "patient" and session.stage == CollaborationStage.HUMAN_REVIEW_PENDING:
        response = await _ai_quick_response(message, session.ai_analysis)

        session.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "actor": "ai_agent",
            "message": response,
            "type": "quick_response"
        })

    return {
        "success": True,
        "session_id": session_id,
        "message_added": message_entry,
        "ai_response": response,
        "current_stage": session.stage.value
    }


async def request_human_escalation(
    session_id: str,
    reason: str,
    patient_message: Optional[str] = None
) -> Dict:
    """
    Patient or AI can request human doctor escalation

    Track: Photon Hybrid Intelligence
    """
    if session_id not in hybrid_sessions:
        return {"error": "Session not found"}

    session = hybrid_sessions[session_id]

    if session.stage == CollaborationStage.COMPLETED:
        session.stage = CollaborationStage.HUMAN_REVIEW_PENDING

    escalation_entry = {
        "timestamp": datetime.now().isoformat(),
        "actor": "system",
        "action": "escalation_requested",
        "reason": reason,
        "patient_message": patient_message,
        "priority": _determine_priority(reason, session.ai_analysis)
    }

    session.conversation_history.append(escalation_entry)
    session.updated_at = datetime.now()

    # Find suitable human doctor
    suggested_doctor = await _match_doctor_for_case(
        symptoms=session.ai_analysis.get("symptoms"),
        urgency=session.ai_analysis.get("urgency_level", "medium"),
        patient_data=session.patient_data
    )

    return {
        "success": True,
        "session_id": session_id,
        "escalation_status": "pending",
        "suggested_doctor": suggested_doctor,
        "estimated_response_time": "10-30 minutes",
        "priority": escalation_entry["priority"],
        "track": "Photon - Hybrid Intelligence"
    }


# ============================================
# HELPER FUNCTIONS
# ============================================

async def _get_ai_analysis(symptoms: str, patient_data: Dict, urgency: str) -> Dict:
    """Get multi-agent AI analysis (using Dedalus + Gemini)"""
    # In real implementation, this would call Dedalus orchestrator
    # For now, mock comprehensive AI analysis

    return {
        "symptoms": symptoms,
        "primary_diagnosis": "Tension Headache",
        "confidence": 0.78,
        "differential_diagnoses": [
            {"condition": "Tension Headache", "probability": 0.78},
            {"condition": "Migraine", "probability": 0.15},
            {"condition": "Sinus Infection", "probability": 0.07}
        ],
        "urgency_level": urgency,
        "recommended_treatment": "Rest, hydration, OTC pain relief",
        "red_flags": [],
        "escalation_reason": "Moderate confidence - human validation recommended",
        "ai_agents_consulted": ["symptom_analyzer", "treatment_recommender", "risk_assessor"],
        "analysis_timestamp": datetime.now().isoformat()
    }


def _should_escalate_to_human(ai_analysis: Dict, urgency: str) -> bool:
    """Determine if human doctor review is needed"""

    # Always escalate if:
    # 1. Low AI confidence (<70%)
    # 2. High urgency
    # 3. Red flags present
    # 4. Multiple high-probability diagnoses (uncertainty)

    confidence = ai_analysis.get("confidence", 0)
    red_flags = ai_analysis.get("red_flags", [])
    diagnoses = ai_analysis.get("differential_diagnoses", [])

    if confidence < 0.70:
        return True
    if urgency in ["high", "emergency"]:
        return True
    if len(red_flags) > 0:
        return True
    if len([d for d in diagnoses if d.get("probability", 0) > 0.20]) > 2:
        return True

    return False


async def _create_hybrid_recommendation(
    ai_analysis: Dict,
    human_review: Dict,
    patient_data: Dict
) -> Dict:
    """Combine AI and human insights into unified recommendation"""

    # Hybrid recommendation prioritizes human judgment but incorporates AI insights

    return {
        "diagnosis": human_review.get("diagnosis", ai_analysis.get("primary_diagnosis")),
        "confidence": round((ai_analysis.get("confidence", 0) * 0.3 + human_review.get("confidence", 0.9) * 0.7), 2),
        "treatment_plan": human_review.get("treatment_plan", ai_analysis.get("recommended_treatment")),
        "ai_insights": {
            "differential_diagnoses": ai_analysis.get("differential_diagnoses"),
            "ai_confidence": ai_analysis.get("confidence")
        },
        "human_validation": {
            "doctor_notes": human_review.get("notes"),
            "doctor_confidence": human_review.get("confidence"),
            "modifications_from_ai": human_review.get("modifications", [])
        },
        "consensus": _check_consensus(ai_analysis, human_review),
        "hybrid_strength": "AI speed + Human expertise = Optimal outcome",
        "next_steps": human_review.get("next_steps", []),
        "follow_up_required": human_review.get("follow_up_required", False),
        "timestamp": datetime.now().isoformat()
    }


def _check_consensus(ai_analysis: Dict, human_review: Dict) -> bool:
    """Check if AI and human agree on diagnosis"""

    ai_diagnosis = ai_analysis.get("primary_diagnosis", "").lower()
    human_diagnosis = human_review.get("diagnosis", "").lower()

    # Simple similarity check (in production, use more sophisticated matching)
    return ai_diagnosis in human_diagnosis or human_diagnosis in ai_diagnosis


async def _ai_quick_response(patient_question: str, ai_analysis: Dict) -> str:
    """AI provides quick response while human doctor reviews"""

    question_lower = patient_question.lower()

    if "how long" in question_lower:
        return "Based on the initial analysis, most cases see improvement within 2-3 days with proper treatment. A human doctor is reviewing your case for confirmation."
    elif "serious" in question_lower or "worried" in question_lower:
        return "Your symptoms don't show immediate red flags, but a human doctor is reviewing to provide expert validation. You should see their response shortly."
    elif "cost" in question_lower:
        return "Treatment costs vary, but we can provide estimates once the human doctor confirms the diagnosis. Typically ranges from $50-$200 for this type of condition."
    else:
        return f"A human doctor is currently reviewing the AI analysis. They'll provide expert validation shortly. In the meantime, the AI assessment suggests: {ai_analysis.get('primary_diagnosis')}"


def _determine_priority(reason: str, ai_analysis: Dict) -> str:
    """Determine priority level for human escalation"""

    reason_lower = reason.lower()
    urgency = ai_analysis.get("urgency_level", "medium")

    if urgency in ["high", "emergency"]:
        return "urgent"
    elif "pain" in reason_lower or "worsening" in reason_lower:
        return "high"
    elif "second opinion" in reason_lower:
        return "normal"
    else:
        return "low"


async def _match_doctor_for_case(symptoms: str, urgency: str, patient_data: Dict) -> Dict:
    """Match best human doctor for the case"""

    # Mock doctor matching (in production, use doctor_service)
    return {
        "doctor_id": "dr001",
        "name": "Dr. Sarah Johnson",
        "specialty": "General Practitioner",
        "availability": "Available now" if urgency in ["high", "emergency"] else "Available in 15 min",
        "rating": 4.8,
        "hybrid_cases_completed": 324
    }


# ============================================
# IMESSAGE KIT INTEGRATION HELPERS
# ============================================

async def format_for_imessage(session_id: str) -> Dict:
    """
    Format hybrid consultation for iMessage display

    iMessage Kit Integration Point
    """
    if session_id not in hybrid_sessions:
        return {"error": "Session not found"}

    session = hybrid_sessions[session_id]

    # Format conversation for iMessage bubbles
    messages = []
    for entry in session.conversation_history:
        actor_label = {
            "ai_agent": "🤖 AI Doctor",
            "human_doctor": f"👨‍⚕️ {entry.get('doctor_name', 'Dr. Expert')}",
            "patient": "You",
            "system": "📋 SensoryX"
        }.get(entry["actor"], entry["actor"])

        messages.append({
            "sender": actor_label,
            "text": entry.get("message", entry.get("action", "")),
            "timestamp": entry["timestamp"]
        })

    # Current status summary
    status_emoji = {
        "ai_analyzing": "🔄",
        "human_review_pending": "⏳",
        "human_reviewing": "👨‍⚕️",
        "consensus_reached": "✅",
        "disagreement": "⚠️",
        "completed": "✅"
    }.get(session.stage.value, "📋")

    return {
        "session_id": session_id,
        "status": f"{status_emoji} {session.stage.value.replace('_', ' ').title()}",
        "messages": messages,
        "can_send_message": True,
        "quick_actions": _get_quick_actions(session),
        "imessage_compatible": True
    }


def _get_quick_actions(session: HybridSession) -> List[str]:
    """Get quick action buttons for iMessage"""

    actions = []

    if session.stage == CollaborationStage.HUMAN_REVIEW_PENDING:
        actions = [
            "Ask AI a question",
            "Request urgent review",
            "View current analysis"
        ]
    elif session.stage == CollaborationStage.CONSENSUS_REACHED:
        actions = [
            "View final recommendation",
            "Book follow-up",
            "Download summary"
        ]
    elif session.stage == CollaborationStage.COMPLETED:
        actions = [
            "Request human review anyway",
            "Start new consultation",
            "View treatment plan"
        ]

    return actions
