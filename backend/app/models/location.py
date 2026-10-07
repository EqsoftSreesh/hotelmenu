from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Location(Base, TimestampMixin):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    location_type = Column(String(50), nullable=False, default="TABLE")  # TABLE, ROOM, RESTAURANT, OTHER
    table_number = Column(String(50), nullable=True)
    room_number = Column(String(50), nullable=True)
    qr_token = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)

    # Relationships
    qr_codes = relationship("QRCode", back_populates="location", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="location")

    def __repr__(self) -> str:
        return f"<Location(id={self.id}, name='{self.name}', token='{self.qr_token}')>"
