# backend/app/routers/agents.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services import orchestrator
from ..services import agent_service

router = APIRouter()


class MultiAgentDiagnosisRequest(BaseModel):
    description: str
    patient_data: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = "anonymous"


@router.post("/multi-agent-diagnosis")
async def multi_agent_diagnosis(request: MultiAgentDiagnosisRequest):
    """
    Multi-agent medical diagnosis using Dedalus orchestration

    Process:
    1. Triage agent assesses urgency and routes to specialists
    2. Specialist agents (cardiology, neurology, gastro) provide domain expertise
    3. Financial agent analyzes treatment costs
    4. Coordinator synthesizes all recommendations

    Each agent pulls relevant data from Snowflake warehouse via custom MCP server
    """
    try:
        result = await orchestrator.multi_agent_diagnosis(
            symptom_description=request.description,
            patient_data=request.patient_data,
            user_id=request.user_id
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-agent diagnosis failed: {str(e)}")


@router.get("/agents/specialists")
async def list_specialists():
    """List all available specialist agents"""
    specialists = agent_service.get_all_specialists()

    return {
        "specialists": specialists,
        "count": len(specialists),
        "capabilities": {
            "triage": "Initial assessment and routing",
            "cardiology": "Heart and cardiovascular conditions",
            "neurology": "Brain, nerve, and neurological conditions",
            "gastroenterology": "Digestive system conditions",
            "financial": "Treatment cost analysis and financial risk",
            "coordinator": "Synthesis and unified recommendations"
        }
    }


@router.get("/agents/mcp-tools")
async def list_mcp_tools():
    """List all available MCP tools for agents"""
    from ..mcp import medical_mcp_server

    config = medical_mcp_server.get_server_config()

    return {
        "mcp_server": config["name"],
        "version": config["version"],
        "tools": config["tools"],
        "tool_count": len(config["tools"])
    }


@router.post("/agents/test-tool")
async def test_mcp_tool(tool_name: str, arguments: Dict[str, Any]):
    """Test individual MCP tool"""
    from ..mcp import medical_mcp_server

    try:
        result = await medical_mcp_server.execute_tool(tool_name, arguments)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")
