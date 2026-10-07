from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedError, ForbiddenError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    if "sub" in to_encode and to_encode["sub"] is not None:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired", error_code="TOKEN_EXPIRED")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token", error_code="INVALID_TOKEN")


def get_current_admin(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Dependency to retrieve and validate the authenticated admin."""
    from app.models.admin import Admin

    if not token:
        raise UnauthorizedError("Authentication token is missing", error_code="TOKEN_MISSING")

    payload = decode_access_token(token)
    sub = payload.get("sub")
    if sub is None:
        raise UnauthorizedError("Invalid token payload", error_code="INVALID_TOKEN_PAYLOAD")

    try:
        admin_id = int(sub)
    except (ValueError, TypeError):
        raise UnauthorizedError("Invalid token subject", error_code="INVALID_TOKEN_PAYLOAD")

    admin = db.query(Admin).filter(Admin.id == admin_id, Admin.is_active == True).first()
    if not admin:
        raise UnauthorizedError("Admin user not found or inactive", error_code="ADMIN_NOT_FOUND")

    return admin


def get_current_super_admin(
    current_admin=Depends(get_current_admin)
):
    """Dependency ensuring the admin has the 'super_admin' role."""
    if current_admin.role != "super_admin":
        raise ForbiddenError("Super admin privileges required", error_code="SUPER_ADMIN_REQUIRED")
    return current_admin
