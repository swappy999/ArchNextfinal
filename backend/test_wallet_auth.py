import requests
import json

BASE_URL = "http://127.0.0.1:8000"
WALLET_ADDRESS = "0x1234567890123456789012345678901234567890"

def test_wallet_auth():
    print(f"Testing Wallet Auth Flow for {WALLET_ADDRESS}...")

    # Step 1: Request Nonce
    print("\n[1] Requesting Nonce...")
    try:
        response = requests.post(f"{BASE_URL}/auth/wallet-nonce", json={"wallet_address": WALLET_ADDRESS})
        if response.status_code == 200:
            nonce = response.json().get("nonce")
            print(f"SUCCESS: Received nonce: {nonce}")
        else:
            print(f"FAILED: Status {response.status_code}, Response: {response.text}")
            return
    except Exception as e:
        print(f"ERROR requesting nonce: {e}")
        return

    # Step 2: Verify Signature (Expected to fail signature check, but endpoint should be reachable)
    print("\n[2] Testing Verification Endpoint (Mock Signature)...")
    payload = {
        "wallet_address": WALLET_ADDRESS,
        "signature": "0xinvalid_signature_for_testing",
        "message": f"Login nonce: {nonce}"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/wallet-verify", json=payload)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        # We expect a 500 or 422 because the signature is invalid and web3 will likely raise an error
        # attempting to recover it. This confirms the endpoint is hit and processing.
        if "Invalid signature" in response.text or response.status_code in [422, 500]:
            print("SUCCESS: Endpoint is active (Error expected for mock signature)")
        else:
            print("Unexpected response.")

    except Exception as e:
        print(f"ERROR verifying: {e}")

if __name__ == "__main__":
    test_wallet_auth()
