from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.services.marketplace_service import (
    get_all_listings_service,
    get_property_listing_service,
    list_property_service
)
from app.repository.property_repo import get_property_by_id, update_property
from fastapi import HTTPException

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

class ListingRequest(BaseModel):
    price_matic: float  # Price in MATIC

class BuyRequest(BaseModel):
    price: float  # Price in fiat/display currency

@router.get("/listings")
async def get_all_listings():
    """
    Returns all active on-chain property listings with metadata.
    Public endpoint — anyone can browse the marketplace.
    """
    return await get_all_listings_service()

@router.get("/property/{token_id}")
async def get_listing_status(token_id: int):
    """
    Returns the on-chain listing status for a specific NFT token.
    Public — anyone can check if a property is for sale.
    """
    return await get_property_listing_service(token_id)

@router.post("/list/{property_id}")
async def list_property(
    property_id: str,
    body: ListingRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Prepares a property listing and returns the data needed for MetaMask.
    
    Flow:
    1. Backend validates ownership and NFT status
    2. Returns contract call data for frontend MetaMask transaction
    3. Frontend calls listProperty() on-chain via MetaMask
    
    Note: Actual buying happens on-chain via MetaMask — no backend involvement.
    """
    return await list_property_service(property_id, body.price_matic, current_user)

@router.post("/buy/{listing_id}")
async def buy_listing(
    listing_id: str,
    body: BuyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Records a buy intent for On-Chain properties, or processes the purchase directly for Standard properties.
    """
    # 1. Fetch the property
    prop = await get_property_by_id(listing_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if prop.get("status") != "available":
        raise HTTPException(status_code=400, detail="Property is no longer available")

    wallet = current_user.get("wallet_address")
    if not wallet:
        wallet = current_user.get("email") # Fallback to email if no wallet connected
        
    user_id_or_wallet = str(current_user.get("id", current_user.get("_id", wallet)))

    # 2. Determine if it's considered "On-Chain"
    # To match the frontend simulation, we look for token_id presence
    has_token = prop.get("nft_token_id") is not None
    
    if has_token:
        # On-chain flow
        return {
            "listing_id": listing_id,
            "buyer_wallet": wallet,
            "price": body.price,
            "status": "pending_blockchain_confirmation",
            "message": "Use the marketplace contract `buyProperty(tokenId)` via MetaMask to complete this purchase.",
            "action_required": "METAMASK_TX",
            "is_nft": True
        }
    else:
        # Standard flow - immediately update DB
        success = await update_property(listing_id, {
            "owner_id": user_id_or_wallet,
            "status": "sold"
        })
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to process transaction")
            
        return {
            "listing_id": listing_id,
            "buyer": user_id_or_wallet,
            "price": body.price,
            "status": "completed",
            "message": "Asset acquired successfully. View in your portfolio.",
            "is_nft": False
        }

