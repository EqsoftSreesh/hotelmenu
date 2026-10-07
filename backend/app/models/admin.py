from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base
from app.models.base import TimestampMixin


class Admin(Base, TimestampMixin):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="admin", nullable=False)  # "super_admin" or "admin"
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Admin(id={self.id}, email='{self.email}', role='{self.role}')>"
