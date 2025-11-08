# backend/app/services/predictive_service.py
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_model = None

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-pro')


# Mock historical data for predictions (replace with Snowflake queries in production)
TREATMENT_SUCCESS_DATA = {
    "migraine": {
        "sumatriptan": {"success_rate": 0.78, "avg_relief_time": "45 minutes", "patient_count": 487},
        "ibuprofen": {"success_rate": 0.62, "avg_relief_time": "90 minutes", "patient_count": 312},
        "rest": {"success_rate": 0.45, "avg_relief_time": "4 hours", "patient_count": 201}
    },
    "common_cold": {
        "rest_fluids": {"success_rate": 0.85, "avg_relief_time": "5 days", "patient_count": 1203},
        "vitamin_c": {"success_rate": 0.72, "avg_relief_time": "4 days", "patient_count": 567},
        "zinc": {"success_rate": 0.68, "avg_relief_time": "4.5 days", "patient_count": 432}
    },
    "back_pain": {
        "physical_therapy": {"success_rate": 0.82, "avg_relief_time": "3 weeks", "patient_count": 689},
        "pain_medication": {"success_rate": 0.71, "avg_relief_time": "1 week", "patient_count": 823},
        "surgery": {"success_rate": 0.91, "avg_relief_time": "6 weeks", "patient_count": 145}
    },
    "anxiety": {
        "therapy": {"success_rate": 0.88, "avg_relief_time": "8 weeks", "patient_count": 934},
        "medication": {"success_rate": 0.76, "avg_relief_time": "4 weeks", "patient_count": 712},
        "meditation": {"success_rate": 0.64, "avg_relief_time": "6 weeks", "patient_count": 456}
    }
}


async def predict_treatment_outcome(
    condition: str,
    treatment: str,
    patient_profile: Optional[Dict] = None
) -> Dict:
    """
    Predict treatment success probability and timeline

    Uses historical patient data + AI analysis
    Track: Chestnut Forty (Predictive Intelligence)
    """
    condition_lower = condition.lower()
    treatment_lower = treatment.lower()

    # Find matching historical data
    base_data = None
    for cond_key, treatments in TREATMENT_SUCCESS_DATA.items():
        if cond_key in condition_lower or condition_lower in cond_key:
            for treat_key, data in treatments.items():
                if treat_key in treatment_lower or treatment_lower in treat_key:
                    base_data = data
                    break
            if base_data:
                break

    # Default prediction if no historical data
    if not base_data:
        base_data = {
            "success_rate": 0.70,
            "avg_relief_time": "2 weeks",
            "patient_count": 100
        }

    # Adjust prediction based on patient profile
    success_prob = base_data["success_rate"]
    confidence = 0.85

    if patient_profile:
        age = patient_profile.get("age")
        if age:
            try:
                age_num = int(age)
                # Younger patients: +5% success, Older: -5%
                if age_num < 30:
                    success_prob = min(0.98, success_prob + 0.05)
                elif age_num > 60:
                    success_prob = max(0.40, success_prob - 0.05)
            except:
                pass

        # Pre-existing conditions reduce success slightly
        if patient_profile.get("medicalHistory") and patient_profile["medicalHistory"] != "None":
            success_prob = max(0.40, success_prob - 0.03)
            confidence -= 0.05

    # Get AI-enhanced analysis
    ai_insights = await _get_ai_outcome_insights(condition, treatment, patient_profile, success_prob)

    return {
        "condition": condition,
        "treatment": treatment,
        "prediction": {
            "success_probability": round(success_prob, 2),
            "confidence_level": round(confidence, 2),
            "expected_timeline": base_data["avg_relief_time"],
            "similar_patient_count": base_data["patient_count"]
        },
        "insights": ai_insights,
        "factors_affecting_outcome": _get_affecting_factors(patient_profile),
        "alternative_treatments": _get_alternative_treatments(condition, treatment),
        "track": "Chestnut Forty - Predictive Intelligence"
    }


