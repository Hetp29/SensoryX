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
