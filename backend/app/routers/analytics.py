# backend/app/routers/analytics.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from ..db import snowflake_client

router = APIRouter()


@router.get("/health-timeline/{user_id}")
async def get_health_timeline(user_id: str, days: int = 90):
    """
    Get user's health timeline with symptom progression over time
    Uses Snowflake time-series aggregation
    """
    timeline = await snowflake_client.get_user_health_timeline(user_id, days)
    return {
        "user_id": user_id,
        "period_days": days,
        "timeline": timeline,
        "data_points": len(timeline)
    }


@router.get("/spending-analytics/{user_id}")
async def get_spending_analytics(user_id: str, months: int = 12):
    """
    Medical spending analytics by category
    Aggregates financial transactions from Snowflake warehouse
    """
    analytics = await snowflake_client.get_spending_analytics(user_id, months)
    return analytics


@router.get("/condition-insights")
async def get_condition_insights():
    """
    Population-level insights on condition patterns
    Uses Snowflake FLATTEN for VARIANT column analysis
    """
    insights = await snowflake_client.get_condition_insights()
    return {
        "insights": insights,
        "total_conditions": len(insights)
    }


@router.get("/time-travel/{table}")
async def query_time_travel(table: str, timestamp: str):
    """
    Query historical data using Snowflake Time Travel
    Access data as it existed at a specific point in time
    """
    try:
        ts = datetime.fromisoformat(timestamp)
        results = await snowflake_client.query_time_travel(table, ts)
        return {
            "table": table,
            "timestamp": timestamp,
            "results": results,
            "count": len(results)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid timestamp format. Use ISO 8601.")


@router.post("/sync-financial-data/{user_id}")
async def sync_financial_data(user_id: str):
    """
    Batch sync financial transactions to Snowflake
    Fetches from Knot API and loads into warehouse
    """
    from ..services import knot_service

    transactions = await knot_service.get_medical_transactions(user_id, months=12)

    formatted_txns = [
        {
            "id": tx["id"],
            "user_id": user_id,
            "type": "medical",
            "amount": tx["amount"],
            "category": tx["category"],
            "merchant": tx["merchant"],
            "knot_id": tx.get("id"),
            "metadata": tx
        }
        for tx in transactions
    ]

    result = await snowflake_client.batch_insert_financial_transactions(formatted_txns)

    return {
        **result,
        "user_id": user_id,
        "synced_transactions": len(formatted_txns)
    }
