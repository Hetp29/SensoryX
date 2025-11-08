# backend/app/services/ai-service.py
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai
import json

load_dotenv()

# Initialize AI clients
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

openai_client = None
gemini_model = None

if openai_api_key:
    openai_client = OpenAI(api_key=openai_api_key)

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-pro')


async def analyze_symptoms_with_gpt(
    symptom_description: str,
    patient_data: Optional[Dict] = None
) -> Dict:
    if not openai_client:
        return generate_fallback_analysis(symptom_description)

    # Build context from patient data
    patient_context = ""
    if patient_data:
        age = patient_data.get('age', 'unknown')
        gender = patient_data.get('gender', 'unknown')
        conditions = patient_data.get('preexistingConditions', '')
        medications = patient_data.get('medications', '')
        allergies = patient_data.get('allergies', '')

        patient_context = f"""
Patient Context:
- Age: {age}
- Gender: {gender}
- Pre-existing conditions: {conditions if conditions else 'None'}
- Current medications: {medications if medications else 'None'}
- Allergies: {allergies if allergies else 'None'}
"""

    prompt = f"""You are a medical AI assistant helping analyze symptoms. Based on the symptom description and patient context, provide a structured analysis.

{patient_context}

Symptom Description:
{symptom_description}

Provide a JSON response with the following structure:
{{
  "conditions": [
    {{
      "name": "Condition name",
      "probability": 0.85,
      "reasoning": "Brief explanation why this is likely",
      "severity": "mild|moderate|severe"
    }}
  ],
  "urgency_level": "low|medium|high|emergency",
  "urgency_reasoning": "Why this urgency level",
  "recommendations": [
    {{
      "type": "immediate|consult|lifestyle|monitor",
      "action": "Specific recommendation",
      "priority": "high|medium|low"
    }}
  ],
  "red_flags": ["Any concerning symptoms that need immediate attention"],
  "summary": "Brief overall assessment"
}}

Provide exactly 3 most likely conditions, ordered by probability. Be cautious and responsible - suggest medical consultation when appropriate.
"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant. Provide accurate, cautious medical insights. Always recommend professional consultation for serious symptoms."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent medical advice
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return result

    except Exception as e:
        print(f"GPT-4 analysis error: {e}")
        return generate_fallback_analysis(symptom_description)


async def analyze_symptoms_with_gemini(
    symptom_description: str,
    patient_data: Optional[Dict] = None
) -> Dict:
    """
    Use Google Gemini to analyze symptoms (primary AI for hackathon)
    """
    if not gemini_model:
        return generate_fallback_analysis(symptom_description)

    # Build comprehensive patient context
    patient_context = ""
    if patient_data:
        age = patient_data.get('age', 'unknown')
        gender = patient_data.get('gender', 'unknown')
        conditions = patient_data.get('preexistingConditions', '')
        medications = patient_data.get('medications', '')
        allergies = patient_data.get('allergies', '')

        patient_context = f"""
Patient Context:
- Age: {age}
- Gender: {gender}
- Pre-existing conditions: {conditions if conditions else 'None'}
- Current medications: {medications if medications else 'None'}
- Allergies: {allergies if allergies else 'None'}
"""

    prompt = f"""You are a medical AI assistant. Analyze the following symptoms and provide a detailed assessment.

{patient_context}

Symptom Description:
{symptom_description}

Provide your response in the following JSON format:
{{
  "conditions": [
    {{
      "name": "Condition name",
      "probability": 0.85,
      "reasoning": "Brief explanation why this is likely",
      "severity": "mild|moderate|severe"
    }},
    // Include exactly 3 conditions
  ],
  "urgency_level": "low|medium|high|emergency",
  "urgency_reasoning": "Explanation for the urgency level",
  "recommendations": [
    {{
      "type": "immediate|consult|lifestyle|monitor",
      "action": "Specific actionable recommendation",
      "priority": "high|medium|low"
    }},
    // Include exactly 4 recommendations
  ],
  "red_flags": ["Any concerning symptoms requiring immediate attention"],
  "summary": "Overall assessment and key takeaways"
}}

