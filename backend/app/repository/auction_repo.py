from app.models.auction_model import AuctionDB, BidDB
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy import update, desc
from typing import List, Optional
from datetime import datetime


def _auction_to_dict(auction: AuctionDB) -> Optional[dict]:
    if not auction:
        return None
    d = auction.__dict__.copy()
    d["id"] = str(auction.id)
    d["property_id"] = str(auction.property_id)
    d.pop("_sa_instance_state", None)
    return d


def _bid_to_dict(bid: BidDB) -> Optional[dict]:
    if not bid:
        return None
    d = bid.__dict__.copy()
    d["id"] = str(bid.id)
    d["auction_id"] = str(bid.auction_id)
    d.pop("_sa_instance_state", None)
    return d


async def create_auction(data: dict) -> dict:
    import uuid
    if "property_id" in data and isinstance(data["property_id"], str):
        data["property_id"] = uuid.UUID(data["property_id"])
    async with AsyncSessionLocal() as session:
        auction = AuctionDB(**data)
        session.add(auction)
        await session.commit()
        await session.refresh(auction)
        return _auction_to_dict(auction)


async def get_auction_by_id(auction_id: str) -> Optional[dict]:
    import uuid
    try:
        if isinstance(auction_id, str):
            auction_id = uuid.UUID(auction_id)
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(AuctionDB).where(AuctionDB.id == auction_id)
            )
            return _auction_to_dict(result.scalars().first())
    except Exception:
        return None


async def get_active_auctions() -> List[dict]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AuctionDB)
            .where(AuctionDB.status == "active")
            .order_by(desc(AuctionDB.created_at))
        )
        return [_auction_to_dict(a) for a in result.scalars().all()]


async def get_auctions_by_property(property_id: str) -> List[dict]:
    import uuid
    if isinstance(property_id, str):
        try:
            property_id = uuid.UUID(property_id)
        except ValueError:
            pass
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AuctionDB)
            .where(AuctionDB.property_id == property_id)
            .order_by(desc(AuctionDB.created_at))
        )
        return [_auction_to_dict(a) for a in result.scalars().all()]


async def update_auction(auction_id: str, data: dict) -> bool:
    import uuid
    try:
        if isinstance(auction_id, str):
            auction_id = uuid.UUID(auction_id)
        data["updated_at"] = datetime.utcnow()
        async with AsyncSessionLocal() as session:
            stmt = update(AuctionDB).where(AuctionDB.id == auction_id).values(**data)
            result = await session.execute(stmt)
            await session.commit()
            return result.rowcount > 0
    except Exception:
        return False


async def create_bid(data: dict) -> dict:
    import uuid
    if "auction_id" in data and isinstance(data["auction_id"], str):
        data["auction_id"] = uuid.UUID(data["auction_id"])
    async with AsyncSessionLocal() as session:
        bid = BidDB(**data)
        session.add(bid)
        await session.commit()
        await session.refresh(bid)
        return _bid_to_dict(bid)


async def get_bids_for_auction(auction_id: str) -> List[dict]:
    import uuid
    if isinstance(auction_id, str):
        try:
            auction_id = uuid.UUID(auction_id)
        except ValueError:
            pass
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(BidDB)
            .where(BidDB.auction_id == auction_id)
            .order_by(desc(BidDB.amount))
        )
        return [_bid_to_dict(b) for b in result.scalars().all()]


async def get_auctions_by_user(user_id: str, wallet: str = None) -> List[dict]:
    async with AsyncSessionLocal() as session:
        from sqlalchemy import or_
        filters = [AuctionDB.seller_id == user_id]
        if wallet:
            filters.append(AuctionDB.seller_id == wallet)
            
        result = await session.execute(
            select(AuctionDB)
            .where(or_(*filters))
            .order_by(desc(AuctionDB.created_at))
        )
        return [_auction_to_dict(a) for a in result.scalars().all()]


async def get_bids_by_user(user_id: str, wallet: str = None) -> List[dict]:
    async with AsyncSessionLocal() as session:
        from sqlalchemy import or_
        filters = [BidDB.bidder_id == user_id]
        if wallet:
            filters.append(BidDB.bidder_id == wallet)
            filters.append(BidDB.bidder_wallet == wallet)

        # Join with AuctionDB to get property_id
        stmt = (
            select(BidDB, AuctionDB.property_id)
            .join(AuctionDB, BidDB.auction_id == AuctionDB.id)
            .where(or_(*filters))
            .order_by(desc(BidDB.created_at))
        )
        
        result = await session.execute(stmt)
        bids_with_props = []
        for row in result:
            bid, prop_id = row
            bid_dict = _bid_to_dict(bid)
            bid_dict["property_id"] = str(prop_id)
            bids_with_props.append(bid_dict)
            
        return bids_with_props

