import asyncio
import sys
from sqlalchemy import text
from app.core.database import engine

async def verify_connection():
    try:
        print(f"Testing database connection to: {engine.url.render_as_string(hide_password=True)}")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                print("[OK] Database connection verified!")
                return True
            else:
                print("[FAIL] Database returned unexpected result.")
                return False
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return False
    finally:
        await engine.dispose()

if __name__ == "__main__":
    if asyncio.run(verify_connection()):
        sys.exit(0)
    else:
        sys.exit(1)
