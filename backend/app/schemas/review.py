from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ReviewImageResponse(BaseModel):
    id: int
    review_id: int
    image_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    customer_name: Optional[str] = Field(None, max_length=100)
    customer_identifier: Optional[str] = Field(None, max_length=100)
    review_type: Optional[str] = Field(None, pattern="^(MENU_ITEM|STAFF|RESTAURANT)$")
    menu_item_id: Optional[int] = None
    staff_id: Optional[int] = None
    location_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5 stars")
    review_text: Optional[str] = Field(None, max_length=1000)
    image_urls: Optional[List[str]] = Field(default=[], max_length=3)


class ReviewResponse(BaseModel):
    id: int
    customer_name: Optional[str] = None
    customer_identifier: str
    review_type: str
    menu_item_id: Optional[int] = None
    staff_id: Optional[int] = None
    location_id: Optional[int] = None
    rating: int
    review_text: Optional[str] = None
    is_approved: bool
    is_visible: bool
    created_at: datetime
    updated_at: datetime
    images: List[ReviewImageResponse] = []
    menu_item_name: Optional[str] = None
    staff_name: Optional[str] = None
    location_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewApprovalUpdate(BaseModel):
    is_approved: bool


class ReviewVisibilityUpdate(BaseModel):
    is_visible: bool
