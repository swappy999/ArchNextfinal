import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

# ─── Test 1: NFT Hash Generation (reuses blockchain hash) ────────────────────
def test_hash_for_nft():
    print("[START] Testing property hash for NFT...")
    from app.integrations.blockchain import generate_property_hash
    
    prop = {
        "title": "Luxury Villa",
        "price": 5000000,
        "address": "Bandra West, Mumbai",
        "owner_id": "user_abc",
        "location": {"type": "Point", "coordinates": [72.82, 19.05]}
    }
    h = generate_property_hash(prop)
    assert len(h) == 64
    print(f"[PASS] Hash: {h[:16]}... (64-char SHA-256)")

# ─── Test 2: Offline Mint Fallback ───────────────────────────────────────────
def test_offline_mint():
    print("[START] Testing NFT offline fallback...")
    from app.integrations.property_nft import mint_property_nft
    
    result = mint_property_nft("0xFakeWallet", "fakehash123", "prop_id_abc")
    print(f"[INFO] Mint result: {result}")
    assert result["success"] == False
    assert result["mode"] in ("offline", "error")
    assert result["tx_hash"] is None
    print("[PASS] Graceful offline fallback — no crash.")

# ─── Test 3: NFT Service — Mint Flow ─────────────────────────────────────────
async def test_nft_service_mint():
    print("[START] Testing NFT Service mint flow...")
    from app.services.nft_service import mint_property_nft_service
    
    mock_property = {
        "_id": "prop123",
        "id": "prop123",
        "title": "Sea View Apartment",
        "price": 2000000,
        "address": "Marine Drive",
        "owner_id": "user123",
        "location": {"type": "Point", "coordinates": [72.82, 18.94]}
    }
    
    mock_mint_result = {
        "success": False,
        "tx_hash": None,
        "token_id": None,
        "mode": "offline",
        "message": "NFT contract not configured."
    }
    
    with patch("app.services.nft_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_property
        with patch("app.services.nft_service.update_property", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = True
            with patch("app.services.nft_service.check_nft_minted", return_value=False):
                with patch("app.services.nft_service.mint_property_nft", return_value=mock_mint_result):
                    current_user = {"_id": "user123"}
                    result = await mint_property_nft_service("prop123", "0xOwnerWallet", current_user)
    
    print(f"[INFO] Service result: {result}")
    assert "property_hash" in result
    assert result["wallet_address"] == "0xOwnerWallet"
    assert result["nft_result"]["mode"] == "offline"
    
    # Verify DB was updated with hash + wallet
    update_args = mock_update.call_args[0][1]
    assert "property_hash" in update_args
    assert update_args["owner_wallet"] == "0xOwnerWallet"
    print("[PASS] NFT service correctly hashes, mints (offline), and updates DB.")

# ─── Test 4: Ownership Check (403) ───────────────────────────────────────────
async def test_nft_ownership_check():
    print("[START] Testing NFT ownership enforcement...")
    from app.services.nft_service import mint_property_nft_service
    from fastapi import HTTPException
    
    mock_property = {
        "_id": "prop123",
        "owner_id": "real_owner",
        "title": "Test", "price": 100, "address": "X",
        "location": {"type": "Point", "coordinates": [0, 0]}
    }
    
    with patch("app.services.nft_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_property
        wrong_user = {"_id": "hacker"}
        try:
            await mint_property_nft_service("prop123", "0xHackerWallet", wrong_user)
            assert False, "Should have raised 403"
        except HTTPException as e:
            assert e.status_code == 403
            print("[PASS] 403 correctly raised for non-owner.")

# ─── Test 5: Duplicate Mint Prevention ───────────────────────────────────────
async def test_duplicate_mint_prevention():
    print("[START] Testing duplicate mint prevention...")
    from app.services.nft_service import mint_property_nft_service
    from fastapi import HTTPException
    
    mock_property = {
        "_id": "prop123",
        "owner_id": "user123",
        "property_hash": "existinghash123",
        "title": "Test", "price": 100, "address": "X",
        "location": {"type": "Point", "coordinates": [0, 0]}
    }
    
    with patch("app.services.nft_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_property
        with patch("app.services.nft_service.check_nft_minted", return_value=True):
            try:
                await mint_property_nft_service("prop123", "0xWallet", {"_id": "user123"})
                assert False, "Should have raised 409"
            except HTTPException as e:
                assert e.status_code == 409
                print("[PASS] 409 correctly raised for already-minted property.")

async def main():
    test_hash_for_nft()
    test_offline_mint()
    await test_nft_service_mint()
    await test_nft_ownership_check()
    await test_duplicate_mint_prevention()
    print("\n[END] All NFT Ownership Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
