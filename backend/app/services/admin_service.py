from typing import List
from sqlalchemy.orm import Session
from app.models.menu_item import MenuItem
from app.models.category import Category
from app.models.staff import Staff
from app.models.review import Review
from app.schemas.dashboard import DashboardStatsResponse
from app.schemas.menu_item import MenuItemResponse
from app.schemas.staff import StaffAdminResponse
from app.schemas.review import ReviewResponse
from app.repositories.menu_item_repository import MenuItemRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.staff_repository import StaffRepository
from app.repositories.review_repository import ReviewRepository


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.menu_item_repo = MenuItemRepository(db)
        self.category_repo = CategoryRepository(db)
        self.staff_repo = StaffRepository(db)
        self.review_repo = ReviewRepository(db)

    def get_dashboard_stats(self) -> DashboardStatsResponse:
        total_items = self.db.query(MenuItem).filter(MenuItem.is_active == True).count()
        available_items = self.menu_item_repo.count_available()
        out_of_stock_items = self.menu_item_repo.count_out_of_stock()
        total_categories = self.db.query(Category).filter(Category.is_active == True).count()
        total_staff = self.db.query(Staff).filter(Staff.is_active == True).count()
        total_reviews = self.db.query(Review).count()

        avg_restaurant_rating = self.review_repo.get_average_restaurant_rating()

        # Recent reviews (last 5)
        recent_reviews_db, _ = self.review_repo.filter_reviews(limit=5)
        recent_reviews = [
            ReviewResponse(
                id=r.id,
                customer_name=r.customer_name,
                customer_identifier=r.customer_identifier,
                review_type=r.review_type,
                menu_item_id=r.menu_item_id,
                staff_id=r.staff_id,
                location_id=r.location_id,
                rating=r.rating,
                review_text=r.review_text,
                is_approved=r.is_approved,
                is_visible=r.is_visible,
                created_at=r.created_at,
                updated_at=r.updated_at,
                images=[],
                menu_item_name=r.menu_item.name if r.menu_item else None,
                staff_name=r.staff.name if r.staff else None,
                location_name=r.location.name if r.location else None,
            )
            for r in recent_reviews_db
        ]

        # Popular menu items
        popular_items_db, _ = self.menu_item_repo.filter_items(is_popular=True, limit=5)
        popular_items = [
            MenuItemResponse.model_validate(item) for item in popular_items_db
        ]

        # Top staff by rating
        top_staff_db = (
            self.db.query(Staff)
            .filter(Staff.is_active == True)
            .order_by(Staff.average_rating.desc(), Staff.total_ratings.desc())
            .limit(5)
            .all()
        )
        top_staff = [
            StaffAdminResponse.model_validate(s) for s in top_staff_db
        ]

        return DashboardStatsResponse(
            total_menu_items=total_items,
            available_items=available_items,
            out_of_stock_items=out_of_stock_items,
            total_categories=total_categories,
            total_staff=total_staff,
            total_reviews=total_reviews,
            average_restaurant_rating=avg_restaurant_rating,
            recent_reviews=recent_reviews,
            popular_items=popular_items,
            top_staff=top_staff,
        )
