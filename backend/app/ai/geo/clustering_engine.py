def cluster_properties(properties: list) -> list:
    """
    Clusters properties by geographic proximity (rounded coordinates).
    Groups nearby markers to prevent frontend overload.
    
    Returns a list of cluster objects with count and centroid.
    Later: replace with DBSCAN / KMeans for production.
    """
    cluster_map = {}
    
    for p in properties:
        lng = p.get("longitude")
        lat = p.get("latitude")
        if lng is None or lat is None:
            continue
        # Round to 2 decimal places (~1km grid)
        key = (round(lng, 2), round(lat, 2))
        cluster_map.setdefault(key, []).append(p)
    
    # Convert to list of cluster objects
    clusters = []
    for (lng, lat), props in cluster_map.items():
        clusters.append({
            "centroid": {"longitude": lng, "latitude": lat},
            "count": len(props),
            "avg_price": round(sum(p.get("price", 0) for p in props) / len(props), 2),
            "properties": [p.get("id", str(p.get("_id", ""))) for p in props]
        })
    
    return clusters