Important:
- Provide exactly 3 conditions ordered by probability
- Include 4 actionable recommendations
- Be cautious and recommend professional medical consultation when appropriate
- Consider the patient's context in your analysis
- Return ONLY valid JSON, no additional text"""

    try:
        response = gemini_model.generate_content(prompt)
        text = response.text

        # Clean up the response - remove markdown code blocks if present
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Try to extract JSON from response
        if "{" in text:
            json_start = text.index("{")
            json_end = text.rindex("}") + 1
            json_str = text[json_start:json_end]
            result = json.loads(json_str)

            # Validate structure
            if "conditions" in result and "recommendations" in result:
                return result
            else:
                print("Gemini response missing required fields")
                return generate_fallback_analysis(symptom_description)
        else:
            print("No JSON found in Gemini response")
            return generate_fallback_analysis(symptom_description)

    except json.JSONDecodeError as e:
        print(f"Gemini JSON parse error: {e}")
        return generate_fallback_analysis(symptom_description)
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return generate_fallback_analysis(symptom_description)


def generate_fallback_analysis(symptom_description: str) -> Dict:
    """
    Generate a basic analysis when AI services are unavailable
    """
    return {
        "conditions": [
            {
                "name": "Consultation Recommended",
                "probability": 0.75,
                "reasoning": "Based on your symptoms, a medical professional should evaluate your condition",
                "severity": "moderate"
            },
            {
                "name": "Common Inflammatory Response",
                "probability": 0.60,
                "reasoning": "Symptoms may indicate an inflammatory condition",
                "severity": "mild"
            },
            {
                "name": "Stress-Related Symptoms",
                "probability": 0.45,
                "reasoning": "Symptoms could be stress or lifestyle related",
                "severity": "mild"
            }
        ],
        "urgency_level": "medium",
        "urgency_reasoning": "Symptoms warrant medical consultation within 24-48 hours",
        "recommendations": [
            {
                "type": "consult",
                "action": "Schedule appointment with primary care physician",
                "priority": "high"
            },
            {
                "type": "monitor",
                "action": "Track symptom progression and any changes",
                "priority": "high"
            },
            {
                "type": "lifestyle",
                "action": "Maintain adequate hydration and rest",
                "priority": "medium"
            },
            {
                "type": "immediate",
                "action": "Seek emergency care if symptoms worsen rapidly",
                "priority": "medium"
            }
        ],
        "red_flags": [
            "Sudden worsening of symptoms",
            "Difficulty breathing",
            "Severe pain",
            "Loss of consciousness"
        ],
        "summary": "Your symptoms should be evaluated by a healthcare professional. Monitor closely and seek immediate care if condition worsens."
    }


async def analyze_symptoms(
    symptom_description: str,
    patient_data: Optional[Dict] = None,
    use_gpt: bool = False
) -> Dict:
    """
    Main entry point for symptom analysis.
    Uses Google Gemini by default (hackathon track), GPT-4 as fallback
    """
    if use_gpt and openai_client:
        return await analyze_symptoms_with_gpt(symptom_description, patient_data)
    elif gemini_model:
        return await analyze_symptoms_with_gemini(symptom_description, patient_data)
    elif openai_client:
        return await analyze_symptoms_with_gpt(symptom_description, patient_data)
    else:
        return generate_fallback_analysis(symptom_description)


async def generate_recommendations(
    conditions: List[Dict],
    patient_data: Optional[Dict] = None
) -> List[Dict]:
    """
    Generate personalized recommendations based on predicted conditions
    """
    recommendations = []

    # Determine urgency from conditions
    has_severe = any(c.get('severity') == 'severe' for c in conditions)
    high_probability = any(c.get('probability', 0) > 0.7 for c in conditions)

    if has_severe or high_probability:
        recommendations.append({
            "type": "immediate",
            "action": "Consult a healthcare provider within 24 hours",
            "priority": "high",
            "icon": "alert-circle"
        })

    recommendations.append({
        "type": "consult",
        "action": "Schedule comprehensive evaluation with specialist",
        "priority": "high",
        "icon": "user-doctor"
    })

    # Lifestyle recommendations
    recommendations.append({
        "type": "lifestyle",
        "action": "Maintain symptom diary to track patterns and triggers",
        "priority": "medium",
        "icon": "book-open"
    })

    # Monitoring
    recommendations.append({
        "type": "monitor",
        "action": "Watch for worsening symptoms or new developments",
        "priority": "medium",
        "icon": "activity"
    })

    return recommendations


async def analyze_medical_image(
    base64_image: str,
    image_type: str = "image/jpeg"
) -> Dict:
    """
    Analyze medical images (rashes, wounds, etc.) using Gemini Vision (hackathon track)
    """
    import base64 as b64

    if not gemini_model:
        return {
            "description": "Image analysis unavailable - Gemini not configured",
            "observations": [],
            "recommendation": "Please consult a healthcare provider with your image"
        }

    try:
        # Gemini Vision requires PIL Image
        import io
        from PIL import Image

        # Decode base64 image
        image_bytes = b64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """You are a medical image analysis assistant. Analyze this image and describe what you observe.

Provide objective observations only, NOT diagnoses. Describe:
- Visual characteristics (color, texture, size, location)
- Any notable features or patterns
- Severity indicators if applicable

Return your response in JSON format:
{
  "description": "Overall description of what you see",
  "observations": ["observation 1", "observation 2", "..."],
  "severity_indicators": ["any concerning features"],
  "recommendation": "Recommendation for next steps"
}

Be cautious and recommend professional medical consultation when appropriate.
Return ONLY valid JSON."""

        # Use Gemini with vision
        response = gemini_model.generate_content([prompt, image])
        text = response.text

        # Clean up response
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Try to parse JSON
        if "{" in text:
            json_start = text.index("{")
            json_end = text.rindex("}") + 1
            result = json.loads(text[json_start:json_end])
            return result
        else:
            # Fallback: return as description
            return {
                "description": text,
                "observations": [],
                "recommendation": "Consult healthcare provider for professional evaluation"
            }

    except Exception as e:
        print(f"Gemini image analysis error: {e}")
        return {
            "description": "Image analysis failed",
            "observations": [str(e)],
            "recommendation": "Please consult a healthcare provider with your image"
        }
