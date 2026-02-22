from fastapi import APIRouter
from app.services.smart_map_service import smart_map

router = APIRouter(prefix="/map", tags=["Smart Map"])

@router.get("/smart-map")
async def get_smart_map(
    ne_lng: float,
    ne_lat: float,
    sw_lng: float,
    sw_lat: float
):
    """
    Smart Map endpoint — returns viewport-optimized map data.
    
    Query params:
    - ne_lng, ne_lat: Northeast corner of map viewport
    - sw_lng, sw_lat: Southwest corner of map viewport
    
    Returns:
    - clusters: grouped property markers
    - heatmap: weighted coordinates for heatmap layer
    - zone: AI-powered zone intelligence (score, tier, avg_price)
    """
    return await smart_map(ne_lng, ne_lat, sw_lng, sw_lat)
