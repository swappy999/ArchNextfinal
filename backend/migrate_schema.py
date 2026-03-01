import asyncio
import os
from sqlalchemy import text
from app.core.database import engine
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    print("Checking and updating PostgreSQL schema...")
    
    columns_to_add = [
        ("listing_price_matic", "DOUBLE PRECISION DEFAULT 0.0"),
        ("listing_price_wei", "DOUBLE PRECISION DEFAULT 0.0"),
        ("verification_hash", "VARCHAR NULL"),
        ("verification_score", "DOUBLE PRECISION NULL"),
        ("last_tx_hash", "VARCHAR NULL"),
        ("owner_wallet", "VARCHAR NULL"),
        ("predicted_price", "DOUBLE PRECISION NULL"),
        ("is_verified", "DOUBLE PRECISION DEFAULT 0.0"),
        ("is_nft", "DOUBLE PRECISION DEFAULT 0.0"),
        ("nft_token_id", "DOUBLE PRECISION NULL")
    ]
    
    for col_name, col_type in columns_to_add:
        print(f"--- Processing {col_name} ---")
        try:
            async with engine.connect() as conn:
                # Use a DO block to safely add the column
                sql_text = f"""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='{col_name}') THEN
                        ALTER TABLE properties ADD COLUMN {col_name} {col_type};
                    END IF;
                END $$;
                """
                await conn.execute(text(sql_text))
                await conn.commit()
                print(f"[OK] {col_name} processed.")
        except Exception:
            import traceback
            print(f"[ERROR] {col_name} failed:")
            traceback.print_exc()

    print("Schema update complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
