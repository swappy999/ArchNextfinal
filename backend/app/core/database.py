from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.models.base import Base

# SQLAlchemy Async Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db():
    print("Initializing PostgreSQL database connection...")
    try:
        # Create all tables (In production, use Alembic migrations instead)
        async with engine.begin() as conn:
            # await conn.run_sync(Base.metadata.drop_all) # Optional reset
            await conn.run_sync(Base.metadata.create_all)
        print("[OK] PostgreSQL database connected and tables verified.")
    except Exception as e:
        print(f"[ERROR] Error initializing PostgreSQL database: {e}")

async def close_db():
    if engine:
        await engine.dispose()
        print("PostgreSQL connection pool closed.")

# FastAPI Dependency for Session Management
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

