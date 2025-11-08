# backend/app/routers/financial.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services import knot_service

router = APIRouter()


class FinancialRiskRequest(BaseModel):
    monthly_income: float
    existing_medical_debt: float = 0
    estimated_treatment_cost: float


@router.post("/link-account")
async def link_bank_account(user_id: str):
    session = await knot_service.create_knot_session(user_id)
    return session


@router.get("/spending-summary/{user_id}")
async def get_spending_summary(user_id: str):
    summary = await knot_service.get_spending_summary(user_id)
    return summary


@router.get("/transactions/{user_id}")
async def get_medical_transactions(user_id: str, months: int = 12):
    transactions = await knot_service.get_medical_transactions(user_id, months)
    return {"transactions": transactions, "count": len(transactions)}


@router.post("/risk-assessment")
async def assess_financial_risk(request: FinancialRiskRequest):
    risk_assessment = await knot_service.calculate_financial_risk(
        monthly_income=request.monthly_income,
        existing_medical_debt=request.existing_medical_debt,
        estimated_treatment_cost=request.estimated_treatment_cost
    )
    return risk_assessment


@router.get("/treatment-cost/{condition}/{treatment}")
async def get_treatment_cost(condition: str, treatment: str):
    cost_estimate = await knot_service.estimate_treatment_cost(condition, treatment)
    return cost_estimate


@router.get("/ai-vs-human-comparison")
async def get_ai_vs_human_cost_comparison(
    condition: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    Get side-by-side cost comparison between AI Doctor and Human Doctor consultations

    Returns:
    - AI Doctor costs (free and premium tiers)
    - Human Doctor costs
    - Cost savings
    - Time to consultation comparison
    - Feature comparison
    """
    # Get user's average doctor visit cost if user_id provided
    avg_human_cost = 200  # default
    if user_id:
        try:
            summary = await knot_service.get_spending_summary(user_id)
            if "categories" in summary and "doctor_visits" in summary["categories"]:
                visits = summary["categories"]["doctor_visits"]
                if visits["count"] > 0:
                    avg_human_cost = visits["total"] / visits["count"]
        except:
            pass

    # Condition-specific cost adjustments
    condition_multipliers = {
        "neurology": 1.5,
        "cardiology": 1.4,
        "dermatology": 0.9,
        "general": 1.0,
        "urgent care": 0.7
    }

    multiplier = 1.0
    if condition:
        condition_lower = condition.lower()
        for key, mult in condition_multipliers.items():
            if key in condition_lower:
                multiplier = mult
                break

    human_cost_low = int(150 * multiplier)
    human_cost_high = int(300 * multiplier)
    avg_human = int(avg_human_cost * multiplier)

    return {
        "success": True,
        "comparison": {
            "ai_doctor": {
                "name": "AI Doctor Consultation",
                "tiers": [
                    {
                        "tier": "Free",
                        "cost": 0,
                        "currency": "USD",
                        "features": [
                            "Instant results",
                            "24/7 Available",
                            "Based on symptom twin data",
                            "General guidance",
                            "Unlimited questions"
                        ],
                        "limitations": [
                            "No detailed treatment plans",
                            "General recommendations only"
                        ]
                    },
                    {
                        "tier": "Premium",
                        "cost": 35,
                        "currency": "USD",
                        "features": [
                            "Instant results",
                            "24/7 Available",
                            "Based on symptom twin data",
                            "Detailed analysis",
                            "Personalized treatment suggestions",
                            "Follow-up recommendations"
                        ],
                        "limitations": []
                    }
                ],
                "time_to_consultation": "Instant",
                "availability": "24/7",
                "follow_up_cost": 0
            },
            "human_doctor": {
                "name": "Human Doctor Visit",
                "cost_range": {
                    "low": human_cost_low,
                    "high": human_cost_high,
                    "average": avg_human,
                    "currency": "USD"
                },
                "features": [
                    "In-person physical exam",
                    "Professional medical diagnosis",
                    "Prescription authority",
                    "Insurance accepted",
                    "Specialist referrals"
                ],
                "limitations": [
                    "Wait time: 2-7 days",
                    "Limited availability",
                    "Office hours only",
                    "Travel required"
                ],
                "time_to_consultation": "2-7 days",
                "availability": "Business hours",
                "follow_up_cost": avg_human
            },
            "savings": {
                "free_tier": {
                    "min_savings": human_cost_low,
                    "max_savings": human_cost_high,
                    "avg_savings": avg_human
                },
                "premium_tier": {
                    "min_savings": human_cost_low - 35,
                    "max_savings": human_cost_high - 35,
                    "avg_savings": avg_human - 35
                }
            },
            "recommendation": _get_recommendation(condition, avg_human)
        }
    }


def _get_recommendation(condition: Optional[str], avg_cost: float) -> Dict:
    """
    Generate personalized recommendation based on condition and cost
    """
    if not condition:
        return {
            "suggestion": "ai_first",
            "reasoning": "Start with free AI consultation to understand your symptoms. Escalate to human doctor if needed.",
            "use_case": "general_inquiry"
        }

    condition_lower = condition.lower() if condition else ""

    # Emergency/serious conditions - recommend human doctor
    serious_keywords = ["emergency", "severe", "acute", "trauma", "chest pain", "stroke"]
    if any(keyword in condition_lower for keyword in serious_keywords):
        return {
            "suggestion": "human_doctor",
            "reasoning": "This condition requires immediate professional medical evaluation and in-person examination.",
            "use_case": "emergency"
        }

    # Chronic/manageable conditions - hybrid approach
    chronic_keywords = ["chronic", "management", "follow-up", "monitoring"]
    if any(keyword in condition_lower for keyword in chronic_keywords):
        return {
            "suggestion": "hybrid",
            "reasoning": "Use AI doctor for ongoing monitoring and questions. Schedule human doctor for periodic check-ups.",
            "use_case": "chronic_management"
        }

    # High cost situations - recommend AI first
    if avg_cost > 250:
        return {
            "suggestion": "ai_first",
            "reasoning": f"Save ${avg_cost - 35} by starting with AI consultation. Escalate to human doctor if needed.",
            "use_case": "cost_conscious"
        }

    # Default - hybrid approach
    return {
        "suggestion": "hybrid",
        "reasoning": "Get instant AI analysis for preliminary assessment, then book human doctor if symptoms persist.",
        "use_case": "balanced_approach"
    }
