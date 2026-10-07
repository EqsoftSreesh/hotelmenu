from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.review import Review, ReviewImage
from app.models.menu_item import MenuItem
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, db: Session):
        super().__init__(Review, db)

    def get_with_details(self, id: int) -> Optional[Review]:
        return (
            self.db.query(Review)
            .options(
                joinedload(Review.images),
                joinedload(Review.menu_item),
                joinedload(Review.staff),
                joinedload(Review.location),
            )
            .filter(Review.id == id)
            .first()
        )

    def filter_reviews(
        self,
        review_type: Optional[str] = None,
        menu_item_id: Optional[int] = None,
        staff_id: Optional[int] = None,
        location_id: Optional[int] = None,
        is_approved: Optional[bool] = None,
        is_visible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Review], int]:
        query = self.db.query(Review).options(
            joinedload(Review.images),
            joinedload(Review.menu_item),
            joinedload(Review.staff),
            joinedload(Review.location),
        )

        if review_type:
            query = query.filter(Review.review_type == review_type)
        if menu_item_id:
            query = query.filter(Review.menu_item_id == menu_item_id)
        if staff_id:
            query = query.filter(Review.staff_id == staff_id)
        if location_id:
            query = query.filter(Review.location_id == location_id)
        if is_approved is not None:
            query = query.filter(Review.is_approved == is_approved)
        if is_visible is not None:
            query = query.filter(Review.is_visible == is_visible)

        total = query.count()
        reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        return reviews, total

    def add_review_with_images(self, review: Review, image_urls: List[str]) -> Review:
        self.db.add(review)
        self.db.flush()

        for url in (image_urls or []):
            rev_img = ReviewImage(review_id=review.id, image_url=url)
            self.db.add(rev_img)

        self.db.commit()
        self.db.refresh(review)
        return review

    def recalculate_menu_item_ratings(self, menu_item_id: int) -> None:
        item = self.db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
        if not item:
            return

        stats = (
            self.db.query(
                func.count(Review.id).label("total"),
                func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            )
            .filter(
                Review.menu_item_id == menu_item_id,
                Review.is_approved == True,
                Review.is_visible == True,
            )
            .first()
        )

        item.review_count = stats.total or 0
        item.rating = round(float(stats.avg_rating or 0.0), 2)
        self.db.commit()
        self.db.refresh(item)

    def get_average_restaurant_rating(self) -> float:
        avg_rating = (
            self.db.query(func.coalesce(func.avg(Review.rating), 0.0))
            .filter(
                Review.review_type == "RESTAURANT",
                Review.is_approved == True,
                Review.is_visible == True,
            )
            .scalar()
        )
        return round(float(avg_rating or 0.0), 2)
