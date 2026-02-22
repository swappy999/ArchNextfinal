from app.ai.geo.spatial_queries import get_properties_in_radius
from app.ai.geo.clustering_engine import cluster_properties
from app.ai.geo.zone_scoring import calculate_zone_score
from app.ai.geo.heatmap_generator import generate_heatmap

async def geo_intelligence(longitude: float, latitude: float, radius: int = 3000):
    """
    Orchestrates the Geo Intelligence Analysis.
    1. Finds properties in radius (Default 3km).
    2. Clusters them.
    3. Calculates Area Zone Score.
    4. Generates Heatmap Data.
    """
    # 1. Spatial Query
    properties = await get_properties_in_radius(longitude, latitude, radius)
    
    # 2. Analytics
    clusters = cluster_properties(properties)
    zone_score = calculate_zone_score(properties)
    heatmap_data = generate_heatmap(properties)
    
    return {
        "center": {"longitude": longitude, "latitude": latitude},
        "radius_meters": radius,
        "property_count": len(properties),
        "zone_score": zone_score,
        "cluster_count": len(clusters),
        "clusters": clusters,
        "heatmap_points": heatmap_data
    }
