from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.services.realtime_service import manager

router = APIRouter(tags=["Health & System Status"])


@router.get(
    "/health",
    summary="Basic Health Check",
    description="Returns simple healthy status for uptime monitors and load balancers.",
)
def health_check():
    return {"status": "healthy"}


@router.get(
    "/api/v1/system/status",
    summary="Comprehensive System Status",
    description="Inspects API status, database connectivity, and active WebSocket connection count.",
)
def system_status(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "operational" if db_status == "connected" else "degraded",
        "components": {
            "api": "healthy",
            "database": db_status,
            "websocket_connections": len(manager.all_connections),
        },
    }
