from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import symptoms, financial, analytics, agents, ai_doctor, doctors, predictions, photon, insights, notifications

app = FastAPI(title="SensoryX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(symptoms.router, prefix="/api", tags=["Symptoms"])
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["symptoms"])
app.include_router(financial.router, prefix="/api/financial", tags=["Financial"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(agents.router, prefix="/api/agents", tags=["Multi-Agent System"])
app.include_router(ai_doctor.router, prefix="/api/ai-doctor", tags=["AI Doctor Consultation"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Human Doctor Discovery"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictive Intelligence"])
app.include_router(photon.router, prefix="/api/photon", tags=["Photon Hybrid Intelligence"])
app.include_router(insights.router, prefix="/api/insights", tags=["Real-Time Insights"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Smart Notifications"])


@app.get("/")
async def root():
    return {"message": "SensoryX backend is live 🚀"}
