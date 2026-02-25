import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.base import Base

def _generate_security_key():
    return f"AX-{uuid.uuid4().hex[:24].upper()}"

class UserDB(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    username = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    wallet_address = Column(String, unique=True, index=True, nullable=True)
    email_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    nonce = Column(String, nullable=True)
    role = Column(String, default="user")
    security_key = Column(String, nullable=True, default=_generate_security_key)
    preferences = Column(Text, nullable=True, default='{"price_alerts":true,"zone_intel":true,"marketplace":false,"ai_predictions":true}')
    created_at = Column(DateTime, default=datetime.utcnow)

class User(BaseModel):
    id: Optional[str] = None
    email: Optional[EmailStr] = None
    password_hash: Optional[str] = None
    username: Optional[str] = None
    google_id: Optional[str] = None
    wallet_address: Optional[str] = None
    email_verified: bool = False
    verification_code: Optional[str] = None
    nonce: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    role: str = "user"
    security_key: Optional[str] = None
    preferences: Optional[str] = None

    class Config:
        from_attributes = True

