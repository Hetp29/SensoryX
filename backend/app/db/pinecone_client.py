import os
import pinecone
from app.utils.config import PINECONE_API_KEY

pinecone.init(api_key=PINECONE_API_KEY, environment="us-east1-gcp")  # change env if needed

INDEX_NAME = "sensoryx-symptoms"

# Check if index exists, else create
if INDEX_NAME not in pinecone.list_indexes():
    pinecone.create_index(INDEX_NAME, dimension=1536)  # 1536 = GPT-3/4 embedding size

index = pinecone.Index(INDEX_NAME)
