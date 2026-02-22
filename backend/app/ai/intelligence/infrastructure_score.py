def calculate_infrastructure_score(enriched_data: dict) -> float:
    """
    Calculates Infrastructure Score based on real detected infrastructure.
    Accepts both Mapbox-detected keys and legacy mock keys.
    Range: 0.0 to 1.0+
    """
    score = 0.0
    
    # 1. Transport Connectivity (Real Mapbox Detection)
    if enriched_data.get("nearby_metro"):
        score += 0.4
        # Bonus for multiple metro stations nearby
        metro_count = enriched_data.get("metro_count", 0)
        if metro_count > 2:
            score += 0.1
        
    if enriched_data.get("nearby_highway"):  # Legacy / future enrichment
        score += 0.2
        
    # 2. Healthcare Access (Real Mapbox Detection)
    if enriched_data.get("nearby_hospital"):
        score += 0.15
        
    # 3. Education Access (Real Mapbox Detection)
    if enriched_data.get("nearby_school"):
        score += 0.1
        
    # 4. Economic Hubs (Real Mapbox Detection)
    if enriched_data.get("tech_hub"):
        score += 0.3
    elif enriched_data.get("tech_hub_score", 0) > 0.5:  # Legacy mock key
        score += 0.3
        
    # 5. Commercial Activity (Real Mapbox Detection)
    if enriched_data.get("commercial_center"):
        score += 0.15
        
    # 6. Future Development (Legacy / mock enrichment)
    if enriched_data.get("infra_growth_score", 0) > 0.5:
        score += 0.3
        
    return round(score, 2)
