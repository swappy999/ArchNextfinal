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
    FastAPI lifespan context that starts DB init + background indexer.
    Import this into main.py and pass to FastAPI(lifespan=...).
    """
    from app.core.database import init_db, close_db
    await init_db()

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
