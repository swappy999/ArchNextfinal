def zone_growth_score(properties: list) -> float:
    """
    Calculates a zone-level growth score based on average property price.
    Higher avg price = higher zone score.
    Score is normalized per 100k (e.g., avg 500k → score 5.0)
    """
    if not properties:
        return 0.0
    
    avg_price = sum(p.get("price", 0) for p in properties) / len(properties)
    score = round(avg_price / 100000, 2)
    
    return score

def zone_summary(properties: list) -> dict:
    """
    Returns a full zone intelligence summary.
    """
    if not properties:
        return {"count": 0, "avg_price": 0, "growth_score": 0.0, "tier": "unknown"}
    
    avg_price = sum(p.get("price", 0) for p in properties) / len(properties)
    score = round(avg_price / 100000, 2)
    
    # Tier classification
    if score >= 10:
        tier = "premium"
    elif score >= 5:
        tier = "high"
    elif score >= 2:
        tier = "mid"
    else:
        tier = "affordable"
    
    return {
        "count": len(properties),
        "avg_price": round(avg_price, 2),
        "growth_score": score,
        "tier": tier
    }
