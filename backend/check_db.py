import asyncio
from sqlalchemy import text
from app.core.database import engine
from dotenv import load_dotenv

load_dotenv()

async def check():
    print("Checking active PostgreSQL connections and locks...")
    try:
        async with engine.connect() as conn:
            # Check for active queries that might be locking the table
            sql = text("""
            SELECT pid, state, query, wait_event_type, wait_event
            FROM pg_stat_activity 
            WHERE query ILIKE '%properties%' AND pid <> pg_backend_pid();
            """)
            result = await conn.execute(sql)
            rows = result.fetchall()
            if not rows:
                print("No blocking queries found for 'properties' table.")
            for row in rows:
                print(f"PID: {row.pid} | State: {row.state} | Query: {row.query[:50]}...")
            
            # Check for locks
            lock_sql = text("""
            SELECT pid, mode, granted, locktype, relation::regclass
            FROM pg_locks 
            WHERE relation::regclass::text = 'properties';
            """)
            lock_result = await conn.execute(lock_sql)
            lock_rows = lock_result.fetchall()
            if not lock_rows:
                print("No active locks found on 'properties' table.")
            for lrow in lock_rows:
                print(f"PID: {lrow.pid} | Mode: {lrow.mode} | Granted: {lrow.granted}")

    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    asyncio.run(check())
