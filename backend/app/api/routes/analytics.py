from fastapi import APIRouter
from app.services.analytics_service import (
    get_trending_zones,
    get_hot_investment_areas,
    get_city_growth_map
)

router = APIRouter(prefix="/analytics", tags=["Market Analytics"])

@router.get("/trending")
async def trending_zones(top_n: int = 5):
    """
    Returns the top N trending geographic zones.
    Ranked by price growth signal — zones with highest activity.
    """
    return await get_trending_zones(top_n)

@router.get("/hot-zones")
async def hot_investment_zones(top_n: int = 5):
    """
    Returns the best investment opportunities:
    Zones with high growth signal + prices below market average.
    Each zone has an opportunity_score and BUY recommendation.
    """
    return await get_hot_investment_areas(top_n)

@router.get("/city-map")
async def city_growth_map():
    """
    Full city-wide heatmap with zone growth tiers.
    Returns lat/lng/weight/tier for every active zone.
    Use this to render zone overlays on the frontend map.
    """
    return await get_city_growth_map()
