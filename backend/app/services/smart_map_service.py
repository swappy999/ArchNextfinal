from app.ai.geo.viewport_query import get_properties_in_viewport
from app.ai.geo.clustering_engine import cluster_properties
from app.ai.geo.heatmap_engine import generate_heatmap
from app.ai.geo.zone_ai import zone_summary
import random
import math

def generate_smart_zones(props, ne_lng, ne_lat, sw_lng, sw_lat):
    """
    Generate synthetic smart zone polygons for the intelligence map.
    In production, these would come from geospatial analysis.
    """
    if not props:
        return []

    # Create zone grid cells within viewport
    lng_range = ne_lng - sw_lng
    lat_range = ne_lat - sw_lat
    cell_size = 0.02  # ~2km grid for clearer zones

    zones = []
    zone_id = 0

    for lng_start in [sw_lng + i * cell_size for i in range(int(lng_range / cell_size) + 1)]:
        for lat_start in [sw_lat + i * cell_size for i in range(int(lat_range / cell_size) + 1)]:
            # Count properties in this cell
            count = sum(
                1 for p in props
                if lng_start <= p.get("longitude", 0) < lng_start + cell_size
                and lat_start <= p.get("latitude", 0) < lat_start + cell_size
            )
            if count < 1:  # Show zones even for single nodes in mock data
                continue

            growth = min(100, count * 12 + random.randint(5, 25))
            prediction = round(0.4 + (count / max(len(props), 1)) * 0.6, 2)

            zones.append({
                "id": zone_id,
                "name": f"Zone-{zone_id:03d}",
                "polygon": [
                    [lng_start, lat_start],
                    [lng_start + cell_size, lat_start],
                    [lng_start + cell_size, lat_start + cell_size],
                    [lng_start, lat_start + cell_size],
                    [lng_start, lat_start],
                ],
                "count": count,
                "growth_score": growth,
                "prediction": prediction,
                "tier": "premium" if growth > 70 else "high" if growth > 40 else "standard",
                "elevation": growth * 3,
            })
            zone_id += 1

    return zones[:50]  # Cap at 50 zones for performance


def generate_pulse_points(props):
    """
    Identify high-growth hotspots for the animated pulse effect.
    """
    if not props or len(props) < 5:
        return []

    # Use clustering centroids for pulse points
    clusters = cluster_properties(props)
    pulse_points = []

    for c in clusters:
        if c.get("count", 0) >= 1: # Pulse for every cluster in mock mode
            pulse_points.append({
                "longitude": c["centroid"]["longitude"],
                "latitude": c["centroid"]["latitude"],
                "intensity": min(1.0, c["count"] / 20),
                "radius": 200 + c["count"] * 50,
            })

    return pulse_points[:20]  # Cap at 20 pulses


async def smart_map(ne_lng: float, ne_lat: float, sw_lng: float, sw_lat: float) -> dict:
    """
    Smart Map Engine: Returns optimized map payload for a given viewport.

    - Only loads properties visible in the current map view (viewport-based)
    - Clusters nearby markers to prevent frontend overload
    - Generates normalized heatmap weights for heatmap layer
    - Computes zone-level AI growth score and tier
    - Returns smart zone polygons for 3D extrusion
    - Returns pulse points for animated urban growth effect
    """
    # 1. Fetch only properties inside viewport
    props = await get_properties_in_viewport(ne_lng, ne_lat, sw_lng, sw_lat)

    # 2. Cluster markers by proximity (~1km grid)
    clusters = cluster_properties(props)

    # 3. Generate heatmap weights (normalized price)
    heatmap = generate_heatmap(props)

    # 4. Zone-level AI intelligence
    zone = zone_summary(props)

    # 5. Smart zone polygons for deck.gl PolygonLayer
    zones = generate_smart_zones(props, ne_lng, ne_lat, sw_lng, sw_lat)

    # 6. Pulse points for animated urban growth effect
    pulse_points = generate_pulse_points(props)

    print(f"[SmartMap] Bounds: {sw_lat},{sw_lng} to {ne_lat},{ne_lng} | Props found: {len(props)} | Zones: {len(zones)} | Clusters: {len(clusters)}")

    return {
        "property_count": len(props),
        "clusters": clusters,
        "heatmap": heatmap,
        "zone": zone,
        "zones": zones,
        "pulse_points": pulse_points,
    }
