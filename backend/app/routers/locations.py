from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import Admin
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse
from app.schemas.qr_code import QRCodeResponse
from app.schemas.common import ApiResponse
from app.services.qr_service import QRService
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/admin/locations", tags=["Admin Locations & QR Codes"])


@router.get(
    "",
    response_model=ApiResponse[List[LocationResponse]],
    summary="List All Locations (Admin)",
    description="Lists all tables, rooms, and restaurant locations with their active QR tokens.",
)
def admin_list_locations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    locations = service.location_repo.get_all_admin(skip=skip, limit=limit)
    data = []
    for loc in locations:
        resp = LocationResponse.model_validate(loc)
        active_qr = service.location_repo.get_active_qr_code(loc.id)
        if active_qr:
            resp.qr_image_url = active_qr.qr_image_url
        data.append(resp)
    return ApiResponse(success=True, message="Locations retrieved successfully", data=data)


@router.get(
    "/{id}",
    response_model=ApiResponse[LocationResponse],
    summary="Get Location by ID (Admin)",
    description="Retrieves a specific location by ID.",
)
def admin_get_location(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    loc = service.location_repo.get_with_qr(id)
    if not loc:
        raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

    resp = LocationResponse.model_validate(loc)
    active_qr = service.location_repo.get_active_qr_code(loc.id)
    if active_qr:
        resp.qr_image_url = active_qr.qr_image_url
    return ApiResponse(success=True, message="Location retrieved successfully", data=resp)


@router.post(
    "",
    response_model=ApiResponse[LocationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Location & QR (Admin)",
    description="Creates a new location (table/room) and generates an associated QR code image with unique token.",
)
def admin_create_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    loc = service.create_location(data)
    resp = LocationResponse.model_validate(loc)
    active_qr = service.location_repo.get_active_qr_code(loc.id)
    if active_qr:
        resp.qr_image_url = active_qr.qr_image_url
    return ApiResponse(success=True, message="Location and QR code generated successfully", data=resp)


@router.put(
    "/{id}",
    response_model=ApiResponse[LocationResponse],
    summary="Update Location (Admin)",
    description="Updates location details.",
)
def admin_update_location(
    id: int,
    data: LocationUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    loc = service.update_location(id, data)
    resp = LocationResponse.model_validate(loc)
    active_qr = service.location_repo.get_active_qr_code(loc.id)
    if active_qr:
        resp.qr_image_url = active_qr.qr_image_url
    return ApiResponse(success=True, message="Location updated successfully", data=resp)


@router.delete(
    "/{id}",
    response_model=ApiResponse[None],
    summary="Delete Location (Admin)",
    description="Deletes a location and associated QR code.",
)
def admin_delete_location(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    service.delete_location(id)
    return ApiResponse(success=True, message="Location deleted successfully")


@router.post(
    "/{id}/generate-qr",
    response_model=ApiResponse[LocationResponse],
    summary="Regenerate QR Code (Admin)",
    description="Invalidates old QR token and generates a fresh secure token and QR image.",
)
def admin_regenerate_qr(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    loc = service.regenerate_qr(id)
    resp = LocationResponse.model_validate(loc)
    active_qr = service.location_repo.get_active_qr_code(loc.id)
    if active_qr:
        resp.qr_image_url = active_qr.qr_image_url
    return ApiResponse(success=True, message="QR code regenerated successfully", data=resp)


@router.get(
    "/{id}/qr",
    response_model=ApiResponse[QRCodeResponse],
    summary="Get Active QR Code Info (Admin)",
    description="Retrieves active QR code image URL and token details for download.",
)
def admin_get_qr_info(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = QRService(db)
    loc = service.location_repo.get_by_id(id)
    if not loc:
        raise NotFoundError("Location not found", error_code="LOCATION_NOT_FOUND")

    active_qr = service.location_repo.get_active_qr_code(id)
    if not active_qr:
        raise NotFoundError("No active QR code found for location", error_code="QR_NOT_FOUND")

    return ApiResponse(
        success=True,
        message="QR code retrieved successfully",
        data=QRCodeResponse.model_validate(active_qr),
    )
