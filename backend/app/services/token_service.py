from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings
from app.core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

from sqlalchemy import Column, String, DateTime
from app.models.base import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select

class TokenBlacklistDB(Base):
    __tablename__ = "token_blacklist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String, unique=True, index=True)
    blacklisted_on = Column(DateTime, default=datetime.utcnow)

async def blacklist_token(token: str):
    async with AsyncSessionLocal() as session:
        entry = TokenBlacklistDB(token=token, blacklisted_on=datetime.utcnow())
        session.add(entry)
        await session.commit()

async def is_token_blacklisted(token: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(TokenBlacklistDB).where(TokenBlacklistDB.token == token))
        return result.scalars().first() is not None
