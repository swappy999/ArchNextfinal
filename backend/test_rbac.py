import requests
import time
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8001"
MONGO_URI = os.getenv("MONGO_URI")

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_rbac():
    log("Starting RBAC Verification...", "START")

    email = f"rbac_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup (Role: user)
    log(f"Creating user {email}...", "STEP")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    if res.status_code != 200:
        log(f"Signup failed: {res.text}", "FAIL")
        return

    # 2. Login
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    token = res.json().get("access_token")
    if not token:
        log("Login failed: No token", "FAIL")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    log("Logged in successfully.", "PASS")

    # 3. Access Admin Route (Should Fail)
    log("Testing admin route with 'user' role...", "STEP")
    res = requests.get(f"{BASE_URL}/user/admin-dashboard", headers=headers)
    if res.status_code == 403:
        log("Access correctly denied (403)", "PASS")
    else:
        log(f"Expected 403, got {res.status_code}", "FAIL")

    # 4. Update Role to Admin
    log(" elevating user to 'admin' via DB...", "STEP")
    try:
        client = MongoClient(MONGO_URI)
        db = client["archnext"] # Explicitly select database
        users_col = db["users"]   # Explicitly select collection
        
        result = users_col.update_one(
            {"email": email},
            {"$set": {"role": "admin"}}
        )
        if result.modified_count == 1:
             log("User role updated to 'admin'", "PASS")
        else:
             log("DB Update failed", "FAIL")
             return
    except Exception as e:
        log(f"DB Error: {e}", "FAIL")
        return

    # 5. Access Admin Route (Should Succeed)
    log("Testing admin route with 'admin' role...", "STEP")
    # Note: If token contains role claims, this might fail if we don't re-login.
    # checking dependencies.py...
    # `get_current_user` fetches user from DB *every time*. 
    # `require_roles` checks `current_user.get("role")`.
    # So it fetches the fresh role from DB. No re-login needed!
    
    res = requests.get(f"{BASE_URL}/user/admin-dashboard", headers=headers)
    if res.status_code == 200:
        log("Access granted (200)", "PASS")
    else:
        log(f"Expected 200, got {res.status_code} - {res.text}", "FAIL")

    log("RBAC Verification Complete.", "END")

if __name__ == "__main__":
    test_rbac()
