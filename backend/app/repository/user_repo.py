from app.models.user_model import UserDB
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy import update

def _to_dict(user: UserDB):
    if not user:
        return None
    d = user.__dict__.copy()
    d["_id"] = str(user.id)
    d.pop("_sa_instance_state", None)
    return d

async def get_user_by_email(email: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserDB).where(UserDB.email == email))
        return _to_dict(result.scalars().first())

async def get_user_by_google_id(google_id: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserDB).where(UserDB.google_id == google_id))
        return _to_dict(result.scalars().first())

async def get_user_by_wallet(wallet: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserDB).where(UserDB.wallet_address == wallet))
        return _to_dict(result.scalars().first())

async def get_user_by_id(user_id: str):
    from uuid import UUID
    async with AsyncSessionLocal() as session:
        try:
            uid = UUID(user_id) if isinstance(user_id, str) else user_id
            result = await session.execute(select(UserDB).where(UserDB.id == uid))
            return _to_dict(result.scalars().first())
        except:
            return None

async def create_user(user_data: dict):
    async with AsyncSessionLocal() as session:
        user = UserDB(**user_data)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return str(user.id)

async def update_user(query: dict, update_data: dict):
    async with AsyncSessionLocal() as session:
        stmt = update(UserDB)
        if "email" in query:
            stmt = stmt.where(UserDB.email == query["email"])
        elif "wallet_address" in query:
            stmt = stmt.where(UserDB.wallet_address == query["wallet_address"])
        elif "_id" in query:
            stmt = stmt.where(UserDB.id == query["_id"])
            
        stmt = stmt.values(**update_data)
        await session.execute(stmt)
        await session.commit()
