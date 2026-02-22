import asyncio
import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

from app.core import database
# We need to manually initialize the client for the script since it's not running via FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def reset_properties():
    print("Connecting to database...")
    # Manually create client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.archnext
    property_collection = db.properties
    
    print("Clearing properties collection...")
    result = await property_collection.delete_many({})
    print(f"Properties collection cleared. Deleted {result.deleted_count} documents.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_properties())
