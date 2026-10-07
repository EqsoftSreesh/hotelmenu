from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.banner import Banner
from app.repositories.base import BaseRepository


class BannerRepository(BaseRepository[Banner]):
    def __init__(self, db: Session):
        super().__init__(Banner, db)

    def get_active_banners(self) -> List[Banner]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(Banner)
            .filter(
                Banner.is_active == True,
                or_(Banner.start_date == None, Banner.start_date <= now),
                or_(Banner.end_date == None, Banner.end_date >= now),
            )
            .order_by(Banner.display_order.asc(), Banner.id.asc())
            .all()
        )

    def get_all_admin(self, skip: int = 0, limit: int = 100) -> List[Banner]:
        return (
            self.db.query(Banner)
            .order_by(Banner.display_order.asc(), Banner.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
