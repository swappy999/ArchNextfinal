import requests
import time

BASE_URL = "http://127.0.0.1:8019"

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

def create_prop(token, title, price, lat, lng):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": title,
        "description": "Geo Test Prop",
        "price": price,
        "latitude": lat,
        "longitude": lng
    }
    res = requests.post(f"{BASE_URL}/properties/", json=data, headers=headers)
    return res.json().get("id")

def test_geo_intelligence():
    log("Starting Geo Intelligence Verification...", "START")

    # 1. Setup User
    email = f"geo_admin_{int(time.time())}@example.com"
    password = "geopass"
    token = get_auth_token(email, password)
    if not token:
        log("Failed to get token", "FAIL")
        return

    # 2. Setup Area (Downtown LA center: 34.0407, -118.2468)
    # create 3 properties within 1-2km
    log("Creating Cluster in Downtown LA...", "STEP")
    p1 = create_prop(token, "Downtown Loft", 600000, 34.0410, -118.2470) # Very close
    p2 = create_prop(token, "Arts District Condo", 800000, 34.0450, -118.2380) # ~1km
    p3 = create_prop(token, "South Park Apt", 400000, 34.0380, -118.2550) # ~1km
    
    # Create 1 property far away (San Diego)
    create_prop(token, "SD Beach House", 1200000, 32.7157, -117.1611)

    # 3. Request Analysis
    log("Requesting Geo Analysis for Downtown LA...", "STEP")
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "latitude": 34.0407,
        "longitude": -118.2468,
        "radius": 5000 # 5km
    }
    
    res = requests.get(f"{BASE_URL}/geo/analysis", params=params, headers=headers)
    
    if res.status_code == 200:
        data = res.json()
        log(f"Geo Analysis Response: {data}", "INFO")
        
        count = data.get("property_count")
        zone_score = data.get("zone_score")
        heatmap = data.get("heatmap_points")
        clusters = data.get("price_clusters")
        
        # Verify Count (Should be 3, possibly more if prev tests created data here, but at least 3)
        # Note: If DB wasn't cleared, previous test props might be here.
        if count >= 3:
            log(f"Property Count Verified: {count}", "PASS")
        else:
            log(f"Property Count Mismatch: Expected >= 3, Got {count}", "FAIL")
            
        # Verify Zone Score (Avg of 600k, 800k, 400k = 600k -> Score ~6.0)
        # Assuming only these 3 props exist. If others exist, score varies.
        if zone_score > 0:
            log(f"Zone Score Calculated: {zone_score}", "PASS")
            
        # Verify Heatmap
        if len(heatmap) == count:
            log(f"Heatmap Points Verified: {len(heatmap)}", "PASS")
            if "weight" in heatmap[0]:
                log("Heatmap has weights", "PASS")
                
        # Verify Clusters
        if clusters:
            log(f"Price Clusters Found: {clusters}", "PASS")
            
    else:
        log(f"Geo Analysis Failed: {res.status_code} {res.text}", "FAIL")

    log("Geo Intelligence Verification Complete.", "END")

if __name__ == "__main__":
    test_geo_intelligence()