async def predict_diagnosis_timeline(
    symptoms: str,
    urgency_level: str = "medium",
    patient_profile: Optional[Dict] = None
) -> Dict:
    """
    Predict timeline to diagnosis based on symptoms

    Track: Chestnut Forty (Predictive Intelligence)
    """
    # Base timeline by urgency
    timeline_days = {
        "low": 14,
        "medium": 7,
        "high": 2,
        "emergency": 0.25  # 6 hours
    }

    base_days = timeline_days.get(urgency_level, 7)

    # Adjust based on healthcare system load (mock)
    system_load_multiplier = random.uniform(0.8, 1.3)
    predicted_days = base_days * system_load_multiplier

    # Format timeline
    if predicted_days < 1:
        timeline_str = f"{int(predicted_days * 24)} hours"
    elif predicted_days < 7:
        timeline_str = f"{int(predicted_days)} days"
    else:
        timeline_str = f"{int(predicted_days / 7)} weeks"

    # Cost prediction
    cost_estimate = _estimate_diagnosis_cost(urgency_level, predicted_days)

    # Get AI insights
    ai_analysis = await _get_ai_timeline_insights(symptoms, urgency_level, predicted_days)

    return {
        "symptoms": symptoms,
        "urgency_level": urgency_level,
        "timeline_prediction": {
            "estimated_days": round(predicted_days, 1),
            "timeline_range": f"{int(predicted_days * 0.7)}-{int(predicted_days * 1.3)} days",
            "human_readable": timeline_str,
            "confidence": 0.78
        },
        "cost_prediction": cost_estimate,
        "next_steps": _get_diagnosis_next_steps(urgency_level),
        "ai_insights": ai_analysis,
        "track": "Chestnut Forty - Predictive Intelligence"
    }


async def find_symptom_twins(
    symptoms: str,
    patient_profile: Optional[Dict] = None,
    limit: int = 10
) -> Dict:
    """
    Find similar patients with same symptoms (symptom twins)

    Analyzes historical data to find matching cases
    Track: Chestnut Forty (Predictive Intelligence)
    """
    # Mock symptom twin data (replace with Snowflake similarity search)
    twins = []

    # Generate realistic mock twins
    for i in range(limit):
        similarity_score = random.uniform(0.65, 0.95)

        twin = {
            "twin_id": f"twin_{i+1}",
            "similarity_score": round(similarity_score, 2),
            "symptoms_match": random.randint(75, 98),
            "demographics_match": random.randint(60, 90),
            "diagnosis": _get_mock_diagnosis(symptoms),
            "time_to_diagnosis": f"{random.randint(2, 14)} days",
            "treatment_success": random.choice([True, True, True, False]),
            "total_cost": random.randint(500, 3000),
            "age_group": _get_age_group(patient_profile)
        }
        twins.append(twin)

    # Sort by similarity
    twins.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Calculate aggregate insights
    successful_treatments = sum(1 for t in twins if t["treatment_success"])
    avg_cost = sum(t["total_cost"] for t in twins) / len(twins)
    avg_days = sum(int(t["time_to_diagnosis"].split()[0]) for t in twins) / len(twins)

    return {
        "total_twins_found": len(twins),
        "twins": twins[:limit],
        "aggregate_insights": {
            "success_rate": round(successful_treatments / len(twins), 2),
            "average_cost": round(avg_cost, 2),
            "average_time_to_diagnosis": f"{int(avg_days)} days",
            "most_common_diagnosis": _get_mock_diagnosis(symptoms)
        },
        "confidence": 0.82,
        "track": "Chestnut Forty - Predictive Intelligence"
    }


async def detect_health_trends(
    location: Optional[str] = "Boston, MA",
    timeframe_days: int = 30
) -> Dict:
    """
    Detect real-time health trends and outbreak patterns

    Track: Amazon (Practical AI), Chestnut Forty
    """
    # Mock trend data (replace with Snowflake time-series analysis)
    trends = [
        {
            "condition": "Influenza",
            "trend": "increasing",
            "change_percent": 42,
            "current_cases": 1234,
            "predicted_peak": "2 weeks",
            "severity": "moderate",
            "alert_level": "yellow"
        },
        {
            "condition": "Common Cold",
            "trend": "stable",
            "change_percent": 5,
            "current_cases": 3421,
            "predicted_peak": "ongoing",
            "severity": "low",
            "alert_level": "green"
        },
        {
            "condition": "Seasonal Allergies",
            "trend": "increasing",
            "change_percent": 28,
            "current_cases": 892,
            "predicted_peak": "1 week",
            "severity": "low",
            "alert_level": "green"
        },
        {
            "condition": "Migraine",
            "trend": "decreasing",
            "change_percent": -12,
            "current_cases": 567,
            "predicted_peak": "subsiding",
            "severity": "low",
            "alert_level": "green"
        }
    ]

    # Get AI analysis of trends
    ai_summary = await _get_ai_trend_analysis(trends, location, timeframe_days)

    return {
        "location": location,
        "timeframe_days": timeframe_days,
        "analysis_date": datetime.now().isoformat(),
        "trends": trends,
        "alerts": [t for t in trends if t["alert_level"] in ["yellow", "red"]],
        "recommendations": _get_trend_recommendations(trends),
        "ai_summary": ai_summary,
        "track": "Amazon Practical AI + Chestnut Forty"
    }


