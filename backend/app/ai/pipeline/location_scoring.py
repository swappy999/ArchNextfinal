def calculate_location_score(enriched_data: dict) -> float:
    """
    Calculates a location score (0-10) based on enriched features.
    """
    score = 5.0 # Base score
    
    # Metro access boost
    if enriched_data.get("nearby_metro"):
        score += 2.0
        
    # Infrastructure impact
    infra_score = enriched_data.get("infra_growth_score", 0)
    score += (infra_score * 2.0)
    
    # Tech hub proximity
    tech_score = enriched_data.get("tech_hub_score", 0)
    score += (tech_score * 1.5)
    
    # Cap at 10
    return min(score, 10.0)
