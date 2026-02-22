from pydantic import BaseModel
from typing import Dict, Optional

class PredictionResult(BaseModel):
    predicted_price: float
    confidence: float
    market_growth_factor: float
    location_score: Optional[float] = None
    infrastructure_score: Optional[float] = None
    growth_potential: Optional[float] = None
    investment_score: Optional[float] = None
    heatmap_signal: Optional[str] = None

class PredictionResponse(BaseModel):
    property_id: str
    current_price: float
    prediction: PredictionResult
    error: Optional[str] = None