async def predict_cost_breakdown(
    condition: str,
    treatment_plan: str,
    insurance_coverage: Optional[float] = 0.70
) -> Dict:
    """
    Predict total cost breakdown for condition + treatment

    Track: Chestnut Forty (Predictive Intelligence)
    """
    # Base costs (mock data)
    base_costs = {
        "diagnosis": random.randint(200, 500),
        "treatment": random.randint(300, 1500),
        "follow_up": random.randint(100, 300),
        "medication": random.randint(50, 400),
        "lab_tests": random.randint(150, 600)
    }

    total_cost = sum(base_costs.values())
    insurance_pays = total_cost * insurance_coverage
    out_of_pocket = total_cost - insurance_pays

    # Timeline for costs
    cost_timeline = [
        {"week": 1, "cost": base_costs["diagnosis"] + base_costs["lab_tests"]},
        {"week": 2, "cost": base_costs["treatment"]},
        {"week": 4, "cost": base_costs["follow_up"]},
        {"month": 3, "cost": base_costs["medication"]}
    ]

    return {
        "condition": condition,
        "treatment_plan": treatment_plan,
        "cost_prediction": {
            "total_estimated_cost": total_cost,
            "insurance_coverage": round(insurance_pays, 2),
            "out_of_pocket": round(out_of_pocket, 2),
            "breakdown": base_costs,
            "confidence": 0.76
        },
        "cost_timeline": cost_timeline,
        "savings_opportunities": _get_cost_savings(base_costs, insurance_coverage),
        "track": "Chestnut Forty - Predictive Intelligence"
    }


# ============================================
# HELPER FUNCTIONS
# ============================================

async def _get_ai_outcome_insights(condition: str, treatment: str, patient_profile: Optional[Dict], success_prob: float) -> str:
    """Get AI-generated insights about treatment outcome"""
    if not gemini_model:
        return f"Based on historical data, {treatment} has shown {int(success_prob * 100)}% success rate for {condition}. Individual results may vary based on patient factors."

    try:
        prompt = f"""As a medical AI, provide 2-3 sentence insight about treatment outcome prediction.

Condition: {condition}
Treatment: {treatment}
Predicted Success: {int(success_prob * 100)}%
Patient Profile: {json.dumps(patient_profile or {})}

Provide brief, actionable insights. Focus on key factors that influence success."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"Based on historical data, {treatment} has shown {int(success_prob * 100)}% success rate for {condition}."


async def _get_ai_timeline_insights(symptoms: str, urgency: str, days: float) -> str:
    """Get AI analysis of diagnosis timeline"""
    if not gemini_model:
        return f"Based on symptom urgency ({urgency}), diagnosis timeline is estimated at {int(days)} days."

    try:
        prompt = f"""As a medical AI, provide 2 sentence insight about diagnosis timeline.

Symptoms: {symptoms}
Urgency: {urgency}
Predicted Timeline: {int(days)} days

Brief insight about what affects this timeline."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"Timeline based on urgency level and healthcare system capacity."


