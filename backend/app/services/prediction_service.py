from app.repository.property_repo import get_property_by_id
from app.ai.pipeline.feature_engine import build_features
from app.ai.models.price_model import predict_price

async def predict_property_service(property_id: str):
    # 1. Fetch Data
    property_data = await get_property_by_id(property_id)
    
    if not property_data:
        return {"error": "Property not found"}
        
    # 2. Build Features (Pipeline) — now async with real Mapbox infra detection
    features = await build_features(property_data)
    
    # 3. Predict (Model)
    prediction_result = predict_price(features)
    
    # 4. Construct Response
    return {
        "property_id": property_id,
        "current_price": features["base_price"],
        "prediction": prediction_result
    }
