# backend/app/services/vector_service.py
from pinecone import Pinecone
import os
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI

# load environment variables
load_dotenv()

# initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    openai_client = OpenAI(api_key=openai_api_key)
else:
    print("Warning: OpenAI API key not found")
    openai_client = None

# initialize Pinecone with fallback
pinecone_api_key = os.getenv("PINECONE_API_KEY")
if pinecone_api_key:
    pc = Pinecone(api_key=pinecone_api_key)
    index = pc.Index("sensoryx-index")  # Fixed: match pinecone_client.py index name
else:
    print("Warning: Pinecone API key not found, using mock data")
    pc = None
    index = None

async def create_embedding(text: str) -> List[float]:
    """Create 1536-dim embedding using OpenAI text-embedding-3-small"""
    if not openai_client:
        print("Warning: OpenAI client not initialized, using fallback")
        # Fallback to zeros if OpenAI is unavailable
        return [0.0] * 1536

    try:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        # Return zero vector as fallback
        return [0.0] * 1536

async def upsert_symptom_vector(symptom_id: str, description: str, metadata: Dict):
    """Add a symptom to Pinecone"""
    vector = await create_embedding(description)
    
    index.upsert(vectors=[{
        "id": symptom_id,
        "values": vector,
        "metadata": metadata
    }])
    
    return {"status": "success", "id": symptom_id}

async def query_similar_vectors(symptom: str, top_k: int = 5):
    """Find similar symptoms"""
    query_vector = await create_embedding(symptom)
    
    try:
        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )
        
        matches = []
        for match in results['matches']:
            matches.append({
                "id": match['id'],
                "similarity": match['score'],
                "description": match['metadata'].get('description', ''),
                "condition": match['metadata'].get('condition', 'Unknown'),
                "treatment": match['metadata'].get('treatment', 'Consult doctor'),
                "success_rate": match['metadata'].get('success_rate', 0.0)
            })
        
        return matches
    except Exception as e:
        print(f"Query error: {e}")
        # Return fake data for demo
        return generate_fake_matches()

def generate_fake_matches():
    """Backup fake data for demo"""
    return [
        {
            "id": "match1",
            "similarity": 0.97,
            "description": "Sharp pain behind left eye when swallowing",
            "condition": "Occipital Neuralgia",
            "treatment": "Nerve block injection",
            "success_rate": 0.89
        },
        {
            "id": "match2", 
            "similarity": 0.92,
            "description": "Stabbing sensation behind eye during eating",
            "condition": "Cluster Headache",
            "treatment": "Oxygen therapy",
            "success_rate": 0.75
        }
    ]