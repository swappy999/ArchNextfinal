import asyncio
import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal, engine
from app.models.property_model import PropertyDB
from app.models.base import Base
from sqlalchemy import delete

async def reset_properties():
    print("Connecting to PostgreSQL to clear market data...")
    
    async with AsyncSessionLocal() as session:
        print("Clearing properties table...")
        stmt = delete(PropertyDB)
        result = await session.execute(stmt)
        await session.commit()
        print(f"Properties table cleared. Deleted {result.rowcount} records.")

if __name__ == "__main__":
    asyncio.run(reset_properties())
