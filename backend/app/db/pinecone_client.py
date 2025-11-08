# app/db/pinecone_client.py
import os
from pinecone import Pinecone, ServerlessSpec

# Import API key from environment
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Initialize Pinecone client safely
if PINECONE_API_KEY:
    pc = Pinecone(api_key=PINECONE_API_KEY)
else:
    print("⚠️ PINECONE_API_KEY not set. Pinecone client will not initialize.")
    pc = None

# Index setup
index_name = "sensoryx-index"
index = None

if pc:
    # Check if the index exists
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1536,  # your embedding size
            metric="cosine",  # or 'euclidean'
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

    # Connect to the index
    index = pc.Index(index_name)
