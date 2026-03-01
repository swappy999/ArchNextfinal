import os
import joblib
import geopandas as gpd
from shapely.geometry import Point
import numpy as np
import pandas as pd
import warnings
import httpx

# Global variables to hold the loaded data
_wards = None
_saltlake = None
_is_loaded = False

RENDER_API_URL = "https://api-land-price-prediction.onrender.com/predict_point"

# CBD Locations (BBD Bagh, Park Street)
CBD_LOCATIONS = [
    Point(88.3433, 22.5726), # BBD Bagh
    Point(88.3512, 22.5539)  # Park Street
]

def load_ml_resources():
    """
    Loads necessary GeoJSON metadata into memory.
    Core prediction is delegated to the external Render API.
    """
    global _wards, _saltlake, _is_loaded
    if _is_loaded:
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model1_dir = os.path.join(base_dir, "../../model1")

    print("Loading AI metadata resources from model1...")
    
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        # We keep boundaries in EPSG 4326 so we don't need to project points dynamically
        _wards = gpd.read_file(os.path.join(model1_dir, "kolkata_wards.geojson")).to_crs(epsg=4326)
        _saltlake = gpd.read_file(os.path.join(model1_dir, "exportsaltlake.geojson")).to_crs(epsg=4326)
    
    _is_loaded = True
    print("AI metadata resources loaded.")

_prediction_cache = {}

async def get_prediction(lat: float, lng: float) -> dict:
    """
    Delegates prediction to the external Render API and enriches with local metadata.
    Fully asynchronous to allow rapid multi-property prediction on the map.
    """
    if not _is_loaded:
        load_ml_resources()

    cache_key = f"{round(lat, 5)}_{round(lng, 5)}"
    if cache_key in _prediction_cache:
        return _prediction_cache[cache_key]

    # 1. Call External API
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(RENDER_API_URL, json={"lat": lat, "lng": lng})
            resp.raise_for_status()
            api_data = resp.json()
    except Exception as e:
        # print(f"External API Error: {e}") # Silenced to prevent terminal spam during Map sweeps
        # Robust Fallback to a base price if API is down
        api_data = {
            "predicted_price": 7500.0,
            "infra_score": 0.5,
            "access_score": 0.5,
            "demand_score": 0.5,
            "cbd_score": 0.5,
            "river_score": 0.5
        }

    # 2. Local Metadata Enrichment (Wards & Categories)
    point_wgs84 = Point(lng, lat)

    # Use native WGS84 for ultra-fast spatial joins
    ward_info = _wards[_wards.contains(point_wgs84)]
    ward_name = ward_info.iloc[0]["WARD"].strip() if not ward_info.empty else "Unknown"
    
    # Enrichment Logic
    cbd_score = api_data.get("cbd_score", 0)
    infra = api_data.get("infra_score", 0)
    demand = api_data.get("demand_score", 0)
    
    is_saltlake = not _saltlake[_saltlake.contains(point_wgs84)].empty
    is_newtown = "New Town" in ward_name or (lat > 22.56 and lat < 22.62 and lng > 88.44)
    is_premium_ward = ward_name in ["63", "64", "65", "70", "71", "73", "74", "85", "86", "87", "88"]

    zone_category = "Outer"
    if cbd_score > 0.7: zone_category = "CBD"
    elif is_saltlake or is_newtown or is_premium_ward: zone_category = "Premium"
    elif infra > 0.5 or demand > 0.5: zone_category = "Growth"

    predicted_price_sqft = api_data.get("predicted_price", 7500.0)

    result = {
        "predicted_price": float(predicted_price_sqft),
        "predicted_price_sqm": float(predicted_price_sqft * 10.764),
        "infra_score": float(infra),
        "access_score": float(api_data.get("access_score", 0)),
        "demand_score": float(demand),
        "cbd_score": float(cbd_score),
        "river_score": float(api_data.get("river_score", 0)),
        "ward_name": ward_name,
        "zone_category": zone_category
    }
    
    _prediction_cache[cache_key] = result
    
    # Optional: simplistic eviction to ensure it doesn't leak memory infinitely over months
    if len(_prediction_cache) > 10000:
        _prediction_cache.clear()
        
    return result

def get_auction_intelligence(prediction: dict) -> dict:
    """
    Starting bid engine and auction risk/competition modeling.
    """
    price = prediction["predicted_price"]
    zone = prediction["zone_category"]
    demand = prediction["demand_score"]
    
    # ── Starting Bid Logic ───────────────────────────────────────────────────
    # High CBD -> 90-95%, Medium -> 85-90%, Outer -> 75-85%
    if zone == "CBD": 
        ratio = 0.92 
    elif zone == "Premium": 
        ratio = 0.88
    elif zone == "Growth": 
        ratio = 0.82
    else: 
        ratio = 0.78

    # Buffer Adjustments
    if zone in ["CBD", "Premium"]: ratio += 0.05
    if zone == "Outer" and demand < 0.2: ratio -= 0.03

    recommended_bid = price * ratio

    # ── Auction Metrics ──────────────────────────────────────────────────────
    competition = "Low"
    if demand > 0.7: competition = "High"
    elif demand > 0.3: competition = "Medium"

    return {
        "recommended_starting_bid": round(recommended_bid, 2),
        "suggested_duration_days": 3 if zone == "CBD" else 5 if zone == "Premium" else 7,
        "competition_level": competition,
        "predicted_closing_range": [round(price * 0.95, 2), round(price * 1.15, 2)],
        "risk_rating": "Low" if prediction["infra_score"] > 0.6 else "Medium"
    }

async def predict_property_service(property_id: str) -> dict:
    """
    Integrated property prediction with full intelligence.
    """
    # In a real scenario, we'd fetch lat/lng from DB for this property_id
    # Mocking a central Kolkata point for now to satisfy existing routes
    return {
        "property_id": property_id,
        "current_price": 5000000.0,
        "prediction": await get_prediction(22.5726, 88.3639) 
    }
