from app.integrations.marketplace import get_listing, list_property_backend
from app.repository.property_repo import get_property_by_id, get_all_properties, update_property
from app.core.config import settings
from fastapi import HTTPException

async def get_all_listings_service() -> list:
    """
    Returns all properties that are listed for sale on the marketplace.
    Combines MongoDB metadata with on-chain listing status.
    """
    all_props = await get_all_properties()
    nft_address = getattr(settings, "NFT_CONTRACT_ADDRESS", None)

    listings = []
    for prop in all_props:
        token_id = prop.get("nft_token_id")
        if token_id is None:
            continue  # Skip non-minted properties

        # Check on-chain listing status
        on_chain = get_listing(nft_address, token_id) if nft_address else {"active": False, "mode": "offline"}

        if on_chain.get("active"):
            listings.append({
                "property_id": prop.get("id"),
                "title": prop.get("title"),
                "address": prop.get("address"),
                "price_listed_matic": on_chain.get("price_matic"),
                "price_listed_wei": on_chain.get("price_wei"),
                "seller_wallet": on_chain.get("seller"),
                "nft_token_id": token_id,
                "location": prop.get("location"),
                "image_url": prop.get("image_url"),
                "on_chain": on_chain
            })

    return listings

async def get_property_listing_service(token_id: int) -> dict:
    """
    Returns the on-chain listing status for a specific token.
    """
    nft_address = getattr(settings, "NFT_CONTRACT_ADDRESS", None)
    if not nft_address:
        return {"token_id": token_id, "active": False, "mode": "offline",
                "message": "NFT_CONTRACT_ADDRESS not configured."}

    on_chain = get_listing(nft_address, token_id)
    return {"token_id": token_id, **on_chain}

async def list_property_service(property_id: str, price_matic: float, current_user: dict) -> dict:
    """
    Backend-assisted listing: stores listing intent in MongoDB.
    The actual on-chain listing should be done by the frontend via MetaMask.
    This endpoint records the intent and returns the data needed for the frontend call.
    """
    prop = await get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if str(prop.get("owner_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Only the owner can list this property")

    if not prop.get("nft_token_id") and prop.get("nft_token_id") != 0:
        raise HTTPException(status_code=400, detail="Property must be minted as NFT before listing")

    price_wei = int(price_matic * 1e18)
    nft_address = getattr(settings, "NFT_CONTRACT_ADDRESS", None)
    marketplace_address = getattr(settings, "MARKETPLACE_ADDRESS", None)

    # Save listing intent to DB
    await update_property(property_id, {
        "listing_price_matic": price_matic,
        "listing_price_wei": price_wei,
        "listing_status": "pending"
    })

    return {
        "property_id": property_id,
        "nft_token_id": prop.get("nft_token_id"),
        "price_matic": price_matic,
        "price_wei": price_wei,
        "nft_contract_address": nft_address,
        "marketplace_contract_address": marketplace_address,
        "message": "Use this data to call listProperty() via MetaMask on the frontend.",
        "frontend_call": {
            "function": "listProperty",
            "args": [nft_address, prop.get("nft_token_id"), price_wei]
        }
    }