async def _get_ai_trend_analysis(trends: List[Dict], location: str, days: int) -> str:
    """Get AI summary of health trends"""
    if not gemini_model:
        increasing = [t["condition"] for t in trends if t["trend"] == "increasing"]
        return f"In {location}, {', '.join(increasing)} cases are trending upward over the past {days} days."

    try:
        trend_summary = "\n".join([f"- {t['condition']}: {t['trend']} ({t['change_percent']:+d}%)" for t in trends[:3]])

        prompt = f"""Summarize health trends in {location} over {days} days:

{trend_summary}

Provide 2-3 sentence summary with key takeaways."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"Health trend analysis for {location} over {days} days."


def _get_affecting_factors(patient_profile: Optional[Dict]) -> List[str]:
    """Get factors affecting treatment outcome"""
    factors = ["Treatment adherence", "Symptom severity"]

    if patient_profile:
        if patient_profile.get("age"):
            factors.append("Patient age")
        if patient_profile.get("medicalHistory") and patient_profile["medicalHistory"] != "None":
            factors.append("Pre-existing conditions")
        if patient_profile.get("medications") and patient_profile["medications"] != "None":
            factors.append("Current medications")

    return factors


def _get_alternative_treatments(condition: str, current_treatment: str) -> List[Dict]:
    """Get alternative treatment options"""
    condition_lower = condition.lower()

    for cond_key, treatments in TREATMENT_SUCCESS_DATA.items():
        if cond_key in condition_lower:
            alternatives = []
            for treat_name, data in treatments.items():
                if treat_name.lower() != current_treatment.lower():
                    alternatives.append({
                        "treatment": treat_name.replace("_", " ").title(),
                        "success_rate": data["success_rate"],
                        "timeline": data["avg_relief_time"]
                    })
            return alternatives[:3]

    return []


def _estimate_diagnosis_cost(urgency: str, days: float) -> Dict:
    """Estimate diagnosis costs"""
    base_cost = {
        "low": 250,
        "medium": 400,
        "high": 700,
        "emergency": 1500
    }.get(urgency, 400)

    return {
        "estimated_total": base_cost,
        "range_low": int(base_cost * 0.7),
        "range_high": int(base_cost * 1.4),
        "currency": "USD"
    }


def _get_diagnosis_next_steps(urgency: str) -> List[str]:
    """Get recommended next steps for diagnosis"""
    steps = {
        "low": [
            "Monitor symptoms for 3-5 days",
            "Schedule appointment with primary care",
            "Track symptom progression"
        ],
        "medium": [
            "Schedule appointment within 48 hours",
            "Document all symptoms",
            "Prepare medical history"
        ],
        "high": [
            "Seek medical attention within 24 hours",
            "Visit urgent care if symptoms worsen",
            "Bring list of current medications"
        ],
        "emergency": [
            "Seek immediate emergency care",
            "Call 911 if life-threatening",
            "Go to nearest ER"
        ]
    }
    return steps.get(urgency, steps["medium"])


def _get_mock_diagnosis(symptoms: str) -> str:
    """Generate mock diagnosis based on symptoms"""
    symptom_lower = symptoms.lower()

    if "headache" in symptom_lower or "migraine" in symptom_lower:
        return "Migraine"
    elif "cold" in symptom_lower or "congestion" in symptom_lower:
        return "Common Cold"
    elif "pain" in symptom_lower and "back" in symptom_lower:
        return "Musculoskeletal Pain"
    elif "anxiety" in symptom_lower or "stress" in symptom_lower:
        return "Anxiety Disorder"
    else:
        return "General Assessment Needed"


def _get_age_group(patient_profile: Optional[Dict]) -> str:
    """Get age group for patient"""
    if not patient_profile or not patient_profile.get("age"):
        return "Unknown"

    try:
        age = int(patient_profile["age"])
        if age < 18:
            return "Pediatric"
        elif age < 30:
            return "Young Adult"
        elif age < 50:
            return "Adult"
        elif age < 65:
            return "Middle Age"
        else:
            return "Senior"
    except:
        return "Unknown"


def _get_trend_recommendations(trends: List[Dict]) -> List[str]:
    """Get recommendations based on trends"""
    recommendations = []

    for trend in trends:
        if trend["alert_level"] == "yellow":
            recommendations.append(f"Consider preventive measures for {trend['condition']}")
        elif trend["alert_level"] == "red":
            recommendations.append(f"HIGH ALERT: Take precautions against {trend['condition']}")

    if not recommendations:
        recommendations.append("Continue normal health practices")
        recommendations.append("Stay updated on local health advisories")

    return recommendations


def _get_cost_savings(costs: Dict, insurance_coverage: float) -> List[Dict]:
    """Get cost saving opportunities"""
    return [
        {
            "opportunity": "Generic Medications",
            "potential_savings": int(costs.get("medication", 0) * 0.4),
            "description": "Switch to generic equivalents where possible"
        },
        {
            "opportunity": "In-Network Providers",
            "potential_savings": int(sum(costs.values()) * 0.15),
            "description": "Use in-network healthcare providers"
        },
        {
            "opportunity": "Preventive Care",
            "potential_savings": int(costs.get("follow_up", 0) * 0.5),
            "description": "Utilize preventive care benefits"
        }
    ]
