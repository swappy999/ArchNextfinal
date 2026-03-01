import asyncio
import json
import random
import uuid
import math
import os
from datetime import datetime
from sqlalchemy import delete
from sqlalchemy.future import select

# Mocking the sys.path to ensure we can import from app
import sys
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal, engine
from app.models.property_model import PropertyDB
from app.core.config import settings

# ── Kolkata Zones & Pricing Strategy ─────────────────────────────────────────
ZONE_CONFIG = {
    "New Town": {"lat": 22.5866, "lng": 88.4583, "multiplier": 1.2, "tier": "Premium"},
    "Salt Lake": {"lat": 22.5865, "lng": 88.4111, "multiplier": 1.15, "tier": "Premium"},
    "Park Street": {"lat": 22.5539, "lng": 88.3512, "multiplier": 1.5, "tier": "Elite"},
    "Rajarhat": {"lat": 22.6247, "lng": 88.5133, "multiplier": 0.95, "tier": "Growth"},
    "Dum Dum": {"lat": 22.6291, "lng": 88.4187, "multiplier": 0.85, "tier": "Standard"},
    "Howrah": {"lat": 22.5958, "lng": 88.3110, "multiplier": 0.8, "tier": "Standard"},
    "Ballygunge": {"lat": 22.5280, "lng": 88.3653, "multiplier": 1.4, "tier": "Elite"},
    "Alipore": {"lat": 22.5312, "lng": 88.3304, "multiplier": 1.6, "tier": "Elite+ Platinum"},
    "Gariahat": {"lat": 22.5186, "lng": 88.3650, "multiplier": 1.25, "tier": "Premium"},
    "Behala": {"lat": 22.4975, "lng": 88.3129, "multiplier": 0.85, "tier": "Residential"},
    "Baranagar": {"lat": 22.6415, "lng": 88.3705, "multiplier": 0.8, "tier": "Standard"},
    "Jadavpur": {"lat": 22.4989, "lng": 88.3719, "multiplier": 1.1, "tier": "Tech Hub"},
    "Sector V": {"lat": 22.5760, "lng": 88.4332, "multiplier": 1.35, "tier": "Corporate"},
    "Kalyani": {"lat": 22.9736, "lng": 88.4332, "multiplier": 0.75, "tier": "Academic Growth"},
}

BASE_PRICE = 5000000 # 50 Lakhs base

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def seed_kolkata():
    print("ArchNext: Commencing Kolkata Global Expansion Seeding...")
    
    # 1. Load GeoJSON Data
    geojson_path = "pois.geojson"
    try:
        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading GeoJSON: {e}")
        return

    features = data.get("features", [])
    print(f"Loaded {len(features)} potential POI nodes from GeoJSON.")

    # 2. Extract and Categorize Properties
    seeded_properties = []
    zone_counts = {zone: 0 for zone in ZONE_CONFIG}
    
    # We want ~10 properties per zone (14 zones * 10 = 140)
    TARGET_PER_ZONE = 10
    
    # Randomize feature order to get diverse selection
    random.shuffle(features)

    for feature in features:
        props = feature.get("properties", {})
        geom = feature.get("geometry", {})
        
        if geom.get("type") != "Point":
            continue
            
        lng, lat = geom.get("coordinates")
        name = props.get("name") or props.get("amenity") or props.get("shop") or "Intelligence Node"
        
        # Determine closest zone
        best_zone = None
        min_dist = float('inf')
        
        for zone_name, config in ZONE_CONFIG.items():
            dist = haversine_distance(lat, lng, config["lat"], config["lng"])
            if dist < min_dist:
                min_dist = dist
                best_zone = zone_name
        
        # Only take if it's within 5km of a zone center and we need more in that zone
        if best_zone and min_dist < 5.0 and zone_counts[best_zone] < TARGET_PER_ZONE:
            config = ZONE_CONFIG[best_zone]
            
            # Generate realistic pricing
            price = BASE_PRICE * config["multiplier"] * random.uniform(0.8, 1.5)
            
            # Create Property Data
            p_data = {
                "id": uuid.uuid4(),
                "title": f"{name} {config['tier']}",
                "description": f"High-yield real estate asset located in {best_zone}. Integrated with ArchNext Intelligence Layer. Proximity to major transport nodes and {props.get('amenity', 'urban infrastructure')}.",
                "price": round(price, 0),
                "latitude": lat,
                "longitude": lng,
                "owner_id": "system_admin",
                "status": "available",
                "is_nft": 1.0, # All seeded properties are "ON-CHAIN" for hackathon mode
                "nft_token_id": random.randint(1000, 9999),
                "images": ["https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800"], # Placeholder
                "features": ["AI Valuation", "Smart Contract Verified", "Yield Optimization"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            seeded_properties.append(p_data)
            zone_counts[best_zone] += 1

    print(f"Prepared {len(seeded_properties)} properties for insertion.")

    # 3. Database Operations
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Clear existing data if requested (we'll always clear for this expansion)
            print("Purging old sample data...")
            await session.execute(delete(PropertyDB))
            
            # Bulk Insert
            print("Writing new Kolkata Intelligence Registry...")
            for p_dict in seeded_properties:
                db_prop = PropertyDB(**p_dict)
                session.add(db_prop)
        
        await session.commit()

    print("\nSeeding Complete!")
    print("Zone Distribution:")
    for zone, count in zone_counts.items():
        print(f"   - {zone}: {count} assets")
    print(f"Total Assets: {len(seeded_properties)}")

if __name__ == "__main__":
    asyncio.run(seed_kolkata())
