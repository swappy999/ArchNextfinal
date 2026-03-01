import asyncio
import sys
import os

# Add the current directory to sys.path to find 'app'
sys.path.append(os.getcwd())

from app.services.smart_map_service import smart_map
from app.api.routes.prediction import map_predict, MapPredictRequest

async def test():
    try:
        print('--- Testing smart_map service ---')
        # Coordinates for Kolkata
        res = await smart_map(ne_lng=88.5, ne_lat=22.6, sw_lng=88.4, sw_lat=22.5)
        print('\nSUCCESS (smart_map)!')
        print(f"Property Count: {res.get('property_count')}")

        print('\n--- Testing map_predict endpoint logic ---')
        request_mock = MapPredictRequest(bbox=[88.4, 22.5, 88.5, 22.6], zoom=12)
        res_predict = await map_predict(request_mock)
        print('\nSUCCESS (map_predict)!')
        print(f"Features: {len(res_predict.get('features', []))}")
    except Exception as e:
        import traceback
        print('\n--- TRACEBACK START ---')
        traceback.print_exc()
        print('--- TRACEBACK END ---')

if __name__ == '__main__':
    asyncio.run(test())
