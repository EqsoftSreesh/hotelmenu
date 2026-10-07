from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    image: Optional[str] = None
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True


class CategoryCreate(CategoryBase):
    slug: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    image: Optional[str] = None
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class CategoryStatusUpdate(BaseModel):
    is_active: bool


class CategoryReorderItem(BaseModel):
    id: int
    display_order: int = Field(..., ge=0)


class CategoryResponse(CategoryBase):
    id: int
    slug: str
    item_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
