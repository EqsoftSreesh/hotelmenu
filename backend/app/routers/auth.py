from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_admin
from app.core.exceptions import UnauthorizedError
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.admin import AdminResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/auth", tags=["Admin Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin Login",
    description="Authenticates admin with email and password and returns a JWT access token.",
)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email.lower()).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise UnauthorizedError("Incorrect email or password", error_code="INVALID_CREDENTIALS")

    if not admin.is_active:
        raise UnauthorizedError("Admin account is deactivated", error_code="ACCOUNT_DEACTIVATED")

    access_token = create_access_token(data={"sub": admin.id, "role": admin.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin),
    )


@router.get(
    "/me",
    response_model=ApiResponse[AdminResponse],
    summary="Get Current Admin Profile",
    description="Returns the authenticated admin user's profile information.",
)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return ApiResponse(
        success=True,
        message="Current admin retrieved successfully",
        data=AdminResponse.model_validate(current_admin),
    )
