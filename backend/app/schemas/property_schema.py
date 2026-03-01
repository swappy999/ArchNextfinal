from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    images: List[str] = []
    features: List[str] = []

class PropertyCreate(PropertyBase):
    latitude: float
    longitude: float
    predicted_price: Optional[float] = None
    is_verified: bool = False

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    # Updates to location would require lat/long inputs again
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    status: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: str
    owner_id: str
    location: Dict
    blockchain_hash: Optional[str] = None
    status: str
    is_nft: bool = False
    nft_token_id: Optional[int] = None
    predicted_price: Optional[float] = None
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # We can also expose lat/long as computed fields if needed, 
    # but returning raw location is fine for now.

    class Config:
        from_attributes = True
