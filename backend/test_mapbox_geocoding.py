import asyncio
from unittest.mock import AsyncMock, patch
from app.integrations.mapbox import geocode_address
from app.services.property_service import create_property_service
from app.services.property_service import create_property_service

# Mock Mapbox Response
MOCK_MAPBOX_RESPONSE = {
    "features": [
        {
            "center": [88.43, 22.57] # lng, lat
        }
    ]
}

from unittest.mock import AsyncMock, patch, Mock

async def test_mapbox_parsing():
    print("[START] Testing Mapbox API Parsing...")
    
    # Mock Response Object (Synchronous)
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = MOCK_MAPBOX_RESPONSE

    # Mock httpx client.get (Async)
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        
        # We need to temporarily set MAPBOX_TOKEN to simulate enabled state
        with patch("app.core.config.settings.MAPBOX_TOKEN", "fake_token"):
            result = await geocode_address("Salt Lake")
            
            assert result is not None
            assert result["longitude"] == 88.43
            assert result["latitude"] == 22.57
            print("[PASS] Geocoding parsed correctly.")

async def test_property_auto_enrollment():
    print("[START] Testing Service Auto-Geocoding...")
    
    # Input Data (Only Address)
    class MockData:
        def dict(self):
            return {"title": "Test Prop", "price": 100, "address": "Salt Lake"}

    # Mock geocode_address to return coordinates
    with patch("app.services.property_service.geocode_address", new_callable=AsyncMock) as mock_geo:
        mock_geo.return_value = {"longitude": 88.43, "latitude": 22.57}
        
        # Mock Repo create_property to capture input
        with patch("app.services.property_service.create_property", new_callable=AsyncMock) as mock_repo:
            mock_repo.return_value = "new_prop_id"
            
            # Call Service
            current_user = {"_id": "user123"}
            await create_property_service(MockData(), current_user)
            
            # Verify Repo was called with Location
            args, _ = mock_repo.call_args
            data_passed = args[0]
            
            print(f"[INFO] Repo Payload: {data_passed}")
            
            assert "location" in data_passed
            assert data_passed["location"]["type"] == "Point"
            assert data_passed["location"]["coordinates"] == [88.43, 22.57]
            assert data_passed["latitude"] == 22.57
            print("[PASS] Property Service added coordinates from Mapbox.")

async def main():
    await test_mapbox_parsing()
    await test_property_auto_enrollment()
    print("[END] Mapbox Integration Verification Complete.")

if __name__ == "__main__":
    asyncio.run(main())
