def calculate_growth_potential(location_score: float, infra_score: float) -> float:
    """
    Estimates Area Expansion/Growth Potential.
    Returns a score typically between 0.0 and 1.0+
    """
    # Normalize location score (0-10) to 0-1
    norm_loc = location_score / 10.0
    
    # Weighted average: Location (current value) vs Infrastructure (future multiplier)
    # Infra has high impact on *future* growth.
    growth_potential = (norm_loc * 0.4) + (infra_score * 0.6)
    
    return round(growth_potential, 2)
