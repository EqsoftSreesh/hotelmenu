from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict, Field


class StaffBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    employee_code: str = Field(..., min_length=1, max_length=50)
    profile_image: Optional[str] = None
    designation: str = Field(..., min_length=1, max_length=100)
    is_active: bool = True


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    employee_code: Optional[str] = Field(None, min_length=1, max_length=50)
    profile_image: Optional[str] = None
    designation: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None


class StaffPublicResponse(BaseModel):
    id: int
    name: str
    designation: str
    profile_image: Optional[str] = None
    average_rating: float

    model_config = ConfigDict(from_attributes=True)


class StaffAdminResponse(StaffBase):
    id: int
    average_rating: float
    total_ratings: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StaffRatingStats(BaseModel):
    average_rating: float
    total_ratings: int
    distribution: Dict[str, int]  # e.g. {"5": 90, "4": 20, "3": 8, "2": 4, "1": 2}
