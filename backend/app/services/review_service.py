from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.review import Review
from app.schemas.review import ReviewCreate
from app.repositories.review_repository import ReviewRepository
from app.repositories.menu_item_repository import MenuItemRepository
from app.repositories.staff_repository import StaffRepository
from app.repositories.location_repository import LocationRepository
from app.utils.rate_limiter import review_rate_limiter
from app.core.exceptions import NotFoundError, AppException
from app.core.config import settings


class ReviewService:
    def __init__(self, db: Session):
        self.db = db
        self.review_repo = ReviewRepository(db)
        self.menu_item_repo = MenuItemRepository(db)
        self.staff_repo = StaffRepository(db)
        self.location_repo = LocationRepository(db)

    def submit_review(self, data: ReviewCreate, client_ip: str) -> Review:
        # 1. Anti-spam rate limiting & cooldown
        identifier = data.customer_identifier or client_ip or "anonymous"
        review_rate_limiter.check_and_record(identifier)

        # 2. Determine review type if not explicitly set
        rev_type = data.review_type
        if not rev_type:
            if data.menu_item_id:
                rev_type = "MENU_ITEM"
            elif data.staff_id:
                rev_type = "STAFF"
            else:
                rev_type = "RESTAURANT"

        # 3. Validate existence of referenced entities
        if data.menu_item_id:
            item = self.menu_item_repo.get_by_id(data.menu_item_id)
            if not item:
                raise NotFoundError("Menu item not found", error_code="MENU_ITEM_NOT_FOUND")

        if data.staff_id:
            staff = self.staff_repo.get_by_id(data.staff_id)
            if not staff:
                raise NotFoundError("Staff member not found", error_code="STAFF_NOT_FOUND")

        if data.location_id:
            loc = self.location_repo.get_by_id(data.location_id)
            if not loc:
                raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

        # 4. Create review record
        review = Review(
            customer_name=data.customer_name,
            customer_identifier=identifier,
            review_type=rev_type,
            menu_item_id=data.menu_item_id,
            staff_id=data.staff_id,
            location_id=data.location_id,
            rating=data.rating,
            review_text=data.review_text,
            is_approved=settings.AUTO_APPROVE_REVIEWS,
            is_visible=True,
        )

        saved = self.review_repo.add_review_with_images(review, data.image_urls or [])

        # 5. Automatically recalculate item or staff ratings if approved
        if saved.is_approved and saved.is_visible:
            if saved.menu_item_id:
                self.review_repo.recalculate_menu_item_ratings(saved.menu_item_id)
            if saved.staff_id:
                self.staff_repo.recalculate_ratings(saved.staff_id)

        return saved

    def update_approval(self, id: int, is_approved: bool) -> Review:
        review = self.review_repo.get_by_id(id)
        if not review:
            raise NotFoundError("Review not found", error_code="REVIEW_NOT_FOUND")

        review.is_approved = is_approved
        self.review_repo.update(review)

        # Recalculate ratings
        if review.menu_item_id:
            self.review_repo.recalculate_menu_item_ratings(review.menu_item_id)
        if review.staff_id:
            self.staff_repo.recalculate_ratings(review.staff_id)

        return review

    def update_visibility(self, id: int, is_visible: bool) -> Review:
        review = self.review_repo.get_by_id(id)
        if not review:
            raise NotFoundError("Review not found", error_code="REVIEW_NOT_FOUND")

        review.is_visible = is_visible
        self.review_repo.update(review)

        # Recalculate ratings
        if review.menu_item_id:
            self.review_repo.recalculate_menu_item_ratings(review.menu_item_id)
        if review.staff_id:
            self.staff_repo.recalculate_ratings(review.staff_id)

        return review

    def delete_review(self, id: int) -> None:
        review = self.review_repo.get_by_id(id)
        if not review:
            raise NotFoundError("Review not found", error_code="REVIEW_NOT_FOUND")

        menu_item_id = review.menu_item_id
        staff_id = review.staff_id

        self.review_repo.delete(review)

        if menu_item_id:
            self.review_repo.recalculate_menu_item_ratings(menu_item_id)
        if staff_id:
            self.staff_repo.recalculate_ratings(staff_id)
