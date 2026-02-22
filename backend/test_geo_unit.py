import asyncio
from app.ai.geo.clustering_engine import cluster_properties
from app.ai.geo.zone_scoring import calculate_zone_score
from app.ai.geo.heatmap_generator import generate_heatmap
from app.services.geo_service import geo_intelligence

# Mock Logic replacement
async def mock_get_properties(lon, lat, rad):
    return [
        {"_id": "1", "price": 600000, "location": {"coordinates": [-118.2470, 34.0410]}},
        {"_id": "2", "price": 800000, "location": {"coordinates": [-118.2380, 34.0450]}},
        {"_id": "3", "price": 400000, "location": {"coordinates": [-118.2550, 34.0380]}}
    ]

async def run_geo_logic():
    print("[START] Testing Geo Intelligence Logic (Unit Test)...")
    
    # 1. Test Clustering
    props = await mock_get_properties(0,0,0)
    clusters = cluster_properties(props)
    print(f"[INFO] Clusters: {len(clusters)}")
    # Logic changed to geo-clustering, check return type
    assert len(clusters) > 0
    assert "centroid" in clusters[0]
    print("[PASS] Clustering Engine works.")
    
    # 2. Test Zone Scoring
    score = calculate_zone_score(props)
    print(f"[INFO] Zone Score: {score}")
    # Avg price = 600k. Score should be 6.0
    assert score == 6.0
    print("[PASS] Zone Scoring works.")
    
    # 3. Test Heatmap
    heatmap = generate_heatmap(props)
    print(f"[INFO] Heatmap Points: {len(heatmap)}")
    assert len(heatmap) == 3
    assert heatmap[0]["weight"] == 0.6 # 600k / 1m
    print("[PASS] Heatmap Generator works.")

    print("[END] Geo Intelligence Unit Test Passed.")

def test_geo_logic_sync():
    asyncio.run(run_geo_logic())

if __name__ == "__main__":
    asyncio.run(run_geo_logic())
