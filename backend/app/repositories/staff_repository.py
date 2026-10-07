from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.staff import Staff
from app.models.review import Review
from app.repositories.base import BaseRepository


class StaffRepository(BaseRepository[Staff]):
    def __init__(self, db: Session):
        super().__init__(Staff, db)

    def get_by_employee_code(self, code: str) -> Optional[Staff]:
        return self.db.query(Staff).filter(Staff.employee_code == code).first()

    def get_active_staff(self) -> List[Staff]:
        return (
            self.db.query(Staff)
            .filter(Staff.is_active == True)
            .order_by(Staff.name.asc())
            .all()
        )

    def get_all_admin(self, skip: int = 0, limit: int = 100) -> List[Staff]:
        return (
            self.db.query(Staff)
            .order_by(Staff.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_rating_distribution(self, staff_id: int) -> Dict[str, int]:
        results = (
            self.db.query(Review.rating, func.count(Review.id))
            .filter(Review.staff_id == staff_id, Review.is_approved == True, Review.is_visible == True)
            .group_by(Review.rating)
            .all()
        )
        dist = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        for star, count in results:
            if 1 <= star <= 5:
                dist[str(star)] = count
        return dist

    def recalculate_ratings(self, staff_id: int) -> None:
        staff = self.get_by_id(staff_id)
        if not staff:
            return

        stats = (
            self.db.query(
                func.count(Review.id).label("total"),
                func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            )
            .filter(Review.staff_id == staff_id, Review.is_approved == True, Review.is_visible == True)
            .first()
        )

        staff.total_ratings = stats.total or 0
        staff.average_rating = round(float(stats.avg_rating or 0.0), 2)
        self.db.commit()
        self.db.refresh(staff)
