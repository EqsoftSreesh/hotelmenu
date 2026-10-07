from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Staff(Base, TimestampMixin):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    profile_image = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    total_ratings = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)

    # Relationships
    reviews = relationship("Review", back_populates="staff")

    def __repr__(self) -> str:
        return f"<Staff(id={self.id}, name='{self.name}', code='{self.employee_code}')>"
