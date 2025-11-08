from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import symptoms

app = FastAPI(title="SensoryX API")

# CORS setup for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(symptoms.router, prefix="/api", tags=["Symptoms"])
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["symptoms"])


@app.get("/")
async def root():
    return {"message": "SensoryX backend is live 🚀"}
