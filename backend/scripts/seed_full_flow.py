import asyncio
import os
import uuid
import random
from datetime import datetime, timedelta
from sqlalchemy import delete
from sqlalchemy.future import select

# Setup path for app imports
import sys
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal, engine
from app.models.property_model import PropertyDB
from app.models.auction_model import AuctionDB, AuctionStatus
from app.core.config import settings

# ── Demo Assets Configuration ───────────────────────────────────────────────
DEMO_PROPERTIES = [
    {
        "title": "Quantum Heights - New Town",
        "description": "Premium AI-optimized residential node in New Town Action Area I. Strategically located near major tech parks with high demand scores. Features integrated smart glass and energy harvesting.",
        "price": 12500000,
        "matic_price": 0.05,
        "lat": 22.5866,
        "lng": 88.4583,
        "tier": "A",
        "is_auction": True
    },
    {
        "title": "Hooghly View Sanctuary",
        "description": "Ultra-elite riverside estate with direct Hooghly frontage. Features high riverside premium scores and historical significance. Part of the ArchNext Platinum Heritage collection.",
        "price": 45000000,
        "matic_price": 0.15,
        "lat": 22.5726,
        "lng": 88.3639,
        "tier": "A",
        "is_auction": False
    },
    {
        "title": "Bidhannagar Digital Hub",
        "description": "Dynamic office space in Salt Lake Sector V. Optimized for high accessibility and central business district proximity. AI growth score of 8.9.",
        "price": 28000000,
        "matic_price": 0.08,
        "lat": 22.5760,
        "lng": 88.4332,
        "tier": "A",
        "is_auction": True
    },
    {
        "title": "Salt Lake Sector II Penthouse",
        "description": "Spacious penthouse in a premium Salt Lake residential block. Quiet surroundings with perfect urban infra scores. Modernist architecture with rooftop garden.",
        "price": 18000000,
        "matic_price": 0.06,
        "lat": 22.5865,
        "lng": 88.4111,
        "tier": "B",
        "is_auction": False
    },
    {
        "title": "Behala Growth Node 01",
        "description": "Industrial-grade asset in Behala south. Part of the emerging supply-chain growth corridor. High ROI prediction from the unified pricing engine.",
        "price": 7500000,
        "matic_price": 0.02,
        "lat": 22.4975,
        "lng": 88.3129,
        "tier": "C",
        "is_auction": True
    }
]

async def seed_demo():
    print("ArchNext: Initializing Full Flow Demo Assets...")
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Clear existing data to ensure a clean demo state
            print("Purging existing assets for demo isolation...")
            await session.execute(delete(AuctionDB))
            await session.execute(delete(PropertyDB))
            
            # 2. Insert Demo Properties
            print(f"Seeding {len(DEMO_PROPERTIES)} verified smart assets...")
            for i, p in enumerate(DEMO_PROPERTIES):
                prop_id = uuid.uuid4()
                
                # Property record
                db_prop = PropertyDB(
                    id=prop_id,
                    title=p["title"],
                    description=p["description"],
                    price=p["price"],
                    latitude=p["lat"],
                    longitude=p["lng"],
                    owner_id="0x6dbf8564F174a7Dda85f9A019446D4c1A90F8e3a", # Mock system admin
                    status="available",
                    is_nft=1.0,
                    nft_token_id=1000 + i,
                    images=[f"https://picsum.photos/seed/archnext_{i}/800/600"],
                    features=["AI-Verified Pricing", "Hooghly Proximity Premium", "Institutional Custody"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # Adding specific price_matic field if your service supports it
                # Based on previous step, we added price_listed_matic logic in marketplace_service
                db_prop.listing_price_matic = p["matic_price"]
                
                session.add(db_prop)
                
                # 3. Create Auction if needed
                if p["is_auction"]:
                    print(f"   Setting up auction for: {p['title']}")
                    db_auction = AuctionDB(
                        id=uuid.uuid4(),
                        property_id=prop_id,
                        seller_id="0x6dbf8564F174a7Dda85f9A019446D4c1A90F8e3a",
                        reserve_price=p["price"] * 0.9, # 10% below market for demo
                        current_bid=p["price"] * 0.92,
                        start_time=datetime.utcnow() - timedelta(hours=1),
                        end_time=datetime.utcnow() + timedelta(days=2),
                        status=AuctionStatus.ACTIVE,
                        bid_count=3,
                        min_bid_increment=p["price"] * 0.01
                    )
                    session.add(db_auction)
                    
            print("DB transaction complete.")
            
        await session.commit()
        
    print("\nDemo Seeding Successful!")
    print(f"Location: Kolkata Urban Corridor")
    print(f"Network: Multi-Layer Intelligence Index")

if __name__ == "__main__":
    asyncio.run(seed_demo())
