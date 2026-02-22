def heatmap_value(growth_potential: float) -> str:
    """
    Classifies area for Heatmap Visualization.
    """
    if growth_potential > 0.7:
        return "high"
    elif growth_potential > 0.4:
        return "medium"
    return "low"
