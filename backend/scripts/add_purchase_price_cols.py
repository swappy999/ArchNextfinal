import sys
import os
import asyncio

# Adjust path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

async def run():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE properties ADD COLUMN purchase_price FLOAT;"))
            print("Added purchase_price")
        except Exception as e:
            print(f"Skipping purchase_price: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE properties ADD COLUMN purchase_price_matic FLOAT;"))
            print("Added purchase_price_matic")
        except Exception as e:
            print(f"Skipping purchase_price_matic: {e}")

if __name__ == "__main__":
    asyncio.run(run())
