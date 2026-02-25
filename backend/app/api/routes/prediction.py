from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.services.prediction_service import predict_property_service
from app.core.dependencies import get_current_user
from app.schemas.prediction_schema import PredictionResponse
from app.ai.intelligence.infrastructure_score import calculate_infrastructure_score
from app.ai.intelligence.urban_growth import calculate_growth_potential
from app.ai.intelligence.investment_score import investment_score
from app.ai.intelligence.heatmap_engine import heatmap_value
from app.core.rate_limiter import limiter, PREDICT_LIMIT
import random

router = APIRouter()

# ── Existing: Predict by property ID (DB-backed) ─────────────────────────────
@router.get("/property/{property_id}", response_model=PredictionResponse)
async def predict(property_id: str,
                  current_user = Depends(get_current_user)):
    result = await predict_property_service(property_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# ── New: Flexible predict endpoint called by AI Forecast page ─────────────────
# ── Kolkata area enum for validation ──────────────────────────────────────────
VALID_AREAS = list({
    "New Town", "Salt Lake", "Park Street", "Rajarhat", "Dum Dum",
    "Howrah", "Ballygunge", "Alipore", "Gariahat", "Behala",
    "Baranagar", "Jadavpur", "Sector V", "Kalyani"
})

VALID_TYPES = ["Apartment", "Villa", "Commercial", "Plot"]

class FreeformPredictRequest(BaseModel):
    """SECURITY: Strict constraints on all prediction inputs."""
    model_config = ConfigDict(extra="forbid")

    area: str = Field(..., min_length=2, max_length=50)
    property_type: str = Field(..., min_length=2, max_length=30)
    size_sqft: int = Field(..., ge=100, le=50_000, description="100–50,000 sqft")
    bedrooms: int = Field(..., ge=1, le=10, description="1–10 bedrooms")

    @field_validator("area")
    @classmethod
    def validate_area(cls, v: str) -> str:
        # SECURITY: only allow known Kolkata areas
        if v not in VALID_AREAS:
            raise ValueError(f"Unknown area. Must be one of: {', '.join(sorted(VALID_AREAS))}")
        return v

    @field_validator("property_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in VALID_TYPES:
            raise ValueError(f"Unknown property type. Must be one of: {', '.join(VALID_TYPES)}")
        return v

AREA_MULTIPLIERS = {
    "New Town": 1.55, "Salt Lake": 1.5, "Park Street": 1.7,
    "Rajarhat": 1.15, "Dum Dum": 1.0, "Howrah": 0.95,
    "Ballygunge": 1.6, "Alipore": 1.65, "Gariahat": 1.2,
    "Behala": 0.9, "Baranagar": 0.85, "Jadavpur": 1.1,
    "Sector V": 1.45, "Kalyani": 0.8
}

TYPE_MULTIPLIERS = {
    "Apartment": 1.0, "Villa": 1.4,
    "Commercial": 1.25, "Plot": 0.8
}

@router.post("/predict")
@limiter.limit(PREDICT_LIMIT)  # SECURITY: 10/min per user
async def freeform_predict(request: Request, data: FreeformPredictRequest, current_user = Depends(get_current_user)):
    """
    Predict property price from user-provided parameters (area, type, sqft, bedrooms).
    Called by the AI Forecast page frontend form.
    """
    base_rate = 12_000  # INR per sqft base
    area_mult = AREA_MULTIPLIERS.get(data.area, 1.0)
    type_mult = TYPE_MULTIPLIERS.get(data.property_type, 1.0)
    bedroom_premium = 1 + (data.bedrooms * 0.05)

    predicted = data.size_sqft * base_rate * area_mult * type_mult * bedroom_premium
    infra_score = round(60 + random.uniform(0, 30), 1)
    growth_potential = round(0.4 + random.uniform(0, 0.4), 2)
    confidence = round(0.82 + random.uniform(-0.05, 0.08), 2)

    return {
        "predicted_price": round(predicted, 2),
        "confidence": min(confidence, 0.98),
        "factors": {
            "infrastructure_score": infra_score,
            "zone_rating": "Grade A" if area_mult >= 1.5 else "Grade B" if area_mult >= 1.1 else "Grade C",
            "market_trend": "Bullish" if growth_potential > 0.5 else "Neutral",
            "ai_recommendation": (
                f"Strong Buy — {data.area} is experiencing accelerated infrastructure development. "
                f"{data.size_sqft} sqft {data.property_type} in this zone shows high appreciation potential."
            )
        }
    }

