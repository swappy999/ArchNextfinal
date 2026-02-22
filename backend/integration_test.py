import requests
import uuid
import time
import json

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    errors = []
    print("=== STARTING E2E BACKEND INTEGRATION TEST ===")
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        print("[Pass] Health check")
    except Exception as e:
        errors.append(f"Health check error: {e}")

    # 2. Auth Flow
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    password = "SuperSecretPassword123!"
    token = None
    
    try:
        r = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
        assert r.status_code in [200, 201], f"Signup failed: {r.text}"
        print("[Pass] Signup")
        
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200, f"Login failed: {r.text}"
        data = r.json()
        assert "access_token" in data, "No access token in login response"
        token = data["access_token"]
        print("[Pass] Login & JWT received")
    except Exception as e:
        errors.append(f"Auth flow error: {e}")
        
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # 3. Protected Route (User profile)
    if token:
        try:
            r = requests.get(f"{BASE_URL}/users/me", headers=headers)
            assert r.status_code == 200, f"Profile fetch failed: {r.text}"
            print("[Pass] Protected Route (/users/me)")
        except Exception as e:
            errors.append(f"Protected route error: {e}")
            
    # 4. Properties
    property_id = None
    try:
        r = requests.get(f"{BASE_URL}/properties")
        assert r.status_code == 200, f"Properties fetch failed: {r.text}"
        print("[Pass] Fetch Properties")
        props = r.json()
        if isinstance(props, list) and len(props) > 0:
            property_id = props[0].get("_id") or props[0].get("id")
    except Exception as e:
        errors.append(f"Properties error: {e}")
        
    # 5. Marketplace
    try:
        r = requests.get(f"{BASE_URL}/marketplace/listings")
        assert r.status_code == 200, f"Marketplace listings failed: {r.text}"
        print("[Pass] Marketplace Listings")
    except Exception as e:
        errors.append(f"Marketplace error: {e}")
        
    # 6. Portfolio
    if token:
        try:
            r = requests.get(f"{BASE_URL}/portfolio/me", headers=headers)
            assert r.status_code == 200, f"Portfolio fetch failed: {r.text}"
            print("[Pass] Portfolio fetching")
        except Exception as e:
            errors.append(f"Portfolio error: {e}")

    # 7. Map
    try:
        r = requests.get(f"{BASE_URL}/map/markers")
        assert r.status_code == 200, f"Map markers failed: {r.text}"
        print("[Pass] Map Markers")
    except Exception as e:
        errors.append(f"Map error: {e}")
        
    # 8. AI Prediction
    try:
        payload = {"area": "Downtown", "property_type": "Condo", "size_sqft": 1000, "bedrooms": 2}
        r = requests.post(f"{BASE_URL}/prediction/predict", json=payload, headers=headers)
        assert r.status_code == 200, f"AI Prediction failed: {r.text}"
        data = r.json()
        assert "predicted_price" in data, "No predicted price in response"
        print("[Pass] AI Prediction")
    except Exception as e:
        errors.append(f"AI Prediction error: {e}")
        
    print("=== SUMMARY ===")
    if errors:
        print("Integration Test Failed with errors:")
        for err in errors:
            print(f" - {err}")
    else:
        print("ALL TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    test_flow()
