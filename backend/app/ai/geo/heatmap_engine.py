def generate_heatmap(properties: list) -> list:
    """
    Generates weighted heatmap data from property list.
    Weight is normalized price (0.0 - 1.0) for map intensity.
    """
    if not properties:
        return []
    
    max_price = max((p.get("price", 0) for p in properties), default=1)
    if max_price == 0:
        max_price = 1
    
    return [
        {
            "longitude": p["location"]["coordinates"][0],
            "latitude": p["location"]["coordinates"][1],
            "weight": round(p.get("price", 0) / max_price, 4),
            "raw_price": p.get("price", 0)
        }
        for p in properties
        if p.get("location", {}).get("coordinates")
    ]
