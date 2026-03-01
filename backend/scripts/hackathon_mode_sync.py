import asyncio
import os
import sys

# Load ENV
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def main():
    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1]}")
    engine = create_async_engine(settings.DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})

    async with engine.begin() as conn:
        # Fetch up to 10 properties to mark as "On-Chain" for the demo
        result = await conn.execute(text("SELECT id, title FROM properties LIMIT 10"))
        properties = result.mappings().fetchall()

        if not properties:
            print("No properties found in database.")
            return

        print(f"Propagating Hackathon Mode to {len(properties)} properties...")

        for idx, prop in enumerate(properties):
            prop_id = str(prop["id"])
            title = prop["title"]
            
            # Simulated On-Chain Data
            token_id = 1000 + idx
            fake_hash = f"0x{os.urandom(32).hex()}"
            
            # Only update status to 'available' if it's currently 'draft' or null
            # This prevents overwriting 'auction', 'listed', or 'sold'
            await conn.execute(
                text("""
                    UPDATE properties 
                    SET is_nft = 1.0, 
                        nft_token_id = :tid, 
                        blockchain_hash = :bhash, 
                        status = CASE 
                            WHEN status IN ('draft', 'verified', 'minted') OR status IS NULL THEN 'available' 
                            ELSE status 
                        END
                    WHERE id = :pid
                """),
                {"tid": token_id, "bhash": fake_hash, "pid": prop_id}
            )
            print(f"--> [SIMULATED] {title} updated (Token ID: {token_id})")

    await engine.dispose()
    print("\nHackathon Mode Synchronization Complete!")

if __name__ == "__main__":
    asyncio.run(main())
