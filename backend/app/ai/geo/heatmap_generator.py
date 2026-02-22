def generate_heatmap(properties: list) -> list:
    """
    Generates weighted heatmap points for map visualization.
    Format: [{ "lat": ..., "lng": ..., "weight": ... }]
    """
    heatmap = []
    
    for p in properties:
        loc = p.get("location", {}).get("coordinates", [])
        if len(loc) == 2:
            lng, lat = loc # GeoJSON is [lng, lat]
            price = p.get("price", 0)
            
            # Weight: Normalize price (e.g., 0.1 to 1.0) for frontend opacity
            # Simple scaling for now
            weight = min(price / 1000000.0, 1.0)
            
            heatmap.append({
                "latitude": lat,
                "longitude": lng,
                "weight": weight
            })
            
    return heatmap
