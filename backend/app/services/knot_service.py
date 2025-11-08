# backend/app/services/knot_service.py
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

KNOT_API_KEY = os.getenv("KNOT_API_KEY")
KNOT_BASE_URL = "https://api.knotapi.com"
MOCK_ENABLED = not KNOT_API_KEY or KNOT_API_KEY == ""


async def create_knot_session(user_id: str) -> Dict:
    if MOCK_ENABLED:
        return {
            "session_id": f"mock_session_{user_id}",
            "status": "created",
            "link_url": "https://link.knotapi.com/mock"
        }

    # TODO: Real API call when key available
    # response = requests.post(f"{KNOT_BASE_URL}/sessions", ...)
    return {"session_id": f"mock_session_{user_id}", "status": "created"}


async def get_medical_transactions(user_id: str, months: int = 12) -> List[Dict]:
    if MOCK_ENABLED:
        return generate_mock_medical_transactions(months)

    # TODO: Real API call
    # response = requests.get(f"{KNOT_BASE_URL}/transactions", ...)
    return generate_mock_medical_transactions(months)


async def categorize_medical_spending(transactions: List[Dict]) -> Dict:
    categories = {
        "pharmacy": {"total": 0, "count": 0, "items": []},
        "doctor_visits": {"total": 0, "count": 0, "items": []},
        "hospital": {"total": 0, "count": 0, "items": []},
        "insurance": {"total": 0, "count": 0, "items": []},
        "medical_supplies": {"total": 0, "count": 0, "items": []},
        "dental": {"total": 0, "count": 0, "items": []},
        "vision": {"total": 0, "count": 0, "items": []}
    }

    for txn in transactions:
        category = txn.get("category", "medical_supplies")
        if category in categories:
            categories[category]["total"] += txn["amount"]
            categories[category]["count"] += 1
            categories[category]["items"].append(txn)

    return categories


async def estimate_treatment_cost(condition: str, treatment: str) -> Dict:
    cost_database = {
        "Migraine": {
            "Triptans medication": {"min": 30, "max": 150, "average": 75, "insurance_covered": 80},
            "Preventive medications": {"min": 20, "max": 200, "average": 85, "insurance_covered": 70}
        },
        "Occipital Neuralgia": {
            "Nerve block injection": {"min": 500, "max": 2000, "average": 1200, "insurance_covered": 60},
            "Physical therapy": {"min": 100, "max": 400, "average": 200, "insurance_covered": 75}
        },
        "GERD": {
            "Proton pump inhibitors": {"min": 10, "max": 100, "average": 40, "insurance_covered": 85},
            "Endoscopy": {"min": 800, "max": 3000, "average": 1500, "insurance_covered": 70}
        },
        "Gout": {
            "Colchicine and dietary changes": {"min": 25, "max": 150, "average": 60, "insurance_covered": 80},
            "Uric acid testing": {"min": 50, "max": 200, "average": 100, "insurance_covered": 90}
        },
        "TMJ Disorder": {
            "Mouth guard and jaw exercises": {"min": 200, "max": 800, "average": 450, "insurance_covered": 50}
        },
        "Restless Leg Syndrome": {
            "Iron supplementation and dopamine agonists": {"min": 30, "max": 200, "average": 90, "insurance_covered": 75}
        }
    }

    default_estimate = {
        "min": 50, "max": 500, "average": 200,
        "insurance_covered": 70, "out_of_pocket_estimate": 60
    }

    if condition in cost_database and treatment in cost_database[condition]:
        estimate = cost_database[condition][treatment]
        coverage_percent = estimate["insurance_covered"] / 100
        out_of_pocket = estimate["average"] * (1 - coverage_percent)

        return {
            **estimate,
            "out_of_pocket_estimate": round(out_of_pocket, 2),
            "condition": condition,
            "treatment": treatment
        }

    return {**default_estimate, "condition": condition, "treatment": treatment}


