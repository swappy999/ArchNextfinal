import asyncio
import sys
import os
from datetime import datetime

# Ensure project root is in path
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal, engine
from app.models.property_model import PropertyDB
from app.models.base import Base

async def seed_market():
    print("Connecting to PostgreSQL to seed market data...")
    
    # Initialize tables just in case
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Initial Core Properties (Kolkata Data)
        properties = [
            {
                "title": "Quantum Heights - New Town",
                "description": "Premium 3BHK flat in the heart of New Town. AI Verified with 92% growth potential.",
                "price": 8500000,
                "latitude": 22.5867,
                "longitude": 88.4750,
                "owner_id": "0x63E12B31306d8B1854930F8b9CAD0e1F2031B6f6", # Admin Wallet
                "status": "listed",
                "is_nft": 1.0,
                "nft_token_id": 101,
                "blockchain_hash": "0xabc123"
            },
            {
                "title": "Hooghly View Residencies",
                "description": "Luxury apartment with Hooghly river view. Located near BBD Bagh.",
                "price": 12500000,
                "latitude": 22.5726,
                "longitude": 88.3639,
                "owner_id": "admin",
                "status": "listed",
                "is_nft": 0.0
            },
            {
                "title": "Salt Lake Sector V Commercial Hub",
                "description": "Office space in the tech park. High growth zone.",
                "price": 45000000,
                "latitude": 22.5735,
                "longitude": 88.4331,
                "owner_id": "admin",
                "status": "auction",
                "is_nft": 1.0,
                "nft_token_id": 102
            }
        ]

        for prop_data in properties:
            # Check if exists by title
            from sqlalchemy import select
            stmt = select(PropertyDB).where(PropertyDB.title == prop_data["title"])
            result = await session.execute(stmt)
            if not result.scalars().first():
                prop = PropertyDB(**prop_data)
                session.add(prop)
                print(f"Added: {prop_data['title']}")
        
        await session.commit()
    print("Market data seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_market())
