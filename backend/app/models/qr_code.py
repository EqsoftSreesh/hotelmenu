from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(100), unique=True, index=True, nullable=False)
    qr_image_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    location = relationship("Location", back_populates="qr_codes")

    def __repr__(self) -> str:
        return f"<QRCode(id={self.id}, location_id={self.location_id}, token='{self.token}')>"
