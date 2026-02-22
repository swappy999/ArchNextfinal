def enrich_property(property_data: dict) -> dict:
    """
    Enriches property data with external signals (mocked).
    In a real app, this would call Google Places, Walking Score, etc.
    """
    enriched_data = property_data.copy()
    
    # Mock Enrichment
    # Pretend we found a metro station nearby
    enriched_data["nearby_metro"] = True
    
    # Pretend we found high infrastructure growth
    enriched_data["infra_growth_score"] = 0.8
    
    # Adjacency to tech hubs (0-1 score)
    enriched_data["tech_hub_score"] = 0.7
    
    return enriched_data
