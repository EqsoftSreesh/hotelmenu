from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.location import Location
from app.models.qr_code import QRCode
from app.repositories.base import BaseRepository


class LocationRepository(BaseRepository[Location]):
    def __init__(self, db: Session):
        super().__init__(Location, db)

    def get_by_qr_token(self, token: str) -> Optional[Location]:
        return (
            self.db.query(Location)
            .options(joinedload(Location.qr_codes))
            .filter(Location.qr_token == token, Location.is_active == True)
            .first()
        )

    def get_with_qr(self, id: int) -> Optional[Location]:
        return (
            self.db.query(Location)
            .options(joinedload(Location.qr_codes))
            .filter(Location.id == id)
            .first()
        )

    def get_all_admin(self, skip: int = 0, limit: int = 100) -> List[Location]:
        return (
            self.db.query(Location)
            .options(joinedload(Location.qr_codes))
            .order_by(Location.id.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_active_qr_code(self, location_id: int) -> Optional[QRCode]:
        return (
            self.db.query(QRCode)
            .filter(QRCode.location_id == location_id, QRCode.is_active == True)
            .order_by(QRCode.id.desc())
            .first()
        )

    def save_qr_code(self, location_id: int, token: str, qr_image_url: str) -> QRCode:
        # Deactivate old QR codes for this location
        old_codes = self.db.query(QRCode).filter(QRCode.location_id == location_id).all()
        for c in old_codes:
            c.is_active = False

        qr_code = QRCode(
            location_id=location_id,
            token=token,
            qr_image_url=qr_image_url,
            is_active=True,
        )
        self.db.add(qr_code)
        self.db.commit()
        self.db.refresh(qr_code)
        return qr_code
