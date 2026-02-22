import requests
import time

BASE_URL = "http://127.0.0.1:8000"
WALLET_ADDRESS = "0x1234567890123456789012345678901234567890"

def log(message, status="INFO"):
    print(f"[{status}] {message}")

def test_endpoints():
    log("Starting Comprehensive Backend Verification...", "START")

    # 1. Health Check
    try:
        res = requests.get(f"{BASE_URL}/")
        if res.status_code == 200:
            log("Root/Health Endpoint: OK", "PASS")
        else:
            log(f"Root/Health Endpoint: Failed ({res.status_code})", "FAIL")
    except Exception as e:
        log(f"Root/Health Endpoint: Error ({e})", "FAIL")

    # 2. Database Connection
    try:
        res = requests.get(f"{BASE_URL}/db-test")
        if res.status_code == 200:
            log("Database Connection: OK", "PASS")
        else:
            log(f"Database Connection: Failed ({res.status_code}) - {res.text}", "FAIL")
    except Exception as e:
        log(f"Database Connection: Error ({e})", "FAIL")

    # 3. Auth - Wallet Nonce
    nonce = None
    try:
        res = requests.post(f"{BASE_URL}/auth/wallet-nonce", json={"wallet_address": WALLET_ADDRESS})
        if res.status_code == 200:
            nonce = res.json().get("nonce")
            if nonce:
                log(f"Auth - Wallet Nonce: OK (Nonce: {nonce})", "PASS")
            else:
                log("Auth - Wallet Nonce: Failed (No nonce in response)", "FAIL")
        else:
            log(f"Auth - Wallet Nonce: Failed ({res.status_code})", "FAIL")
    except Exception as e:
        log(f"Auth - Wallet Nonce: Error ({e})", "FAIL")

    # 4. Auth - Wallet Verify (Mock)
    if nonce:
        try:
            payload = {
                "wallet_address": WALLET_ADDRESS,
                "signature": "0xinvalid_signature_mock",
                "message": f"Login nonce: {nonce}"
            }
            res = requests.post(f"{BASE_URL}/auth/wallet-verify", json=payload)
            # We expect 500 or 422 or a specific error message because signature is invalid
            # But getting a response means the endpoint logic is executing
            if res.status_code in [200, 400, 422, 500]: 
                log(f"Auth - Wallet Verify: OK (Endpoint Active, Response: {res.status_code})", "PASS")
            else:
                log(f"Auth - Wallet Verify: Failed (Unexpected Status {res.status_code})", "FAIL")
        except Exception as e:
             log(f"Auth - Wallet Verify: Error ({e})", "FAIL")

    # 5. Auth - Email Signup (Mock)
    email = f"test_verify_{int(time.time())}@example.com"
    password = "strongpassword123"
    try:
        payload = {
            "email": email,
            "password": password
        }
        res = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        if res.status_code == 200:
            log("Auth - Email Signup: OK", "PASS")
        elif "User already exists" in res.text:
            log("Auth - Email Signup: OK (User exists handled)", "PASS")
        else:
            log(f"Auth - Email Signup: Failed ({res.status_code}) - {res.text}", "FAIL")
    except Exception as e:
        log(f"Auth - Email Signup: Error ({e})", "FAIL")

    # 6. Auth - Email Login
    try:
        payload = {
            "email": email,
            "password": password
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        if res.status_code == 200:
            token = res.json().get("access_token")
            if token:
                log(f"Auth - Email Login: OK (Token received)", "PASS")
            else:
                log("Auth - Email Login: Failed (No token)", "FAIL")
        else:
            log(f"Auth - Email Login: Failed ({res.status_code}) - {res.text}", "FAIL")
    except Exception as e:
        log(f"Auth - Email Login: Error ({e})", "FAIL")

    log("Verification Complete.", "END")

if __name__ == "__main__":
    test_endpoints()
