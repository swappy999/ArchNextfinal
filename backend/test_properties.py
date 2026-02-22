import requests
import time

BASE_URL = "http://127.0.0.1:8007"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_properties():
    log("Starting Properties Module Verification...", "START")

    email = f"prop_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup/Login
    log("Logging in...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    data = res.json()
    token = data.get("access_token")

    if not token:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        data = res.json()
        token = data.get("access_token")

    if not token:
        log("Login failed", "FAIL")
        return

    log("Got Token.", "PASS")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Property
    log("Creating Property...", "STEP")
    prop_data = {
        "title": "Luxury Villa",
        "description": "A beautiful villa with sea view",
        "price": 1500000.0,
        "latitude": 34.0522,
        "longitude": -118.2437
    }
    res = requests.post(f"{BASE_URL}/properties/", json=prop_data, headers=headers)
    
    if res.status_code == 200:
        data = res.json()
        prop_id = data.get("id")
        if prop_id:
            log(f"Property Created. ID: {prop_id}", "PASS")
        else:
            log(f"Property created but missing ID: {data}", "FAIL")
            return
    else:
        log(f"Create failed: {res.status_code} - {res.text}", "FAIL")
        return

    # 3. List Properties
    log("Listing Properties...", "STEP")
    res = requests.get(f"{BASE_URL}/properties/")
    
    if res.status_code == 200:
        props = res.json()
        if isinstance(props, list):
            log(f"Got list of {len(props)} properties", "PASS")
            # Verify the created property is in the list
            found = False
            for p in props:
                if p["id"] == prop_id:
                    found = True
                    log(f"Found Created Property: {p['title']}", "PASS")
                    if p["latitude"] == 34.0522 and p["longitude"] == -118.2437:
                        log("Lat/Long verified", "PASS")
                    else:
                        log(f"Lat/Long mismatch: {p}", "FAIL")
                    if "owner_id" in p:
                         log("Owner ID present", "PASS")
                    break
            if not found:
                log("Created property NOT found in list", "FAIL")
        else:
             log(f"Response is not a list: {props}", "FAIL")
    else:
        log(f"List failed: {res.status_code} - {res.text}", "FAIL")

    log("Properties Verification Complete.", "END")

if __name__ == "__main__":
    test_properties()
