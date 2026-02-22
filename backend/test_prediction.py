import requests
import time

BASE_URL = "http://127.0.0.1:8014"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def get_auth_token(email, password):
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    data = res.json()
    token = data.get("access_token")
    if not token:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        data = res.json()
        token = data.get("access_token")
    return token

def test_prediction():
    log("Starting AI Prediction Verification...", "START")

    # 1. Setup User
    email = f"pred_user_{int(time.time())}@example.com"
    password = "testpass123"
    token = get_auth_token(email, password)
    
    if not token:
        log("Failed to get token", "FAIL")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Property
    prop_data = {
        "title": "Predictable House",
        "description": "A house to predict",
        "price": 500000.0,
        "latitude": 34.0522,
        "longitude": -118.2437
    }
    res = requests.post(f"{BASE_URL}/properties/", json=prop_data, headers=headers)
    prop_id = res.json().get("id")
    
    if not prop_id:
        log("Failed to create property", "FAIL")
        return
        
    log(f"Created Property: {prop_id}", "PASS")

    # 3. Get Prediction
    log("Requesting AI Prediction...", "STEP")
    res = requests.get(f"{BASE_URL}/prediction/property/{prop_id}", headers=headers)
    
    if res.status_code == 200:
        pred_data = res.json()
        log(f"Prediction Response: {pred_data}", "INFO")
        
        prediction = pred_data.get("prediction")
        if prediction:
            p_price = prediction.get("predicted_price")
            conf = prediction.get("confidence")
            # growth_factor renamed to market_growth_factor
            mgf = prediction.get("market_growth_factor") 
            infra = prediction.get("infrastructure_score")
            growth_pot = prediction.get("growth_potential")
            inv_score = prediction.get("investment_score")
            heatmap = prediction.get("heatmap_signal")
            
            if p_price and conf and mgf and infra is not None and growth_pot is not None and inv_score is not None:
                log(f"Prediction Successful!", "PASS")
                log(f"  Price: {p_price}, Conf: {conf}", "INFO")
                log(f"  Urban Intell: Infra={infra}, GrowthPot={growth_pot}, InvScore={inv_score}, Heatmap={heatmap}", "PASS")
                
                # Logical check
                if inv_score > 0:
                    log("Investment Score logic passed", "PASS")
                else:
                    log("Investment Score logic check failed", "FAIL")
            else:
                log(f"Missing fields in prediction: {prediction}", "FAIL")
        else:
            log("No prediction object in response", "FAIL")
    else:
        log(f"Prediction failed: {res.status_code} {res.text}", "FAIL")

    log("AI Prediction Verification Complete.", "END")

if __name__ == "__main__":
    test_prediction()
