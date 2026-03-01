import asyncio
import os
import sys

from dotenv import load_dotenv
load_dotenv('.env')

sys.path.append(os.path.dirname(__file__))

from app.services.marketplace_service import get_all_listings_service

async def run():
    try:
        res = await get_all_listings_service()
        print("Success!", len(res))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
