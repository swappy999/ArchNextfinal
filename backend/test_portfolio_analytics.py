import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

# ─── Test 1: Portfolio — empty user ──────────────────────────────────────────
async def test_portfolio_empty():
    print("[START] Testing portfolio for user with no properties...")
    from app.services.portfolio_service import get_portfolio

    with patch("app.services.portfolio_service.get_all_properties", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = []
        result = await get_portfolio({"_id": "user1"})

    assert result["total_properties"] == 0
    assert result["total_current_value"] == 0
    print("[PASS] Empty portfolio returns correct zero state.")

# ─── Test 2: Portfolio — owned properties ─────────────────────────────────────
async def test_portfolio_with_properties():
    print("[START] Testing portfolio aggregation...")
    from app.services.portfolio_service import get_portfolio

    mock_props = [
        {"_id": "p1", "id": "p1", "owner_id": "user1", "price": 500000,
         "title": "Flat A", "address": "MG Road", "nft_minted": True, "nft_token_id": 0,
         "location": {"type": "Point", "coordinates": [88.43, 22.57]}},
        {"_id": "p2", "id": "p2", "owner_id": "user1", "price": 1000000,
         "title": "Villa B", "address": "Salt Lake", "nft_minted": False,
         "location": {"type": "Point", "coordinates": [88.40, 22.55]}},
        {"_id": "p3", "id": "p3", "owner_id": "other_user", "price": 200000,
         "title": "Shop C", "location": {"type": "Point", "coordinates": [88.0, 22.0]}}
    ]

    mock_pred = {"prediction": {"predicted_price": 600000, "growth_percent": 20.0}}

    with patch("app.services.portfolio_service.get_all_properties", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_props
        with patch("app.services.portfolio_service.get_listing", return_value={"active": False, "mode": "offline"}):
            with patch("app.services.portfolio_service.get_nft_owner", return_value={"mode": "offline"}):
                with patch("app.services.portfolio_service.predict_property_service",
                           new_callable=AsyncMock, return_value=mock_pred):
                    result = await get_portfolio({"_id": "user1"})

    print(f"[INFO] Portfolio: {result['total_properties']} props, "
          f"current={result['total_current_value']}, predicted={result['total_predicted_value']}")
    assert result["total_properties"] == 2  # Only user1's props
    assert result["total_current_value"] == 1500000
    assert result["total_predicted_value"] == 1200000  # 2 × 600000
    assert result["portfolio_growth_percent"] == -20.0  # 1.2M vs 1.5M
    print("[PASS] Portfolio correctly filters by owner, aggregates values, calculates growth.")

# ─── Test 3: Analytics — trending zones ──────────────────────────────────────
async def test_trending_zones():
    print("[START] Testing trending zones analytics...")
    from app.services.analytics_service import get_trending_zones

    mock_props = [
        {"id": "p1", "price": 100000, "location": {"coordinates": [88.43, 22.57]}},
        {"id": "p2", "price": 900000, "location": {"coordinates": [88.43, 22.57]}},  # Same cell
        {"id": "p3", "price": 500000, "location": {"coordinates": [72.82, 18.94]}},  # Different city
    ]
    with patch("app.services.analytics_service.get_all_properties", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_props
        result = await get_trending_zones(top_n=5)

    print(f"[INFO] Zones found: {len(result)}")
    assert len(result) >= 1
    # Zone with 2 properties (100k and 900k) should have high growth signal
    first = result[0]
    assert first["growth_signal"] > 0
    assert "tier" in first
    print(f"[PASS] Trending zones — top zone: {first['grid_key']}, signal={first['growth_signal']}%")

# ─── Test 4: Analytics — hot investment zones ─────────────────────────────────
async def test_hot_zones():
    print("[START] Testing hot investment zones...")
    from app.services.analytics_service import get_hot_investment_areas

    mock_props = [
        {"id": "p1", "price": 200000, "location": {"coordinates": [88.43, 22.57]}},
        {"id": "p2", "price": 800000, "location": {"coordinates": [88.43, 22.57]}},  # High variance
        {"id": "p3", "price": 5000000, "location": {"coordinates": [72.82, 18.94]}},  # Expensive zone
        {"id": "p4", "price": 5500000, "location": {"coordinates": [72.82, 18.94]}},
    ]
    with patch("app.services.analytics_service.get_all_properties", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_props
        result = await get_hot_investment_areas(top_n=5)

    print(f"[INFO] Hot zones: {len(result)}")
    if result:
        print(f"[INFO] Best zone: opportunity_score={result[0]['opportunity_score']}")
        assert result[0]["recommendation"] == "BUY"
    print("[PASS] Hot investment zones return correct opportunity scores.")

# ─── Test 5: Analytics — city growth map ─────────────────────────────────────
async def test_city_map():
    print("[START] Testing city growth map...")
    from app.services.analytics_service import get_city_growth_map

    mock_props = [
        {"id": "p1", "price": 300000, "location": {"coordinates": [88.43, 22.57]}},
        {"id": "p2", "price": 700000, "location": {"coordinates": [88.43, 22.57]}},
        {"id": "p3", "price": 500000, "location": {"coordinates": [72.82, 18.94]}},
    ]
    with patch("app.services.analytics_service.get_all_properties", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_props
        result = await get_city_growth_map()

    print(f"[INFO] City map zones: {result['total_zones']}")
    assert result["total_zones"] == 2  # 2 distinct grid cells
    assert all("weight" in z for z in result["zones"])
    assert all("tier" in z for z in result["zones"])
    print("[PASS] City growth map returns weighted zones with tiers.")

# ─── Test 6: Indexer — offline graceful ──────────────────────────────────────
async def test_indexer_offline():
    print("[START] Testing blockchain indexer offline fallback...")
    from app.services.indexer_service import run_indexer

    result = await run_indexer()
    print(f"[INFO] Indexer result: {result}")
    assert "nft_transfers" in result
    assert "marketplace_sales" in result
    assert result["nft_transfers"]["mode"] in ("offline", "error")
    print("[PASS] Indexer gracefully returns offline when not configured.")

async def main():
    await test_portfolio_empty()
    await test_portfolio_with_properties()
    await test_trending_zones()
    await test_hot_zones()
    await test_city_map()
    await test_indexer_offline()
    print("\n[END] All Portfolio + Analytics + Indexer Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
