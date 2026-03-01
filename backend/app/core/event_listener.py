import asyncio
from contextlib import asynccontextmanager
from app.services.indexer_service import run_indexer

POLL_INTERVAL_SECONDS = 60  # Poll every 60 seconds

async def _indexer_loop():
    """
    Background loop that polls blockchain events every 60 seconds.
    Graceful — never crashes the server on errors.
    """
    print("[Indexer] Blockchain event listener started.")
    while True:
        try:
            result = await run_indexer()
            nft = result["nft_transfers"]
            mkt = result["marketplace_sales"]
            if nft.get("events", 0) > 0 or mkt.get("events", 0) > 0:
                print(f"[Indexer] Synced — NFT transfers: {nft.get('events', 0)}, "
                      f"Marketplace sales: {mkt.get('events', 0)}")
        except Exception as e:
            print(f"[Indexer] Error during polling: {e}")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan_with_indexer(app):
    """
    FastAPI lifespan context that starts DB init, background indexer, and loads ML models.
    Import this into main.py and pass to FastAPI(lifespan=...).
    """
    print("[LIFESPAN] Executing startup sequence...")
    from app.core.database import init_db, close_db
    from app.services.prediction_service import load_ml_resources

    print("[LIFESPAN] Connecting to Intelligence Database...")
    # Import all models so that SQLAlchemy registers their tables before create_all
    import app.models.user_model      # noqa: F401
    import app.models.property_model  # noqa: F401
    import app.models.auction_model   # noqa: F401
    await init_db()
    
    # Load ML models into global memory once to prevent latency
    load_ml_resources()

    from app.services.property_state.property_sync_service import register_sync_listeners
    print("[LIFESPAN] Starting Property Global Event Bus & WebSocket listeners...")
    register_sync_listeners()

    # Start background indexer task
    indexer_task = asyncio.create_task(_indexer_loop())

    yield  # App runs here

    # Cleanup
    indexer_task.cancel()
    try:
        await indexer_task
    except asyncio.CancelledError:
        print("[Indexer] Blockchain event listener stopped.")
    await close_db()
