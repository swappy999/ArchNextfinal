from app.integrations.mapbox_infrastructure import search_nearby_poi

async def detect_infrastructure(longitude: float, latitude: float) -> dict:
    """
    Automatically detects nearby infrastructure using Mapbox POI search.
    Returns a dict of boolean flags and counts for AI feature pipeline.
    """
    # Parallel POI searches for different infrastructure types
    metro_result = await search_nearby_poi("metro station", longitude, latitude)
    hospital_result = await search_nearby_poi("hospital", longitude, latitude)
    school_result = await search_nearby_poi("school", longitude, latitude)
    tech_result = await search_nearby_poi("tech park", longitude, latitude)
    commercial_result = await search_nearby_poi("shopping mall", longitude, latitude)
    
    return {
        "nearby_metro": len(metro_result.get("features", [])) > 0,
        "nearby_hospital": len(hospital_result.get("features", [])) > 0,
        "nearby_school": len(school_result.get("features", [])) > 0,
        "tech_hub": len(tech_result.get("features", [])) > 0,
        "commercial_center": len(commercial_result.get("features", [])) > 0,
        # Counts for scoring granularity
        "metro_count": len(metro_result.get("features", [])),
        "hospital_count": len(hospital_result.get("features", [])),
        "school_count": len(school_result.get("features", [])),
    }
