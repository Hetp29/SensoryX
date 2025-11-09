# SensoryX - AI That Experiences Your Symptoms

## 🧠 What is SensoryX?

SensoryX is the first AI that "feels" your symptoms and matches you with others who experienced the exact same sensations. Describe your symptoms naturally, and SensoryX finds your "symptom twin" - someone who had identical feelings and shows you what happened to them.

## 🎯 Problem We Solve

- 70% of rare diseases take 5+ years to diagnose
- People desperately search forums asking "does anyone else feel this?"
- Current symptom checkers only match generic symptoms, not specific sensations
- Patients can't describe symptoms in medical terms

## 💡 How It Works

1. **Describe naturally**: "Sharp pain behind my left eye when I swallow"
2. **AI vectorizes**: Converts your description into a mathematical "pain signature"
3. **Finds matches**: Searches millions of symptoms for identical sensations
4. **Shows outcomes**: Reveals what conditions your symptom twins had and what helped

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Three.js (3D visualization), Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI/ML**: GPT-4, Gemini API, Vector embeddings
- **Database**: Pinecone (vector search), Snowflake (symptom warehouse)
- **APIs**: Knot (financial correlation), ElevenLabs (voice), Dedalus (analysis)
- **Deployment**: DigitalOcean

## Local Photon Hybrid demo

To demo the Photon hybrid integration locally:

1. Start the backend: `uvicorn app.main:app --reload --port 8000`
2. Start the frontend: `npm run dev` in the `frontend/` folder
3. On the Analyze page, fill in the questionnaire and click "Start Hybrid Session (Photon)". This calls `/api/photon/start` and returns a session id.
4. Use `/api/photon/message` to send messages to the hybrid agent (it proxies to existing services for demo).

Note: This is a lightweight demo to show hybrid session flow. Full iMessage integration and rapid-ai-dev prototyping are out of scope for the hack but are the recommended next steps.

## 🏆 HackPrinceton Tracks

### Main Track
- **Healthcare** - Revolutionizing symptom-based diagnosis

### Special Tracks
1. **Amazon** - Best Practical AI Innovation
2. **Capital One** - Best Financial Hack (medical bankruptcy prevention)
3. **Y Combinator** - YC Challenge
4. **Knot API** - Build on TransactionLink API
5. **Telora** - Startup Track
6. **Photon** - Exploring Hybrid Intelligence
7. **Dedalus Labs** - Best Use of Dedalus
8. **Chestnut Forty** - Best Predictive Intelligence
9. **Gemini API** (MLH)
10. **DigitalOcean Gradient AI** (MLH)
11. **Snowflake API** (MLH)
12. **ElevenLabs** (MLH)

### Automatic Entry
- **Best Overall Hack** - Competing for Amplitude internship

## 👥 Team

- Het Patel
- Jay Vora 

## 🔗 Links

[Devpost] | [GitHub]

---

*"We built an AI that feels what you feel and tells you who else felt it."*