from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base


class MenuVersion(Base):
    """Tracks global menu revision number for polling clients."""
    __tablename__ = "menu_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String(50), default="global", unique=True, index=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<MenuVersion(key='{self.key}', version={self.version})>"
