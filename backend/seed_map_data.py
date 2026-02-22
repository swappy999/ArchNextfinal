import asyncio
import sys
import os
import random

# Ensure project root is in path
sys.path.append(os.getcwd())

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def seed_map_data():
    print("Connecting to database...")
    client = AsyncIOMotorClient(settings.MONGO_URI, tlsAllowInvalidCertificates=True)
    db = client.archnext
    property_collection = db.properties
    
    print("Clearing properties collection...")
    await property_collection.delete_many({})
    
    # Mumbai center coordinates
    center_lng, center_lat = 72.877, 19.076
    
    properties = []
    
    # Seed 50 properties around Mumbai
    for i in range(50):
        # Random offset within ~10km
        lng_offset = random.uniform(-0.05, 0.05)
        lat_offset = random.uniform(-0.05, 0.05)
        
        price = random.randint(100000, 2000000)
        
        prop = {
            "title": f"Mumbai Property {i+1}",
            "description": f"Luxury property in zone {i % 5}",
            "price": float(price),
            "location": {
                "type": "Point",
                "coordinates": [center_lng + lng_offset, center_lat + lat_offset]
            },
            "owner_id": "system_seeder"
        }
        properties.append(prop)
    
    print(f"Inserting {len(properties)} properties...")
    await property_collection.insert_many(properties)
    
    # Create 2dsphere index if it doesn't exist
    print("Ensuring spatial index...")
    await property_collection.create_index([("location", "2dsphere")])
    
    print("Seeding complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_map_data())
