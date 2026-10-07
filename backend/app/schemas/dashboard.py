from typing import List
from pydantic import BaseModel
from app.schemas.menu_item import MenuItemResponse
from app.schemas.staff import StaffAdminResponse
from app.schemas.review import ReviewResponse


class DashboardStatsResponse(BaseModel):
    total_menu_items: int
    available_items: int
    out_of_stock_items: int
    total_categories: int
    total_staff: int
    total_reviews: int
    average_restaurant_rating: float
    recent_reviews: List[ReviewResponse] = []
    popular_items: List[MenuItemResponse] = []
    top_staff: List[StaffAdminResponse] = []
