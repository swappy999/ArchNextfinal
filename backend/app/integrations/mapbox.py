import httpx
from app.core.config import settings

MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places"

async def geocode_address(address: str):
    """
    Geocodes an address string to coordinates using Mapbox API.
    Returns: {"longitude": float, "latitude": float} or None
    """
    if not settings.MAPBOX_TOKEN:
        print("Warning: MAPBOX_TOKEN not set.")
        return None
        
    url = f"{MAPBOX_BASE}/{address}.json"
    
    params = {
        "access_token": settings.MAPBOX_TOKEN,
        "limit": 1
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            
        if response.status_code != 200:
            print(f"Mapbox API Error: {response.status_code} {response.text}")
            return None
            
        data = response.json()
        
        if not data.get("features"):
            return None
            
        # Mapbox returns [lng, lat]
        coordinates = data["features"][0]["center"]
        
        return {
            "longitude": coordinates[0],
            "latitude": coordinates[1]
        }
        
    except httpx.RequestError as e:
        print(f"Mapbox Request Error: {e}")
        return None
