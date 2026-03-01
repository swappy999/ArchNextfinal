import asyncio
import time
from app.repository.user_repo import get_user_by_email

async def test_db_timing():
    print("Testing DB User Lookup Timing...")
    start = time.time()
    try:
        user = await get_user_by_email("priyansh0804+timingtest@gmail.com")
        duration = time.time() - start
        print(f"User Found: {user is not None}")
        print(f"Time Taken to Query DB: {duration:.2f} seconds")
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_db_timing())
