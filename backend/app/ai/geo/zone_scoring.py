def calculate_zone_score(properties: list) -> float:
    """
    Calculates an aggregate "Zone Score" for an area based on property values.
    Higher score = More premium/developed area.
    """
    if not properties:
        return 0.0
        
    total_price = sum(p.get("price", 0) for p in properties)
    avg_price = total_price / len(properties)
    
    # Normalize: 100k = score 1. 500k = score 5.
    score = avg_price / 100000.0
    
    return round(score, 2)
