from app.ai.geo.viewport_query import get_properties_in_viewport
from app.ai.geo.clustering_engine import cluster_properties
from app.ai.geo.heatmap_engine import generate_heatmap
from app.ai.geo.zone_ai import zone_summary

async def smart_map(ne_lng: float, ne_lat: float, sw_lng: float, sw_lat: float) -> dict:
    """
    Smart Map Engine: Returns optimized map payload for a given viewport.
    
    - Only loads properties visible in the current map view (viewport-based)
    - Clusters nearby markers to prevent frontend overload
    - Generates normalized heatmap weights for Mapbox heatmap layer
    - Computes zone-level AI growth score and tier
    """
    # 1. Fetch only properties inside viewport
    props = await get_properties_in_viewport(ne_lng, ne_lat, sw_lng, sw_lat)
    
    # 2. Cluster markers by proximity (~1km grid)
    clusters = cluster_properties(props)
    
    # 3. Generate heatmap weights (normalized price)
    heatmap = generate_heatmap(props)
    
    # 4. Zone-level AI intelligence
    zone = zone_summary(props)
    
    return {
        "property_count": len(props),
        "clusters": clusters,
        "heatmap": heatmap,
        "zone": zone
    }