async def calculate_financial_risk(
    monthly_income: float,
    existing_medical_debt: float,
    estimated_treatment_cost: float
) -> Dict:
    annual_income = monthly_income * 12
    debt_to_income = (existing_medical_debt + estimated_treatment_cost) / annual_income if annual_income > 0 else 999
    monthly_burden = estimated_treatment_cost / (monthly_income * 6) if monthly_income > 0 else 999

    if debt_to_income > 0.5:
        risk_score = min(100, 70 + (debt_to_income - 0.5) * 100)
    elif debt_to_income > 0.3:
        risk_score = 40 + (debt_to_income - 0.3) * 150
    else:
        risk_score = debt_to_income * 100

    if risk_score >= 70:
        risk_level = "high"
        recommendation = "Consider payment plans, financial assistance programs, or medical credit options"
        alert_message = "⚠️ High financial risk - explore assistance programs immediately"
    elif risk_score >= 40:
        risk_level = "medium"
        recommendation = "Monitor expenses carefully and explore insurance options"
        alert_message = "⚡ Moderate risk - plan payment strategy ahead"
    else:
        risk_level = "low"
        recommendation = "Your financial situation can handle this treatment cost"
        alert_message = "✓ Low financial burden expected"

    affordable_monthly = monthly_income * 0.15
    payment_months = estimated_treatment_cost / affordable_monthly if affordable_monthly > 0 else 999

    return {
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "debt_to_income_ratio": round(debt_to_income, 3),
        "recommendation": recommendation,
        "alert_message": alert_message,
        "affordable_monthly_payment": round(affordable_monthly, 2),
        "estimated_months_to_pay": round(min(payment_months, 60), 1),
        "financial_assistance_eligible": risk_score > 50,
        "bankruptcy_risk_percentage": min(risk_score, 100)
    }


def generate_mock_medical_transactions(months: int = 12) -> List[Dict]:
    transactions = []
    start_date = datetime.now() - timedelta(days=months * 30)

    mock_transactions = [
        {"merchant": "CVS Pharmacy", "category": "pharmacy", "items": ["Ibuprofen 200mg", "Bandages"], "amount_range": (15, 80)},
        {"merchant": "Walgreens", "category": "pharmacy", "items": ["Prescription refill", "Vitamins"], "amount_range": (20, 150)},
        {"merchant": "Dr. Smith Primary Care", "category": "doctor_visits", "items": ["Office visit copay"], "amount_range": (25, 50)},
        {"merchant": "City Hospital", "category": "hospital", "items": ["ER visit"], "amount_range": (200, 1500)},
        {"merchant": "Blue Cross Insurance", "category": "insurance", "items": ["Monthly premium"], "amount_range": (300, 600)},
        {"merchant": "Amazon - Health", "category": "medical_supplies", "items": ["First aid kit", "Thermometer"], "amount_range": (20, 100)},
        {"merchant": "Smile Dental Care", "category": "dental", "items": ["Dental cleaning"], "amount_range": (80, 200)},
        {"merchant": "Vision Center", "category": "vision", "items": ["Eye exam"], "amount_range": (50, 150)},
        {"merchant": "Target Pharmacy", "category": "pharmacy", "items": ["Allergy medication"], "amount_range": (10, 40)},
        {"merchant": "Urgent Care Clinic", "category": "doctor_visits", "items": ["Urgent care visit"], "amount_range": (100, 250)}
    ]

    for month in range(months):
        num_transactions = random.randint(3, 8)
        for _ in range(num_transactions):
            txn_template = random.choice(mock_transactions)
            transaction_date = start_date + timedelta(days=month * 30 + random.randint(0, 29))

            transactions.append({
                "id": f"txn_{len(transactions):04d}",
                "date": transaction_date.isoformat(),
                "merchant": txn_template["merchant"],
                "category": txn_template["category"],
                "items": txn_template["items"],
                "amount": round(random.uniform(*txn_template["amount_range"]), 2),
                "description": f"{txn_template['items'][0]} at {txn_template['merchant']}"
            })

    return sorted(transactions, key=lambda x: x["date"], reverse=True)


async def get_spending_summary(user_id: str) -> Dict:
    transactions = await get_medical_transactions(user_id, months=12)
    categories = await categorize_medical_spending(transactions)

    total_spending = sum(txn["amount"] for txn in transactions)
    monthly_average = total_spending / 12

    most_expensive = max(categories.items(), key=lambda x: x[1]["total"])

    mid_date = datetime.now() - timedelta(days=180)
    recent_spending = sum(txn["amount"] for txn in transactions if datetime.fromisoformat(txn["date"]) > mid_date)
    old_spending = total_spending - recent_spending
    trend = "increasing" if recent_spending > old_spending else "decreasing"

    return {
        "total_spending_12_months": round(total_spending, 2),
        "monthly_average": round(monthly_average, 2),
        "transaction_count": len(transactions),
        "spending_trend": trend,
        "categories": categories,
        "highest_expense_category": {
            "name": most_expensive[0],
            "total": round(most_expensive[1]["total"], 2),
            "percentage": round((most_expensive[1]["total"] / total_spending * 100) if total_spending > 0 else 0, 1)
        },
        "recent_transactions": transactions[:5]
    }
