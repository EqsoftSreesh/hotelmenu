from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import Admin
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse
from app.schemas.common import ApiResponse
from app.services.banner_service import BannerService
from app.services.upload_service import upload_service
from app.core.exceptions import NotFoundError

public_router = APIRouter(prefix="/banners", tags=["Banners"])
admin_router = APIRouter(prefix="/admin/banners", tags=["Admin Banners"])


# ------------------ PUBLIC ENDPOINTS ------------------

@public_router.get(
    "",
    response_model=ApiResponse[List[BannerResponse]],
    summary="Get Active Banners (Customer)",
    description="Returns active promotional banners within valid date ranges for digital menu display.",
)
def get_active_banners(db: Session = Depends(get_db)):
    service = BannerService(db)
    banners = service.banner_repo.get_active_banners()
    data = [BannerResponse.model_validate(b) for b in banners]
    return ApiResponse(success=True, message="Banners fetched successfully", data=data)


# ------------------ ADMIN ENDPOINTS ------------------

@admin_router.get(
    "",
    response_model=ApiResponse[List[BannerResponse]],
    summary="List All Banners (Admin)",
    description="Lists all promotional banners for administrative management.",
)
def admin_list_banners(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    banners = service.banner_repo.get_all_admin(skip=skip, limit=limit)
    data = [BannerResponse.model_validate(b) for b in banners]
    return ApiResponse(success=True, message="Banners retrieved successfully", data=data)


@admin_router.get(
    "/{id}",
    response_model=ApiResponse[BannerResponse],
    summary="Get Banner by ID (Admin)",
    description="Retrieves single banner details.",
)
def admin_get_banner(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    banner = service.banner_repo.get_by_id(id)
    if not banner:
        raise NotFoundError("Banner not found", error_code="BANNER_NOT_FOUND")
    return ApiResponse(success=True, message="Banner retrieved successfully", data=BannerResponse.model_validate(banner))


@admin_router.post(
    "",
    response_model=ApiResponse[BannerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Banner (Admin)",
    description="Creates a new promotional banner.",
)
def admin_create_banner(
    data: BannerCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    banner = service.create_banner(data)
    return ApiResponse(success=True, message="Banner created successfully", data=BannerResponse.model_validate(banner))


@admin_router.put(
    "/{id}",
    response_model=ApiResponse[BannerResponse],
    summary="Update Banner (Admin)",
    description="Updates existing banner information.",
)
def admin_update_banner(
    id: int,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    banner = service.update_banner(id, data)
    return ApiResponse(success=True, message="Banner updated successfully", data=BannerResponse.model_validate(banner))


@admin_router.delete(
    "/{id}",
    response_model=ApiResponse[None],
    summary="Delete Banner (Admin)",
    description="Deletes a banner.",
)
def admin_delete_banner(
    id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    service.delete_banner(id)
    return ApiResponse(success=True, message="Banner deleted successfully")


@admin_router.post(
    "/{id}/image",
    response_model=ApiResponse[BannerResponse],
    summary="Upload Banner Image (Admin)",
    description="Uploads and updates banner image with MIME and format validation.",
)
async def admin_upload_banner_image(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    service = BannerService(db)
    banner = service.banner_repo.get_by_id(id)
    if not banner:
        raise NotFoundError("Banner not found", error_code="BANNER_NOT_FOUND")

    image_url = await upload_service.upload_image(file, subfolder="banners")
    banner.image_url = image_url
    service.banner_repo.update(banner)

    return ApiResponse(success=True, message="Banner image uploaded successfully", data=BannerResponse.model_validate(banner))
