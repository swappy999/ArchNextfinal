import time
from app.core.security import hash_password

def test_hash_timing():
    print("Testing Password Hashing Timing...")
    start = time.time()
    try:
        pw = hash_password("Password123!")
        duration = time.time() - start
        print(f"Time Taken to Hash Password: {duration:.2f} seconds")
    except Exception as e:
        print(f"Hash Error: {e}")

if __name__ == "__main__":
    test_hash_timing()
