import os
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate
from app.repositories.location_repository import LocationRepository
from app.utils.qr_generator import generate_secure_token, create_qr_code_image
from app.core.config import settings
from app.core.exceptions import NotFoundError


class QRService:
    def __init__(self, db: Session):
        self.db = db
        self.location_repo = LocationRepository(db)

    def create_location(self, data: LocationCreate) -> Location:
        token = generate_secure_token(12)
        # Ensure token is unique
        while self.location_repo.get_by_qr_token(token) is not None:
            token = generate_secure_token(12)

        # Generate QR image file
        qr_output_dir = os.path.join(settings.UPLOAD_DIR, "qrcodes")
        qr_image_url = create_qr_code_image(token, settings.FRONTEND_URL, qr_output_dir)

        location = Location(
            name=data.name,
            location_type=data.location_type,
            table_number=data.table_number,
            room_number=data.room_number,
            qr_token=token,
            is_active=data.is_active,
        )
        saved_loc = self.location_repo.create(location)
        self.location_repo.save_qr_code(saved_loc.id, token, qr_image_url)
        return saved_loc

    def update_location(self, id: int, data: LocationUpdate) -> Location:
        location = self.location_repo.get_by_id(id)
        if not location:
            raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(location, field, value)

        return self.location_repo.update(location)

    def regenerate_qr(self, id: int) -> Location:
        location = self.location_repo.get_by_id(id)
        if not location:
            raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

        new_token = generate_secure_token(12)
        while self.location_repo.get_by_qr_token(new_token) is not None:
            new_token = generate_secure_token(12)

        qr_output_dir = os.path.join(settings.UPLOAD_DIR, "qrcodes")
        new_qr_image_url = create_qr_code_image(new_token, settings.FRONTEND_URL, qr_output_dir)

        location.qr_token = new_token
        self.location_repo.update(location)
        self.location_repo.save_qr_code(location.id, new_token, new_qr_image_url)
        return location

    def delete_location(self, id: int) -> None:
        location = self.location_repo.get_by_id(id)
        if not location:
            raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

        self.location_repo.delete(location)
