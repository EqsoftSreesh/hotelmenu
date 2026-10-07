from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=True)
    customer_identifier = Column(String(100), index=True, nullable=False)
    review_type = Column(String(50), nullable=False, default="RESTAURANT")  # MENU_ITEM, STAFF, RESTAURANT
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    review_text = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True, index=True, nullable=False)
    is_visible = Column(Boolean, default=True, index=True, nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    # Relationships
    menu_item = relationship("MenuItem", back_populates="reviews")
    staff = relationship("Staff", back_populates="reviews")
    location = relationship("Location", back_populates="reviews")
    images = relationship("ReviewImage", back_populates="review", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, type='{self.review_type}', rating={self.rating})>"


class ReviewImage(Base):
    __tablename__ = "review_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    review = relationship("Review", back_populates="images")

    def __repr__(self) -> str:
        return f"<ReviewImage(id={self.id}, review_id={self.review_id})>"
