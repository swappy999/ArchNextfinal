from app.ai.pipeline.data_enrichment import enrich_property
from app.ai.pipeline.location_scoring import calculate_location_score
from app.ai.pipeline.growth_analysis import growth_trend
from app.ai.intelligence.infrastructure_score import calculate_infrastructure_score
from app.ai.intelligence.urban_growth import calculate_growth_potential
from app.ai.intelligence.investment_score import investment_score
from app.ai.intelligence.heatmap_engine import heatmap_value
from app.ai.intelligence.infrastructure_detection import detect_infrastructure

async def build_features(property_data: dict) -> dict:
    """
    Master pipeline: Transforms raw property data into model-ready features.
    Now includes REAL Urban Intelligence signals via Mapbox POI detection.
    """
    # 1. Enrich with mock signals (market trends, etc.)
    enriched = enrich_property(property_data)
    
    # 2. Score Location (Current Value)
    location_score = calculate_location_score(enriched)
    
    # 3. Analyze Historical Growth
    market_growth_factor = growth_trend([])
    
    # 4. Real Infrastructure Detection via Mapbox POI
    infra_data = {}
    if property_data.get("location", {}).get("coordinates"):
        lng, lat = property_data["location"]["coordinates"]
        infra_data = await detect_infrastructure(lng, lat)
        # Merge real infra data into enriched features
        enriched.update(infra_data)
    
    # 5. Urban Intelligence (Future Value) — now powered by real infra data
    infra_score = calculate_infrastructure_score(enriched)
    growth_potential = calculate_growth_potential(location_score, infra_score)
    inv_score = investment_score(property_data.get("price", 0), growth_potential)
    heatmap_signal = heatmap_value(growth_potential)
    
    return {
        "base_price": property_data.get("price", 0.0),
        "location_score": location_score,
        "market_growth_factor": market_growth_factor,
        "infrastructure_score": infra_score,
        "growth_potential": growth_potential,
        "investment_score": inv_score,
        "heatmap_signal": heatmap_signal,
        "enriched_features": enriched,
        # Expose real infra detection results
        "infra_detection": infra_data
    }
