import asyncio
from unittest.mock import AsyncMock, patch

# ─── Test 1: Clustering Engine ───────────────────────────────────────────────
def test_clustering():
    print("[START] Testing Clustering Engine...")
    from app.ai.geo.clustering_engine import cluster_properties
    
    props = [
        {"id": "1", "price": 500000, "location": {"coordinates": [88.4300, 22.5700]}},
        {"id": "2", "price": 600000, "location": {"coordinates": [88.4310, 22.5710]}},  # Same cluster (rounds to 88.43, 22.57)
        {"id": "3", "price": 900000, "location": {"coordinates": [88.5000, 22.6000]}},  # Different cluster
    ]
    
    clusters = cluster_properties(props)
    print(f"[INFO] Clusters: {len(clusters)} groups")
    
    assert len(clusters) == 2  # Two distinct grid cells
    
    # Find the cluster with 2 properties
    big_cluster = next(c for c in clusters if c["count"] == 2)
    assert big_cluster["avg_price"] == 550000.0
    print("[PASS] Clustering correctly grouped 2 nearby properties.")

# ─── Test 2: Heatmap Engine ──────────────────────────────────────────────────
def test_heatmap():
    print("[START] Testing Heatmap Engine...")
    from app.ai.geo.heatmap_engine import generate_heatmap
    
    props = [
        {"price": 500000, "location": {"coordinates": [88.43, 22.57]}},
        {"price": 1000000, "location": {"coordinates": [88.50, 22.60]}},
    ]
    
    heatmap = generate_heatmap(props)
    print(f"[INFO] Heatmap: {heatmap}")
    
    assert len(heatmap) == 2
    # Max price is 1M, so 500k → weight 0.5, 1M → weight 1.0
    weights = {h["raw_price"]: h["weight"] for h in heatmap}
    assert weights[500000] == 0.5
    assert weights[1000000] == 1.0
    print("[PASS] Heatmap weights normalized correctly.")

# ─── Test 3: Zone AI ─────────────────────────────────────────────────────────
def test_zone_ai():
    print("[START] Testing Zone AI...")
    from app.ai.geo.zone_ai import zone_summary
    
    props = [
        {"price": 500000},
        {"price": 700000},
        {"price": 600000},
    ]
    
    summary = zone_summary(props)
    print(f"[INFO] Zone Summary: {summary}")
    
    assert summary["count"] == 3
    assert summary["avg_price"] == 600000.0
    assert summary["growth_score"] == 6.0
    assert summary["tier"] == "high"
    print("[PASS] Zone AI summary correct.")

# ─── Test 4: Smart Map Service (End-to-End) ──────────────────────────────────
async def test_smart_map_service():
    print("[START] Testing Smart Map Service...")
    from app.services.smart_map_service import smart_map
    
    mock_props = [
        {"id": "1", "price": 500000, "location": {"coordinates": [88.43, 22.57]}},
        {"id": "2", "price": 800000, "location": {"coordinates": [88.44, 22.58]}},
        {"id": "3", "price": 1200000, "location": {"coordinates": [88.50, 22.60]}},
    ]
    
    with patch("app.services.smart_map_service.get_properties_in_viewport", new_callable=AsyncMock) as mock_vp:
        mock_vp.return_value = mock_props
        result = await smart_map(88.55, 22.65, 88.40, 22.55)
    
    print(f"[INFO] Smart Map Result: property_count={result['property_count']}, clusters={len(result['clusters'])}, zone_tier={result['zone']['tier']}")
    
    assert result["property_count"] == 3
    assert len(result["clusters"]) >= 1
    assert len(result["heatmap"]) == 3
    assert result["zone"]["tier"] in ["affordable", "mid", "high", "premium"]
    assert result["heatmap"][2]["weight"] == 1.0  # Highest price = max weight
    print("[PASS] Smart Map Service returned correct payload.")

async def main():
    test_clustering()
    test_heatmap()
    test_zone_ai()
    await test_smart_map_service()
    print("\n[END] All Smart Map Engine Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
