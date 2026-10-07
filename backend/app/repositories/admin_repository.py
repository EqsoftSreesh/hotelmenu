from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.admin import Admin
from app.repositories.base import BaseRepository


class AdminRepository(BaseRepository[Admin]):
    def __init__(self, db: Session):
        super().__init__(Admin, db)

    def get_by_email(self, email: str) -> Optional[Admin]:
        return self.db.query(Admin).filter(func.lower(Admin.email) == email.lower()).first()

    def get_all_active(self) -> List[Admin]:
        return self.db.query(Admin).filter(Admin.is_active == True).all()
