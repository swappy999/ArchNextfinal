import httpx
import asyncio

async def test_endpoints():
    base_url = "http://localhost:8000/auth"
    
    print("Testing /signup with existing email...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{base_url}/signup", json={
                "username": "Priyansh Arch",
                "email": "swapranit956@gmail.com",
                "password": "Password123!"
            })
            print(f"Signup Status: {resp.status_code}")
            print(f"Signup Response: {resp.text}")
    except Exception as e:
        print(f"Signup Error: {e}")

    print("\nTesting /forgot-password...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{base_url}/forgot-password", json={
                "email": "swapranit956@gmail.com"
            })
            print(f"Forgot PW Status: {resp.status_code}")
            print(f"Forgot PW Response: {resp.text}")
    except Exception as e:
        print(f"Forgot PW Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
