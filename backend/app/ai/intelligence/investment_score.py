def investment_score(current_price: float, growth_potential: float) -> float:
    """
    Calculates Investment Value Score.
    This is NOT a price prediction, but a "Value for Money" or "ROI Potential" index.
    """
    # Simple logic: If growth potential is high relative to price (normalized), score is high.
    # For now, let's just use growth_potential as a multiplier for ROI.
    # Returns a 0-100 score.
    
    base_score = growth_potential * 100
    
    # Adjust for price point (lower price with high growth = better investment?)
    # For simplicity, stick to growth potential driving the score.
    
    return round(base_score, 1)

def projected_roi(current_price: float, growth_potential: float) -> float:
    """
    Returns projected value after growth.
    """
    multiplier = 1 + growth_potential
    return round(current_price * multiplier, 2)
