from typing import Any, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self,
        message: str,
        error_code: str = "BAD_REQUEST",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        data: Optional[Any] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.data = data
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(message=message, error_code=error_code, status_code=status.HTTP_404_NOT_FOUND)


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists", error_code: str = "CONFLICT"):
        super().__init__(message=message, error_code=error_code, status_code=status.HTTP_409_CONFLICT)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Invalid credentials or token expired", error_code: str = "UNAUTHORIZED"):
        super().__init__(message=message, error_code=error_code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action", error_code: str = "FORBIDDEN"):
        super().__init__(message=message, error_code=error_code, status_code=status.HTTP_403_FORBIDDEN)


class RateLimitError(AppException):
    def __init__(self, message: str = "Too many requests. Please try again later.", error_code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(message=message, error_code=error_code, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    content = {
        "success": False,
        "message": exc.message,
        "error_code": exc.error_code,
    }
    if exc.data is not None:
        content["data"] = exc.data
    return JSONResponse(status_code=exc.status_code, content=content)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    first_error = errors[0]["msg"] if errors else "Validation error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": f"Validation error: {first_error}",
            "error_code": "VALIDATION_ERROR",
            "details": errors,
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "error_code": f"HTTP_{exc.status_code}",
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )
