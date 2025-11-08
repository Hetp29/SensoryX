from app.db.pinecone_client import index

def upsert_symptom_vector(id: str, vector: list, metadata: dict):
    """
    Store a symptom vector in Pinecone.
    """
    index.upsert([(id, vector, metadata)])
    return {"status": "success", "id": id}

def query_similar_vectors(vector: list, top_k=5):
    """
    Query Pinecone for similar symptom vectors.
    """
    response = index.query(vector, top_k=top_k, include_metadata=True)
    return response['matches'] if 'matches' in response else []
