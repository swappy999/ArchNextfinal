import asyncio
from app.services.property_state.property_state_controller import update_property_state
from app.services.property_state.property_state_machine import PropertyEvent, PropertyState
from app.repository.property_repo import get_all_properties, update_property
from app.services.auction_service import place_bid_service, create_auction_service
from fastapi import HTTPException

async def verify():
    print("--- Starting Auction/Bidding Verification ---")
    
    # 1. Find or create a property to test
    props = await get_all_properties()
    if not props:
        print("No properties found. Please seed data first.")
        return
    
    target = props[0]
    prop_id = str(target['id'])
    owner_id = str(target['owner_id'])
    
    print(f"Testing on Property ID: {prop_id} (Owner: {owner_id})")
    
    # 2. Force state to SOLD
    print("Setting state to SOLD...")
    await update_property(prop_id, {"status": "sold"})
    
    # 3. Try to START AUCTION from SOLD (Should succeed now)
    print("Attempting to start auction from SOLD state...")
    mock_user = {"_id": owner_id, "id": owner_id, "email": "owner@test.com", "wallet_address": "0x123"}
    try:
        await create_auction_service(prop_id, 1000, 24, mock_user)
        print("[OK] Successfully transitioned from SOLD to AUCTION_ACTIVE.")
    except HTTPException as e:
        if "already has an active auction" in str(e.detail):
            print("[SKIP] Property already has an active auction, proceeding to bidding tests.")
        else:
            print(f"[FAIL] Transition from SOLD failed: {e.detail}")
            return
    except Exception as e:
        print(f"[FAIL] Transition from SOLD failed: {e}")
        return

    # 4. Try to PLACE BID
    # Need to find the auction ID we just created
    from app.repository.auction_repo import get_auctions_by_property
    auctions = await get_auctions_by_property(prop_id)
    active_auctions = [a for a in auctions if a['status'] == 'active']
    if not active_auctions:
        print("[FAIL] Could not find created auction.")
        return
    
    auction_id = str(active_auctions[0]['id'])
    print(f"Testing bids on Auction ID: {auction_id}")
    
    # 4a. Bid on own auction (Should FAIL)
    print("Attempting to bid on own auction (should fail)...")
    try:
        await place_bid_service(auction_id, 1500, "0xhash", mock_user)
        print("[FAIL] Self-bidding was allowed accidentally.")
    except HTTPException as e:
        safe_detail = e.detail.replace("\u20b9", "INR")
        print(f"[OK] Blocked self-bidding: {safe_detail}")

    # 4b. Bid too low (Should FAIL)
    print("Attempting to bid below reserve (should fail)...")
    other_user = {"_id": "other_id", "id": "other_id", "email": "other@test.com", "wallet_address": "0xabc"}
    try:
        await place_bid_service(auction_id, 500, "0xhash", other_user)
        print("[FAIL] Low bid was allowed accidentally.")
    except HTTPException as e:
        # Use .encode().decode() or just strip the symbol for console
        safe_detail = e.detail.replace("\u20b9", "INR")
        print(f"[OK] Blocked low bid: {safe_detail}")

    # 4d. Bid via property endpoint (Should SUCCEED)
    print("Attempting bid via property endpoint (/bid/{property_id})...")
    from app.api.routes.auction import place_bid_by_property
    from app.api.routes.auction import PlaceBidRequest
    
    try:
        body = PlaceBidRequest(amount=2000, tx_hash="0xprophash")
        res = await place_bid_by_property(prop_id, body, other_user)
        print(f"[OK] Property-based bid accepted: {res['message']}")
    except Exception as e:
        print(f"[FAIL] Property-based bid failed: {e}")

    print("--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(verify())
