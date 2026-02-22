import asyncio
from unittest.mock import AsyncMock, patch

# ─── Test 1: get_listing offline fallback ────────────────────────────────────
def test_get_listing_offline():
    print("[START] Testing get_listing offline fallback...")
    from app.integrations.marketplace import get_listing

    result = get_listing("0xFakeNFTContract", 0)
    print(f"[INFO] Result: {result}")
    assert result["active"] == False
    assert result["mode"] in ("offline", "error")
    print("[PASS] Offline fallback works — no crash.")

# ─── Test 2: list_property_service — ownership check ─────────────────────────
async def test_list_ownership_check():
    print("[START] Testing listing ownership enforcement...")
    from app.services.marketplace_service import list_property_service
    from fastapi import HTTPException

    mock_prop = {
        "_id": "prop1", "id": "prop1",
        "owner_id": "real_owner",
        "nft_token_id": 0,
        "title": "Test"
    }

    with patch("app.services.marketplace_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_prop
        try:
            await list_property_service("prop1", 1.5, {"_id": "hacker"})
            assert False, "Should raise 403"
        except HTTPException as e:
            assert e.status_code == 403
            print("[PASS] 403 raised for non-owner.")

# ─── Test 3: list_property_service — no NFT check ────────────────────────────
async def test_list_no_nft_check():
    print("[START] Testing listing requires minted NFT...")
    from app.services.marketplace_service import list_property_service
    from fastapi import HTTPException

    mock_prop = {
        "_id": "prop1", "id": "prop1",
        "owner_id": "user1",
        "title": "Test"
        # No nft_token_id
    }

    with patch("app.services.marketplace_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_prop
        try:
            await list_property_service("prop1", 1.5, {"_id": "user1"})
            assert False, "Should raise 400"
        except HTTPException as e:
            assert e.status_code == 400
            print("[PASS] 400 raised for non-minted property.")

# ─── Test 4: list_property_service — success path ────────────────────────────
async def test_list_success():
    print("[START] Testing successful listing preparation...")
    from app.services.marketplace_service import list_property_service

    mock_prop = {
        "_id": "prop1", "id": "prop1",
        "owner_id": "user1",
        "nft_token_id": 3,
        "title": "Sea View Flat"
    }

    with patch("app.services.marketplace_service.get_property_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_prop
        with patch("app.services.marketplace_service.update_property", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = True
            result = await list_property_service("prop1", 2.5, {"_id": "user1"})

    print(f"[INFO] Result: {result}")
    assert result["price_matic"] == 2.5
    assert result["price_wei"] == int(2.5 * 1e18)
    assert result["nft_token_id"] == 3
    assert "frontend_call" in result
    assert result["frontend_call"]["function"] == "listProperty"
    print("[PASS] Listing returns correct MetaMask call data.")

async def main():
    test_get_listing_offline()
    await test_list_ownership_check()
    await test_list_no_nft_check()
    await test_list_success()
    print("\n[END] All Marketplace Tests Passed!")

if __name__ == "__main__":
    asyncio.run(main())
