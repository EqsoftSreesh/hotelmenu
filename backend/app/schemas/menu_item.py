from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.category import CategoryResponse
from app.schemas.review import ReviewResponse


class MenuItemBase(BaseModel):
    category_id: int
    name: str = Field(..., min_length=1, max_length=150)
    short_description: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., ge=0.0)
    image_url: Optional[str] = None
    is_available: bool = True
    is_featured: bool = False
    is_popular: bool = False
    is_bestseller: bool = False
    display_order: int = Field(default=0, ge=0)
    preparation_time: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=255)


class MenuItemCreate(MenuItemBase):
    slug: Optional[str] = None


class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    slug: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0.0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_popular: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)
    preparation_time: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class MenuItemAvailabilityUpdate(BaseModel):
    is_available: bool


class MenuItemResponse(MenuItemBase):
    id: int
    slug: str
    rating: float = 0.0
    review_count: int = 0
    is_active: bool = True
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MenuItemDetailResponse(MenuItemResponse):
    category: Optional[CategoryResponse] = None
    reviews: List[ReviewResponse] = []
