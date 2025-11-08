# backend/app/services/dedalus_orchestrator.py
import os
from typing import Dict, List, Any
from dotenv import load_dotenv
from dedalus_labs import Dedalus
from .agent_service import AGENT_PROMPTS
from ..mcp import medical_mcp_server

load_dotenv()

DEDALUS_API_KEY = os.getenv("DEDALUS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class DedalusOrchestrator:
    def __init__(self):
        self.client = Dedalus(api_key=DEDALUS_API_KEY) if DEDALUS_API_KEY else None
        self.mcp_server = medical_mcp_server

    async def multi_agent_diagnosis(
        self,
        symptom_description: str,
        patient_data: Dict[str, Any] = None,
        user_id: str = "anonymous"
    ) -> Dict[str, Any]:
        """
        Multi-agent diagnostic process:
        1. Triage agent assesses urgency and routes to specialists
        2. Relevant specialists analyze using domain expertise
        3. Financial agent assesses cost implications
        4. Coordinator synthesizes all recommendations
        """

        patient_context = f"""
Patient Symptoms: {symptom_description}

Patient Data: {patient_data if patient_data else 'No additional data provided'}
User ID: {user_id}
        """

        # Phase 1: Triage Assessment
        triage_result = await self._run_agent("triage", patient_context, [
            {"tool": "search_symptoms", "args": {"query": symptom_description, "top_k": 10, "specialty": "all"}},
            {"tool": "get_patient_timeline", "args": {"user_id": user_id, "days": 90}} if user_id != "anonymous" else None
        ])

        # Phase 2: Specialist Consultations (parallel)
        recommended_specialties = self._extract_specialties(triage_result)

        specialist_results = {}
        for specialty in recommended_specialties:
            if specialty in ["cardiology", "neurology", "gastroenterology"]:
                specialist_results[specialty] = await self._run_agent(
                    specialty,
                    f"{patient_context}\n\nTriage Assessment:\n{triage_result}",
                    [{"tool": "search_symptoms", "args": {"query": symptom_description, "top_k": 5, "specialty": specialty}}]
                )

        # Phase 3: Financial Analysis
        financial_context = self._extract_conditions_and_treatments(specialist_results)
        financial_result = await self._run_agent(
            "financial",
            f"{patient_context}\n\nProposed Diagnoses:\n{financial_context}",
            [
                {"tool": "analyze_treatment_cost", "args": cond}
                for cond in financial_context.get("conditions", [])[:3]
            ]
        )

        # Phase 4: Coordinator Synthesis
        all_assessments = {
            "triage": triage_result,
            "specialists": specialist_results,
            "financial": financial_result
        }

        final_diagnosis = await self._run_agent(
            "coordinator",
            f"{patient_context}\n\nAll Specialist Assessments:\n{self._format_assessments(all_assessments)}",
            []
        )

        return {
            "patient_symptoms": symptom_description,
            "triage_assessment": triage_result,
            "specialist_consultations": specialist_results,
            "financial_analysis": financial_result,
            "final_diagnosis": final_diagnosis,
            "multi_agent_process": {
                "triage_completed": True,
                "specialists_consulted": list(specialist_results.keys()),
                "financial_assessed": True,
                "coordinated": True
            }
        }

    async def _run_agent(self, agent_type: str, context: str, tools_to_use: List[Dict] = None) -> Dict:
        """Run a single specialist agent with MCP tool access"""

        if not self.client:
            return await self._mock_agent_response(agent_type, context)

        system_prompt = AGENT_PROMPTS.get(agent_type, "You are a medical AI assistant.")

        # Execute MCP tools first to get domain data
        tool_results = []
        if tools_to_use:
            for tool_call in tools_to_use:
                if tool_call:
                    result = await self.mcp_server.execute_tool(
                        tool_call["tool"],
                        tool_call["args"]
                    )
                    tool_results.append({
                        "tool": tool_call["tool"],
                        "result": result
                    })

        # Create agent with system prompt + tool data
        enhanced_context = f"""
{context}

Available Medical Data from Database:
{self._format_tool_results(tool_results)}

Based on this data and your {agent_type} expertise, provide your assessment.
        """

        try:
            response = self.client.chat.completions.create(
                model="gemini/gemini-2.0-flash-exp",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": enhanced_context}
                ],
                temperature=0.3,
                max_tokens=1500
            )

            return {
                "agent": agent_type,
                "assessment": response.choices[0].message.content,
                "tools_used": [t["tool"] for t in tool_results],
                "data_sources": len(tool_results)
            }

        except Exception as e:
            return {
                "agent": agent_type,
                "assessment": f"Agent error: {str(e)}",
                "error": True
            }

    async def _mock_agent_response(self, agent_type: str, context: str) -> Dict:
        """Mock response when Dedalus not configured"""
        from ..services import ai_service

        prompt = f"{AGENT_PROMPTS[agent_type]}\n\n{context}"
        mock_response = await ai_service.analyze_symptoms_with_gemini(
            prompt[:500],
            {}
        )

        return {
            "agent": agent_type,
            "assessment": f"Mock {agent_type} assessment (Dedalus not configured)",
            "mock": True
        }

    def _extract_specialties(self, triage_result: Dict) -> List[str]:
        """Extract recommended specialties from triage"""
        assessment = str(triage_result.get("assessment", "")).lower()

        specialties = []
        if any(word in assessment for word in ["heart", "cardiac", "chest"]):
            specialties.append("cardiology")
        if any(word in assessment for word in ["head", "neuro", "brain", "migraine"]):
            specialties.append("neurology")
        if any(word in assessment for word in ["stomach", "abdominal", "digest", "gerd"]):
            specialties.append("gastroenterology")

        return specialties if specialties else ["cardiology", "neurology"]

    def _extract_conditions_and_treatments(self, specialist_results: Dict) -> Dict:
        """Extract conditions from specialist assessments"""
        conditions = []

        for specialty, result in specialist_results.items():
            assessment = result.get("assessment", "")
            if "migraine" in assessment.lower():
                conditions.append({"condition": "Migraine", "treatment": "Triptans medication"})
            elif "gerd" in assessment.lower():
                conditions.append({"condition": "GERD", "treatment": "Proton pump inhibitors"})
            elif "cardiac" in assessment.lower() or "heart" in assessment.lower():
                conditions.append({"condition": "Cardiac Event", "treatment": "Emergency care"})

        return {"conditions": conditions if conditions else [{"condition": "General", "treatment": "Standard care"}]}

    def _format_tool_results(self, tool_results: List[Dict]) -> str:
        """Format tool results for agent context"""
        if not tool_results:
            return "No database queries performed."

        formatted = []
        for tr in tool_results:
            formatted.append(f"\nTool: {tr['tool']}\nResults: {str(tr['result'])[:500]}...")

        return "\n".join(formatted)

    def _format_assessments(self, assessments: Dict) -> str:
        """Format all assessments for coordinator"""
        formatted = []
        for category, data in assessments.items():
            if isinstance(data, dict) and "assessment" in data:
                formatted.append(f"\n{category.upper()}: {data['assessment'][:300]}...")
            elif isinstance(data, dict):
                for spec, result in data.items():
                    if isinstance(result, dict) and "assessment" in result:
                        formatted.append(f"\n{spec.upper()}: {result['assessment'][:300]}...")

        return "\n".join(formatted)


orchestrator = DedalusOrchestrator()
