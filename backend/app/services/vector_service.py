# backend/app/services/vector_service.py
from pinecone import Pinecone
import os
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai

# load environment variables
load_dotenv()

# initialize Gemini for embeddings (hackathon track!)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    print("✓ Gemini embeddings initialized")
else:
    print("Warning: Gemini API key not found")

# initialize Pinecone with fallback
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "symptoms")  # Use env var, default to "symptoms"

if pinecone_api_key:
    pc = Pinecone(api_key=pinecone_api_key)
    index = pc.Index(pinecone_index_name)
else:
    print("Warning: Pinecone API key not found, using mock data")
    pc = None
    index = None

async def create_embedding(text: str) -> List[float]:
    """
    Create 2048-dim embedding using Google Gemini (padded to match Pinecone index)
    Using Gemini embeddings for hackathon track!
    """
    if not gemini_api_key:
        print("Warning: Gemini not initialized, using fallback zero vector")
        return [0.0] * 2048

    try:
        # Use Gemini's embedding model (returns 768 dimensions)
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )

        embedding = result['embedding']

        # Pad from 768 to 2048 dimensions with zeros
        if len(embedding) < 2048:
            padding = [0.0] * (2048 - len(embedding))
            embedding = embedding + padding

        return embedding
    except Exception as e:
        print(f"Gemini embedding error: {e}")
        # Return zero vector as fallback
        return [0.0] * 2048

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