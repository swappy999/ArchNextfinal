import asyncio
import time
import random
from app.repository.user_repo import create_user

async def test_db_write_timing():
    print("Testing DB User Creation Timing...")
    start = time.time()
    try:
        data = {
            "email": f"test{random.randint(1000,9999)}@example.com",
            "username": "TestUser",
            "password_hash": "dummyhash",
            "role": "user"
        }
        await create_user(data)
        duration = time.time() - start
        print(f"Time Taken to Write DB: {duration:.2f} seconds")
    except Exception as e:
        print(f"DB Write Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_db_write_timing())
