import requests
import time

BASE_URL = "http://127.0.0.1:8011"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def get_auth_token(email, password):
    # Signup or Login
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    data = res.json()
    token = data.get("access_token")
    if not token:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        data = res.json()
        token = data.get("access_token")
    return token

def test_geo():
    log("Starting Geo-Spatial & Advanced Verification...", "START")

    # 1. Setup Users
    email_a = f"geo_a_{int(time.time())}@example.com"
    email_b = f"geo_b_{int(time.time())}@example.com"
    password = "testpass123"
    
    token_a = get_auth_token(email_a, password)
    token_b = get_auth_token(email_b, password)
    
    if not token_a or not token_b:
        log("Failed to get tokens", "FAIL")
        return

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. Create Properties (User A)
    # Prop 1: Los Angeles
    prop1_data = {
        "title": "LA Condo",
        "description": "Downtown LA",
        "price": 800000.0,
        "latitude": 34.0522,
        "longitude": -118.2437
    }
    res = requests.post(f"{BASE_URL}/properties/", json=prop1_data, headers=headers_a)
    prop1_id = res.json().get("id")
    log(f"Created Prop 1 (LA): {prop1_id}", "PASS")

    # Prop 2: New York
    prop2_data = {
        "title": "NY Loft",
        "description": "Manhattan",
        "price": 1200000.0,
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    res = requests.post(f"{BASE_URL}/properties/", json=prop2_data, headers=headers_a)
    prop2_id = res.json().get("id")
    log(f"Created Prop 2 (NY): {prop2_id}", "PASS")

    # 3. Test Nearby Search (Near LA)
    log("Testing Nearby Search (Radius 50km around LA)...", "STEP")
    # Coordinates: LA
    params = {"longitude": -118.2437, "latitude": 34.0522, "radius": 50000}
    res = requests.get(f"{BASE_URL}/properties/nearby", params=params)
    if res.status_code == 200:
        nearby_props = res.json()
        ids = [p["id"] for p in nearby_props]
        if prop1_id in ids and prop2_id not in ids:
            log("Nearby search correctly found LA prop and excluded NY prop", "PASS")
        else:
            log(f"Nearby search unexpected results: {ids}", "FAIL")
    else:
        log(f"Nearby search failed: {res.status_code} {res.text}", "FAIL")

    # 4. Test Filtering
    log("Testing Price Filter (Max 900k)...", "STEP")
    # Should match LA (800k) but not NY (1.2m)
    params = {"max_price": 900000}
    res = requests.get(f"{BASE_URL}/properties/filter", params=params)
    if res.status_code == 200:
        filtered_props = res.json()
        ids = [p["id"] for p in filtered_props]
        if prop1_id in ids and prop2_id not in ids:
            log("Filter correctly returned cheaper property", "PASS")
        else:
             log(f"Filter unexpected results: {ids}", "FAIL")
    else:
        log(f"Filter failed: {res.status_code} {res.text}", "FAIL")

    # 5. Test Ownership Security
    log("Testing Ownership Security...", "STEP")
    # User B tries to delete User A's property (Prop 1)
    res = requests.delete(f"{BASE_URL}/properties/{prop1_id}", headers=headers_b)
    if res.status_code == 403:
        log("User B blocked from deleting User A's property", "PASS")
    else:
        log(f"Security check failed! Status: {res.status_code}", "FAIL")
    
    # User A tries to delete (should succeed)
    res = requests.delete(f"{BASE_URL}/properties/{prop1_id}", headers=headers_a)
    if res.status_code == 200:
        log("User A successfully deleted own property", "PASS")
    else:
        log(f"Owner delete failed: {res.status_code}", "FAIL")

    log("Geo-Spatial & Advanced Verification Complete.", "END")

if __name__ == "__main__":
    test_geo()
