import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

# ─── Test 1: Property Hash Generation ────────────────────────────────────────
def test_hash_generation():
    print("[START] Testing Property Hash Generation...")
    from app.integrations.blockchain import generate_property_hash
    
    prop = {
        "title": "Luxury Apartment",
        "price": 1200000,
        "address": "Salt Lake Sector V",
        "owner_id": "user123",
        "location": {"type": "Point", "coordinates": [88.43, 22.57]}
    }
    
    hash1 = generate_property_hash(prop)
    hash2 = generate_property_hash(prop)
    
    print(f"[INFO] Hash: {hash1[:16]}...")
    assert len(hash1) == 64  # SHA-256 = 64 hex chars
    assert hash1 == hash2    # Deterministic
    
    # Different data = different hash
    prop2 = dict(prop)
    prop2["price"] = 999999
    hash3 = generate_property_hash(prop2)
    assert hash1 != hash3
    print("[PASS] Hash is 64-char SHA-256, deterministic, and data-sensitive.")

# ─── Test 2: Offline Fallback (no blockchain configured) ─────────────────────
def test_offline_fallback():
    print("[START] Testing Offline Fallback Mode...")
    from app.integrations.blockchain import verify_property_on_chain
    
    # With no POLYGON_RPC or CONTRACT_ADDRESS configured, should return offline result
    result = verify_property_on_chain("abc123hash")
    
    print(f"[INFO] Result: {result}")
    assert result["success"] == False
    assert result["mode"] in ("offline", "error")
    assert result["tx_hash"] is None
    print("[PASS] Graceful offline fallback works — no crash when blockchain not configured.")

# ─── Test 3: Blockchain Service (mocked) ─────────────────────────────────────
async def test_blockchain_service():
    print("[START] Testing Blockchain Service...")
    from app.services.blockchain_service import verify_property_service
    
    mock_property = {
        "_id": "prop123",
        "id": "prop123",
        "title": "Test Property",
        "price": 500000,
        "address": "Kolkata",
        "owner_id": "user123",
        "location": {"type": "Point", "coordinates": [88.43, 22.57]}
    }
    
    mock_verify_result = {
        "success": False,
        "tx_hash": None,
        "mode": "offline",
        "message": "Blockchain not configured."
    }
    
    with patch("app.services.blockchain_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_property
        with patch("app.services.blockchain_service.update_property", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = True
            with patch("app.services.blockchain_service.verify_property_on_chain", return_value=mock_verify_result):
                current_user = {"_id": "user123"}
                result = await verify_property_service("prop123", current_user)
    
    print(f"[INFO] Service Result: {result}")
    assert "property_hash" in result
    assert len(result["property_hash"]) == 64
    assert result["blockchain_result"]["mode"] == "offline"
    
    # Verify update_property was called with hash
    call_args = mock_update.call_args[0]
    assert "property_hash" in call_args[1]
    print("[PASS] Blockchain service correctly hashes, calls chain, and updates DB.")

# ─── Test 4: Ownership Check ─────────────────────────────────────────────────
async def test_ownership_check():
    print("[START] Testing Ownership Enforcement...")
    from app.services.blockchain_service import verify_property_service
    from fastapi import HTTPException
    
    mock_property = {
        "_id": "prop123",
        "owner_id": "real_owner",
        "title": "Test", "price": 100, "address": "X",
        "location": {"type": "Point", "coordinates": [0, 0]}
    }
    
    with patch("app.services.blockchain_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_property
        wrong_user = {"_id": "hacker456"}
        try:
            await verify_property_service("prop123", wrong_user)
            assert False, "Should have raised 403"
        except HTTPException as e:
            assert e.status_code == 403
            print("[PASS] Ownership check correctly blocks unauthorized users.")

async def main():
    test_hash_generation()
    test_offline_fallback()
    await test_blockchain_service()
    await test_ownership_check()
    print("\n[END] All Blockchain Integration Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
