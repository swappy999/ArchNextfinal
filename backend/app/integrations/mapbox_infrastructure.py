import httpx
from app.core.config import settings

MAPBOX_SEARCH_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"

async def search_nearby_poi(keyword: str, longitude: float, latitude: float, limit: int = 5) -> dict:
    """
    Searches for nearby Points of Interest (POIs) using Mapbox Geocoding API.
    Returns raw Mapbox response with 'features' list.
    """
    if not settings.MAPBOX_TOKEN:
        # Return empty result if no token configured
        return {"features": []}
        
    url = f"{MAPBOX_SEARCH_URL}/{keyword}.json"
    
    params = {
        "proximity": f"{longitude},{latitude}",
        "access_token": settings.MAPBOX_TOKEN,
        "limit": limit
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            
        if response.status_code != 200:
            return {"features": []}
            
        return response.json()
        
    except httpx.RequestError:
        return {"features": []}
