import requests
import time

BASE_URL = "http://127.0.0.1:8003"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_refresh():
    log("Starting Refresh Token Verification...", "START")

    email = f"refresh_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup/Login
    log("Logging in...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    data = res.json()
    
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")

    if not access_token or not refresh_token:
        # Try login
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        data = res.json()
        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")

    if not access_token or not refresh_token:
        log(f"Login failed: Missing tokens. Response: {data}", "FAIL")
        return
    
    log(f"Got Access Token: {access_token[:10]}...", "PASS")
    log(f"Got Refresh Token: {refresh_token[:10]}...", "PASS")

    # 2. Access Protected Route (with initial token)
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(f"{BASE_URL}/user/dashboard", headers=headers)
    if res.status_code == 200:
        log("Initial Access Granted", "PASS")
    else:
        log(f"Initial Access Failed: {res.status_code}", "FAIL")
        return

    # 3. Refresh Token
    log("Refreshing token...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": refresh_token})
    if res.status_code == 200:
        new_data = res.json()
        new_access_token = new_data.get("access_token")
        if new_access_token:
            log(f"Got New Access Token: {new_access_token[:10]}...", "PASS")
        else:
            log("Refresh failed: No access token in response", "FAIL")
            return
    else:
        log(f"Refresh failed: {res.status_code} - {res.text}", "FAIL")
        return

    # 4. Access Protected Route (with NEW token)
    log("Accessing /user/dashboard with NEW token...", "STEP")
    headers = {"Authorization": f"Bearer {new_access_token}"}
    res = requests.get(f"{BASE_URL}/user/dashboard", headers=headers)
    if res.status_code == 200:
        log("Access Granted with New Token", "PASS")
    else:
        log(f"Access Failed with New Token: {res.status_code}", "FAIL")

    log("Refresh Token Verification Complete.", "END")

if __name__ == "__main__":
    test_refresh()
