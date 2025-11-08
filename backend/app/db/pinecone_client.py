# app/db/pinecone_client.py
import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

# Import API key and index name from environment
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "symptoms")

# Initialize Pinecone client safely
if PINECONE_API_KEY:
    pc = Pinecone(api_key=PINECONE_API_KEY)
else:
    print("⚠️ PINECONE_API_KEY not set. Pinecone client will not initialize.")
    pc = None

# Index setup
index_name = PINECONE_INDEX_NAME
index = None

if pc:
    # Check if the index exists
    if index_name not in pc.list_indexes().names():
        print(f"Creating new Pinecone index: {index_name}")
        pc.create_index(
            name=index_name,
            dimension=2048,  # Gemini text-embedding-004 dimension (configurable)
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    else:
        print(f"Using existing Pinecone index: {index_name}")

    # Connect to the index
    index = pc.Index(index_name)
