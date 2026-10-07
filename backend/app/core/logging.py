import logging
import sys
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Configure structured logging
LOG_FORMAT = "%(asctime)s | %(levelname)-7s | %(name)s:%(lineno)d | %(message)s"
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("hotel_menu")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        method = request.method

        # Skip logging health checks to reduce noise
        if path == "/health":
            return await call_next(request)

        try:
            response: Response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"{method} {path} - Status: {response.status_code} - IP: {client_ip} - Time: {process_time:.2f}ms"
            )
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"{method} {path} - ERROR: {str(exc)} - IP: {client_ip} - Time: {process_time:.2f}ms"
            )
            raise exc
