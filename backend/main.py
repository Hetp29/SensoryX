from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SensoryX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SensoryX API is running"}

@app.post("/match-symptoms")
async def match_symptoms(symptom: dict):
    # TODO: Implement symptom matching
    return {"status": "success", "matches": []}