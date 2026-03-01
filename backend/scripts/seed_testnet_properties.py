import os
import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.core.config import settings

async def main():
    print("Starting seeding of 4 real testnet properties...")
    engine = create_async_engine(settings.DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})

    async with engine.begin() as conn:
        for i in range(1, 5):
            token_id = 200 + i
            prop_id = str(uuid.uuid4())
            # Insert Property
            await conn.execute(
                text("""
                INSERT INTO properties (
                    id, title, description, price, latitude, longitude,
                    owner_id, is_nft, nft_token_id, status, is_verified,
                    verification_score, verification_hash, listing_price_matic
                ) VALUES (
                    :id, :title, :desc, :price, :lat, :lon,
                    :owner, 1.0, :tid, 'listed', 1.0,
                    0.99, '0xVERIFIED_ONCHAIN_NFT_HASH', 0.00001
                )
                """),
                {
                    "id": prop_id,
                    "title": f"Genesis Smart Villa #{i}",
                    "desc": f"Exclusive real-world tokenized asset #{i} on Polygon Amoy testnet.",
                    "price": 800000.0,
                    "lat": 22.5 + i*0.01,
                    "lon": 88.3 + i*0.01,
                    "owner": "admin",
                    "tid": token_id
                }
            )

            print(f"--> Inserted Property {i} with Token ID {token_id} (Listed for 0.00001 POL)")

    await engine.dispose()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(main())
