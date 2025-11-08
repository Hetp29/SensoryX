# backend/app/mcp/medical_server.py
import os
import json
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class MedicalMCPServer:
    """
    Custom MCP server exposing medical data tools to Dedalus agents
    Tools: symptom search, patient timeline, cost analysis, similar cases
    """

    def __init__(self):
        self.name = "sensoryx-medical-mcp"
        self.version = "1.0.0"
        self.tools = self._register_tools()

    def _register_tools(self) -> List[Dict]:
        return [
            {
                "name": "search_symptoms",
                "description": "Search symptom database using semantic similarity. Returns top matching cases with conditions and treatments.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Patient symptom description"
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of results to return",
                            "default": 5
                        },
                        "specialty": {
                            "type": "string",
                            "description": "Medical specialty filter (cardiology, neurology, gastro, etc)",
                            "enum": ["cardiology", "neurology", "gastroenterology", "pulmonology", "all"]
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "get_patient_timeline",
                "description": "Retrieve patient's symptom history and progression over time from warehouse",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string"},
                        "days": {
                            "type": "integer",
                            "description": "Number of days to look back",
                            "default": 90
                        }
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "analyze_treatment_cost",
                "description": "Get cost estimates for treatment options including insurance coverage",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "condition": {"type": "string"},
                        "treatment": {"type": "string"}
                    },
                    "required": ["condition", "treatment"]
                }
            },
            {
                "name": "get_condition_insights",
                "description": "Population-level insights: common symptoms, seasonal trends, treatment outcomes for a condition",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "condition": {
                            "type": "string",
                            "description": "Medical condition name"
                        }
                    },
                    "required": ["condition"]
                }
            },
            {
                "name": "calculate_financial_risk",
                "description": "Assess patient's financial risk and payment options for medical treatment",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "monthly_income": {"type": "number"},
                        "existing_debt": {"type": "number", "default": 0},
                        "treatment_cost": {"type": "number"}
                    },
                    "required": ["monthly_income", "treatment_cost"]
                }
            }
        ]

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        from ..services import vector_service, knot_service
        from ..db import snowflake_client

        if tool_name == "search_symptoms":
            specialty = arguments.get("specialty", "all")
            results = await vector_service.query_similar_vectors(
                symptom=arguments["query"],
                top_k=arguments.get("top_k", 5)
            )

            if specialty != "all":
                specialty_filters = {
                    "cardiology": ["heart", "cardiac", "chest pain", "arrhythmia", "coronary"],
                    "neurology": ["headache", "migraine", "seizure", "numbness", "tremor", "brain"],
                    "gastroenterology": ["stomach", "nausea", "vomiting", "diarrhea", "gerd", "abdominal"],
                    "pulmonology": ["breathing", "cough", "asthma", "lung", "respiratory"]
                }
                keywords = specialty_filters.get(specialty, [])
                results = [r for r in results if any(k in r.get("description", "").lower() or k in r.get("condition", "").lower() for k in keywords)]

            return {"status": "success", "results": results, "count": len(results)}

        elif tool_name == "get_patient_timeline":
            timeline = await snowflake_client.get_user_health_timeline(
                user_id=arguments["user_id"],
                days=arguments.get("days", 90)
            )
            return {"status": "success", "timeline": timeline}

        elif tool_name == "analyze_treatment_cost":
            cost_data = await knot_service.estimate_treatment_cost(
                condition=arguments["condition"],
                treatment=arguments["treatment"]
            )
            return {"status": "success", "cost_analysis": cost_data}

        elif tool_name == "get_condition_insights":
            insights = await snowflake_client.get_condition_insights()
            condition = arguments["condition"].lower()
            filtered = [i for i in insights if condition in str(i).lower()]
            return {"status": "success", "insights": filtered if filtered else insights[:5]}

        elif tool_name == "calculate_financial_risk":
            risk = await knot_service.calculate_financial_risk(
                monthly_income=arguments["monthly_income"],
                existing_medical_debt=arguments.get("existing_debt", 0),
                estimated_treatment_cost=arguments["treatment_cost"]
            )
            return {"status": "success", "risk_assessment": risk}

        return {"status": "error", "message": f"Unknown tool: {tool_name}"}

    def get_server_config(self) -> Dict:
        return {
            "name": self.name,
            "version": self.version,
            "tools": self.tools,
            "description": "Medical data access for SensoryX multi-agent diagnosis system"
        }


medical_mcp_server = MedicalMCPServer()
