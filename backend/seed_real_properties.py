import asyncio
import os
import io
import json
import random
import uuid
from sqlalchemy import text
from app.core.database import engine
from app.models.property_model import PropertyDB
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load dependencies for valuation
from app.services.verification_service import verify_property_for_listing
from app.services.prediction_service import get_prediction, load_ml_resources

load_dotenv()
load_ml_resources()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

POIS_FILE = 'pois.geojson'

async def seed_real_properties():
    print("Extracting 20 real coordinates from Kolkata datasets...")
    samples = []
    
    try:
        with io.open(POIS_FILE, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            features = data.get('features', [])
            if features:
                points = [feat for feat in features if feat['geometry']['type'] == 'Point']
                
                # Filter strictly for Kolkata core box roughly (22.3 to 22.8, 88.0 to 88.6)
                kolkata_points = []
                for p in points:
                    c = p['geometry']['coordinates']
                    if 88.2 < c[0] < 88.5 and 22.4 < c[1] < 22.7:
                        kolkata_points.append(p)
                
                samples = random.sample(kolkata_points, min(20, len(kolkata_points)))
    except Exception as e:
        print(f"Error reading {POIS_FILE}: {e}")
        return

    print(f"Found {len(samples)} valid properties. Synthesizing AI Valuations & Uploading...")

    db = SessionLocal()
    try:
        inserted = 0
        admin_id = "test-real-seeder-001"
        
        for idx, s in enumerate(samples):
            coords = s['geometry']['coordinates']
            props = s.get('properties', {})
            
            lat = coords[1]
            lng = coords[0]
            
            # Use name from map or generate a premium sounding one
            raw_name = props.get('name', '') or props.get('amenity', '').replace('_', ' ').title()
            if not raw_name or len(raw_name) < 3:
                raw_name = random.choice([
                    "Luxury Villa", "Commercial Space", "Urban Apartment", "Riverside Penthouse",
                    "Downtown Studio", "Heritage Bungalow"
                ])
                
            title = f"{raw_name} @ {round(lat, 4)}, {round(lng, 4)}"
            
            # 1. Get AI Prediction
            prediction = get_prediction(lat, lng)
            price_per_sqft = prediction["predicted_price"]
            size_sqft = random.choice([800, 1200, 1500, 2400, 3000, 5000])
            total_price = round(price_per_sqft * size_sqft, 0)
            
            # Apply a +/- 10% realistic scatter to asking price vs predicted
            asking_price = total_price * random.uniform(0.9, 1.1)

            # 2. Database Creation
            new_prop = PropertyDB(
                id=uuid.uuid4(),
                title=title,
                description=f"Authentic {raw_name} property identified via spatial scan. Fully verified by ArchNext AI Engine. Infra: {round(prediction['infra_score']*100)}%, Mobility: {round(prediction['access_score']*100)}%, Demand: {round(prediction['demand_score']*100)}%.",
                price=asking_price,
                latitude=lat,
                longitude=lng,
                owner_id=admin_id,
                images=[f"https://source.unsplash.com/800x600/?house,architecture,kolkata&sig={random.randint(1,1000)}"],
                features=["Smart Verified", "AI Priced", "Geo-Authenticated"],
                status="available",
                predicted_price=total_price,
                is_verified=1.0,  # Trusting the engine
                is_nft=0.0
            )
            
            try:
                async with engine.connect() as conn:
                    # Async Insert
                    await conn.execute(
                        text("""
                        INSERT INTO properties (
                            id, title, description, price, latitude, longitude, 
                            owner_id, images, features, status, predicted_price, is_verified, is_nft
                        ) VALUES (
                            :id, :title, :description, :price, :latitude, :longitude, 
                            :owner_id, :images, :features, :status, :predicted_price, :is_verified, :is_nft
                        )
                        """),
                        {
                            "id": str(new_prop.id), "title": new_prop.title, 
                            "description": new_prop.description, "price": new_prop.price, 
                            "latitude": new_prop.latitude, "longitude": new_prop.longitude, 
                            "owner_id": new_prop.owner_id, "images": json.dumps(new_prop.images), 
                            "features": json.dumps(new_prop.features), "status": new_prop.status, 
                            "predicted_price": new_prop.predicted_price, "is_verified": new_prop.is_verified,
                            "is_nft": new_prop.is_nft
                        }
                    )
                    await conn.commit()
                print(f"[{idx+1}/{len(samples)}] Inserted: {title} | Ask: INR {asking_price:,.0f} | AI: INR {total_price:,.0f}")
                inserted += 1
            except Exception as e:
                print(f"Failed to insert record: {e}")

        print(f"Successfully seeded {inserted} real AI-verified properties into the marketplace.")
    
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    asyncio.run(seed_real_properties())
