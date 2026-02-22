import requests
import time

BASE_URL = "http://127.0.0.1:8002"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_logout():
    log("Starting Token Blacklist Verification...", "START")

    email = f"logout_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup/Login
    log("Logging in...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    if res.status_code == 200:
        token = res.json().get("access_token")
    else:
        # Try login if signup fails (user exists)
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        token = res.json().get("access_token")

    if not token:
        log("Login failed: No token", "FAIL")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    log("Got token.", "PASS")

    # 2. Access Protected Route (Should Succeed)
    log("Accessing /user/dashboard (Pre-logout)...", "STEP")
    res = requests.get(f"{BASE_URL}/user/dashboard", headers=headers)
    if res.status_code == 200:
        log("Access granted", "PASS")
    else:
        log(f"Expected 200, got {res.status_code}", "FAIL")
        return

    # 3. Logout
    log("Logging out...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/logout", headers=headers) # Logout needs auth!
    if res.status_code == 200:
        log("Logout successful", "PASS")
    else:
        log(f"Logout failed: {res.status_code} - {res.text}", "FAIL")

    # 4. Access Protected Route (Should Fail)
    log("Accessing /user/dashboard (Post-logout)...", "STEP")
    res = requests.get(f"{BASE_URL}/user/dashboard", headers=headers)
    if res.status_code == 401:
        log("Access correctly denied (401 Token revoked)", "PASS")
    else:
        log(f"Expected 401, got {res.status_code} - {res.text}", "FAIL")

    log("Logout Verification Complete.", "END")

if __name__ == "__main__":
    test_logout()
