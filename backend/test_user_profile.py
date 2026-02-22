import requests
import time

BASE_URL = "http://127.0.0.1:8005"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_user_profile():
    log("Starting User Profile Verification...", "START")

    email = f"profile_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup/Login
    log("Logging in...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    data = res.json()
    token = data.get("access_token")

    if not token:
         # Try login if user exists
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        data = res.json()
        token = data.get("access_token")

    if not token:
        log("Login failed", "FAIL")
        return

    log("Got Token.", "PASS")

    # 2. Get Profile
    log("Fetching /users/me...", "STEP")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/users/me", headers=headers)
    
    if res.status_code == 200:
        data = res.json()
        user = data.get("user")
        if user:
            log(f"Got User Object: {user.keys()}", "PASS")
            # Verify fields
            if "_id" in user and "email" in user and "role" in user:
                log("User object contains expected fields (_id, email, role)", "PASS")
            else:
                 log(f"User object missing fields: {user}", "FAIL")
            
            if "password_hash" not in user:
                log("Password hash is correctly excluded", "PASS")
            else:
                log("Password hash leaked!", "FAIL")
        else:
            log("Response missing 'user' key", "FAIL")
    else:
        log(f"Fetch failed: {res.status_code} - {res.text}", "FAIL")

    log("User Profile Verification Complete.", "END")

if __name__ == "__main__":
    test_user_profile()
