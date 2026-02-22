import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_protected_flow():
    email = f"protected_test_{int(time.time())}@example.com"
    password = "testpass123"

    # 1. Signup
    print("[1] Signing up...")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    print(f"    Status: {res.status_code} | Response: {res.json()}")
    token = res.json().get("access_token")
    if not token:
        print("    FAILED: No token from signup")
        return

    # 2. Login
    print("[2] Logging in...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    print(f"    Status: {res.status_code} | Response: {res.json()}")
    token = res.json().get("access_token")
    if not token:
        print("    FAILED: No token from login")
        return
    print(f"    Token: {token[:30]}...")

    # 3. Access /user/dashboard with token
    print("[3] Accessing /user/dashboard (protected)...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/user/dashboard", headers=headers)
    print(f"    Status: {res.status_code} | Response: {res.json()}")
    if res.status_code == 200 and res.json().get("email") == email:
        print("    PASS: Dashboard returned correct user email!")
    else:
        print("    FAIL: Unexpected response")

    # 4. Access /user/me with token
    print("[4] Accessing /user/me (protected)...")
    res = requests.get(f"{BASE_URL}/user/me", headers=headers)
    print(f"    Status: {res.status_code} | Response: {res.json()}")
    if res.status_code == 200:
        print("    PASS: /me endpoint works!")

    # 5. Access /user/dashboard WITHOUT token (should fail)
    print("[5] Accessing /user/dashboard WITHOUT token...")
    res = requests.get(f"{BASE_URL}/user/dashboard")
    print(f"    Status: {res.status_code} | Response: {res.json()}")
    if res.status_code == 403:
        print("    PASS: Correctly blocked unauthorized access!")
    else:
        print("    FAIL: Should have returned 403")

    print("\nDone!")

if __name__ == "__main__":
    test_protected_flow()
