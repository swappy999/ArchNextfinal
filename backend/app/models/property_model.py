import uuid
from sqlalchemy import Column, String, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.base import Base

class PropertyDB(Base):
    __tablename__ = "properties"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    owner_id = Column(String, index=True)
    blockchain_hash = Column(String, nullable=True)
    images = Column(JSON, default=list)
    features = Column(JSON, default=list)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Property(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    price: float
    location: dict
    owner_id: str
    blockchain_hash: Optional[str] = None
    images: List[str] = []
    features: List[str] = []
    status: str = "available"
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
