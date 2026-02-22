import random

import random

def predict_price(features: dict) -> dict:
    """
    Predicts price based on engineered features.
    Also returns Urban Intelligence metrics.
    """
    base = features["base_price"]
    loc_score = features["location_score"]
    market_growth = features["market_growth_factor"]
    
    # Use Growth Potential from Urban Intelligence for price projection too?
    # For now, let's stick to the base model + market growth, 
    # but maybe boost it slightly by growth_potential
    growth_potential = features["growth_potential"]
    
    # Model Logic:
    loc_multiplier = 1 + ((loc_score - 5) * 0.05)
    
    # Future Growth Impact:
    future_multiplier = 1 + (growth_potential * 0.1) # 10% impact of future potential on current price?
    
    # Final Calculation
    predicted = base * loc_multiplier * market_growth * future_multiplier
    
    confidence = 0.85 + (random.uniform(-0.05, 0.05))
    
    return {
        "predicted_price": round(predicted, 2),
        "confidence": round(confidence, 2),
        "market_growth_factor": round(market_growth, 2),
        "location_score": round(loc_score, 1),
        # Intelligence Metrics
        "infrastructure_score": features["infrastructure_score"],
        "growth_potential": features["growth_potential"],
        "investment_score": features["investment_score"],
        "heatmap_signal": features["heatmap_signal"]
    }
