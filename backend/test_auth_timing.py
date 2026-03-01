import httpx
import asyncio
import time

async def test_timing():
    base_url = "http://localhost:8000/auth"
    
    print("Testing /signup timing...")
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/signup", json={
                "username": "TestUserTime",
                "email": "priyansh0804+timingtest@gmail.com",
                "password": "Password123!"
            })
            duration = time.time() - start
            print(f"Signup Status: {resp.status_code}")
            print(f"Signup Response: {resp.text}")
            print(f"Time Taken: {duration:.2f} seconds")
    except Exception as e:
        print(f"Signup Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_timing())
