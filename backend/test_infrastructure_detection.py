import asyncio
from unittest.mock import AsyncMock, patch, Mock

# ─── Test 1: POI Search Engine ───────────────────────────────────────────────
async def test_poi_search():
    print("[START] Testing Mapbox POI Search...")
    
    from app.integrations.mapbox_infrastructure import search_nearby_poi
    
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "features": [
            {"place_name": "Salt Lake Metro Station", "center": [88.43, 22.57]},
            {"place_name": "Sector V Metro", "center": [88.44, 22.58]}
        ]
    }
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        with patch("app.core.config.settings.MAPBOX_TOKEN", "fake_token"):
            result = await search_nearby_poi("metro station", 88.43, 22.57)
            
    assert len(result["features"]) == 2
    print("[PASS] POI Search returned 2 metro stations.")

# ─── Test 2: Infrastructure Detection ────────────────────────────────────────
async def test_infrastructure_detection():
    print("[START] Testing Infrastructure Detection...")
    
    from app.ai.intelligence.infrastructure_detection import detect_infrastructure
    
    # Mock all POI searches to return results
    async def mock_poi(keyword, lng, lat, limit=5):
        if "metro" in keyword:
            return {"features": [{"place_name": "Metro"}]}
        if "hospital" in keyword:
            return {"features": [{"place_name": "Hospital"}]}
        if "school" in keyword:
            return {"features": []}  # No schools nearby
        return {"features": []}
    
    with patch("app.ai.intelligence.infrastructure_detection.search_nearby_poi", side_effect=mock_poi):
        result = await detect_infrastructure(88.43, 22.57)
    
    print(f"[INFO] Detection Result: {result}")
    assert result["nearby_metro"] == True
    assert result["nearby_hospital"] == True
    assert result["nearby_school"] == False
    assert result["metro_count"] == 1
    print("[PASS] Infrastructure Detection works correctly.")

# ─── Test 3: Infrastructure Score with Real Keys ─────────────────────────────
def test_infrastructure_score():
    print("[START] Testing Infrastructure Score with real keys...")
    
    from app.ai.intelligence.infrastructure_score import calculate_infrastructure_score
    
    # Simulate real Mapbox detection output
    enriched = {
        "nearby_metro": True,
        "metro_count": 3,
        "nearby_hospital": True,
        "nearby_school": False,
        "tech_hub": True,
        "commercial_center": True,
    }
    
    score = calculate_infrastructure_score(enriched)
    print(f"[INFO] Infrastructure Score: {score}")
    # metro(0.4) + metro_bonus(0.1) + hospital(0.15) + tech_hub(0.3) + commercial(0.15) = 1.1
    assert score == 1.1
    print("[PASS] Infrastructure Score calculated correctly.")

# ─── Test 4: Full Feature Pipeline (End-to-End) ──────────────────────────────
async def test_full_pipeline():
    print("[START] Testing Full Feature Pipeline with Infra Detection...")
    
    from app.ai.pipeline.feature_engine import build_features
    
    property_data = {
        "price": 500000,
        "location": {"type": "Point", "coordinates": [88.43, 22.57]}
    }
    
    mock_infra = {
        "nearby_metro": True,
        "nearby_hospital": True,
        "nearby_school": True,
        "tech_hub": False,
        "commercial_center": True,
        "metro_count": 1,
        "hospital_count": 1,
        "school_count": 2,
    }
    
    with patch("app.ai.pipeline.feature_engine.detect_infrastructure", new_callable=AsyncMock) as mock_detect:
        mock_detect.return_value = mock_infra
        features = await build_features(property_data)
    
    print(f"[INFO] Features: {features}")
    assert "infrastructure_score" in features
    assert "growth_potential" in features
    assert "investment_score" in features
    assert "infra_detection" in features
    assert features["infra_detection"]["nearby_metro"] == True
    print(f"[PASS] Full pipeline returned infra_score={features['infrastructure_score']}, growth={features['growth_potential']}")

async def main():
    await test_poi_search()
    await test_infrastructure_detection()
    test_infrastructure_score()
    await test_full_pipeline()
    print("\n[END] All Infrastructure Detection Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
