from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.menu_service import MenuService
from app.schemas.customer_menu import CustomerMenuResponse, MenuVersionResponse
from app.models.menu_version import MenuVersion

router = APIRouter(prefix="/menu", tags=["Customer Menu"])


@router.get(
    "/{qr_token}",
    response_model=CustomerMenuResponse,
    summary="Get Digital Menu by QR Token",
    description="Fetches the full digital menu (location info, categories, banners, items, specials) using a QR code token without authentication.",
)
def get_customer_menu(qr_token: str, db: Session = Depends(get_db)):
    service = MenuService(db)
    return service.get_customer_menu(qr_token)


@router.get(
    "/{qr_token}/version",
    response_model=MenuVersionResponse,
    summary="Poll Menu Version",
    description="Returns current menu version number for fallback polling when WebSockets are unavailable.",
)
def get_menu_version(qr_token: str, db: Session = Depends(get_db)):
    record = db.query(MenuVersion).filter(MenuVersion.key == "global").first()
    version = record.version if record else 1
    return MenuVersionResponse(version=version)
