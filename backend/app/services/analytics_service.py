from app.repository.property_repo import get_all_properties

def _grid_key(prop: dict, grid_size: float = 0.05) -> str:
    """Groups properties into ~5km grid cells by rounding coordinates."""
    coords = prop.get("location", {}).get("coordinates", [0, 0])
    lng = round(coords[0] / grid_size) * grid_size
    lat = round(coords[1] / grid_size) * grid_size
    return f"{lat:.3f},{lng:.3f}"

async def get_trending_zones(top_n: int = 5) -> list:
    """
    Groups all properties into geographic grid cells.
    Ranks zones by average predicted growth %.
    Returns top N trending zones.
    """
    all_props = await get_all_properties()
    if not all_props:
        return []

    # Group by grid cell
    zones: dict = {}
    for prop in all_props:
        key = _grid_key(prop)
        if key not in zones:
            zones[key] = {"grid_key": key, "properties": [], "prices": []}
        zones[key]["properties"].append(prop.get("id") or str(prop.get("_id")))
        zones[key]["prices"].append(prop.get("price", 0))

    # Score each zone
    scored = []
    for key, data in zones.items():
        prices = data["prices"]
        avg_price = sum(prices) / len(prices) if prices else 0
        prop_count = len(prices)
        # Proxy growth signal: more properties + higher variance = more active zone
        if len(prices) > 1:
            price_variance = max(prices) - min(prices)
            growth_signal = round((price_variance / avg_price) * 100, 2) if avg_price else 0
        else:
            growth_signal = 0

        lat, lng = key.split(",")
        scored.append({
            "grid_key": key,
            "center": {"lat": float(lat), "lng": float(lng)},
            "property_count": prop_count,
            "avg_price": round(avg_price, 2),
            "growth_signal": growth_signal,
            "tier": "hot" if growth_signal > 20 else "warm" if growth_signal > 5 else "stable"
        })

    # Sort by growth signal descending
    scored.sort(key=lambda z: z["growth_signal"], reverse=True)
    return scored[:top_n]

async def get_hot_investment_areas(top_n: int = 5) -> list:
    """
    Finds zones with high growth signal but below-average prices.
    These are the best investment opportunities.
    """
    all_props = await get_all_properties()
    if not all_props:
        return []

    all_prices = [p.get("price", 0) for p in all_props if p.get("price")]
    avg_market_price = sum(all_prices) / len(all_prices) if all_prices else 0

    # Group by grid cell
    zones: dict = {}
    for prop in all_props:
        key = _grid_key(prop)
        if key not in zones:
            zones[key] = {"prices": [], "ids": []}
        zones[key]["prices"].append(prop.get("price", 0))
        zones[key]["ids"].append(prop.get("id") or str(prop.get("_id")))

    hot_zones = []
    for key, data in zones.items():
        prices = data["prices"]
        avg_price = sum(prices) / len(prices) if prices else 0
        price_variance = (max(prices) - min(prices)) if len(prices) > 1 else 0
        growth_signal = round((price_variance / avg_price) * 100, 2) if avg_price else 0

        # Hot investment = high growth signal + price below market average
        if growth_signal > 5 and avg_price < avg_market_price:
            lat, lng = key.split(",")
            hot_zones.append({
                "grid_key": key,
                "center": {"lat": float(lat), "lng": float(lng)},
                "property_count": len(prices),
                "avg_price": round(avg_price, 2),
                "market_avg_price": round(avg_market_price, 2),
                "price_discount_pct": round((1 - avg_price / avg_market_price) * 100, 2),
                "growth_signal": growth_signal,
                "opportunity_score": round(growth_signal * (1 - avg_price / avg_market_price), 4),
                "recommendation": "BUY"
            })

    hot_zones.sort(key=lambda z: z["opportunity_score"], reverse=True)
    return hot_zones[:top_n]

async def get_city_growth_map() -> dict:
    """
    Returns a full heatmap of all zones with growth tiers.
    Used by the frontend map to render zone-based overlays.
    """
    all_props = await get_all_properties()
    if not all_props:
        return {"zones": [], "total_zones": 0}

    heatmap_points = []
    zones: dict = {}

    for prop in all_props:
        key = _grid_key(prop)
        if key not in zones:
            zones[key] = {"prices": [], "coords": prop.get("location", {}).get("coordinates", [0, 0])}
        zones[key]["prices"].append(prop.get("price", 0))

    all_prices = [p.get("price", 0) for p in all_props]
    max_price = max(all_prices) if all_prices else 1

    for key, data in zones.items():
        prices = data["prices"]
        avg = sum(prices) / len(prices)
        weight = round(avg / max_price, 4)
        variance = (max(prices) - min(prices)) if len(prices) > 1 else 0
        growth_signal = round((variance / avg) * 100, 2) if avg else 0

        lat, lng = key.split(",")
        heatmap_points.append({
            "lat": float(lat),
            "lng": float(lng),
            "weight": weight,
            "avg_price": round(avg, 2),
            "property_count": len(prices),
            "growth_signal": growth_signal,
            "tier": "hot" if growth_signal > 20 else "warm" if growth_signal > 5 else "stable"
        })

    heatmap_points.sort(key=lambda p: p["weight"], reverse=True)
    return {
        "total_zones": len(heatmap_points),
        "zones": heatmap_points
    }
