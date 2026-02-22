import random

def predict_property_price(features: dict):
    # Simulated AI Model
    # In production, this would load a trained model (e.g., sklearn, PyTorch)
    # or call an external AI service.
    
    base_price = features.get("price", 0.0)
    
    # Random growth factor between 5% and 30%
    growth_factor = random.uniform(1.05, 1.30)
    
    predicted_price = base_price * growth_factor
    
    # Random confidence score
    confidence = random.uniform(0.75, 0.95)
    
    return {
        "predicted_price": round(predicted_price, 2),
        "confidence": round(confidence, 2),
        "growth_factor": round(growth_factor, 2)
    }
