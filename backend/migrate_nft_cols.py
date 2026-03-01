import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def main():
    print(f"Connecting to: {settings.DATABASE_URL.split('@')[1]}")
    engine = create_async_engine(settings.DATABASE_URL, connect_args={'prepared_statement_cache_size': 0})
    
    async with engine.begin() as conn:
        try:
            print("Adding nft_token_id...")
            await conn.execute(text("ALTER TABLE properties ADD COLUMN nft_token_id FLOAT;"))
        except Exception as e:
            print(f"Skipping nft_token_id: {e}")
            
        try:
            print("Adding is_nft...")
            await conn.execute(text("ALTER TABLE properties ADD COLUMN is_nft FLOAT DEFAULT 0.0;"))
        except Exception as e:
            print(f"Skipping is_nft: {e}")
            
    print("Migration complete!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
