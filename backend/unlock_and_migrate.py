import asyncio
from sqlalchemy import text
from app.core.database import engine
from dotenv import load_dotenv

load_dotenv()

async def kill_and_migrate():
    print("Unlocking 'properties' table and retrying migration...")
    try:
        async with engine.connect() as conn:
            # Kill other sessions holding locks on properties
            kill_sql = text("""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE query ILIKE '%properties%' AND pid <> pg_backend_pid();
            """)
            result = await conn.execute(kill_sql)
            print(f"Terminated {result.rowcount} stale sessions.")
            await conn.commit()

        # Small delay to ensure DB cleanup
        await asyncio.sleep(2)

        # Now try the actual migration
        from migrate_schema import migrate
        await migrate()

    except Exception as e:
        print(f"Unlock/Migrate failed: {e}")

if __name__ == "__main__":
    asyncio.run(kill_and_migrate())
