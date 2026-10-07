from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.realtime_service import manager
from app.core.logging import logger

router = APIRouter(prefix="/ws", tags=["Real-time Live Stock WebSocket"])


@router.websocket("/menu/{qr_token}")
async def menu_live_websocket(websocket: WebSocket, qr_token: str):
    """
    WebSocket endpoint for real-time menu availability and catalog updates.
    Clients connect using their QR code token and receive instant updates when:
    - Admin toggles availability (OUT OF STOCK / AVAILABLE)
    - Menu items are modified
    - Categories or banners change
    """
    await manager.connect(websocket, qr_token)
    try:
        # Send initial connection acknowledgment
        await websocket.send_json({
            "event": "CONNECTED",
            "data": {
                "qr_token": qr_token,
                "message": "Connected to digital menu live stock updates.",
            },
        })

        while True:
            # Keep connection open; handle optional client heartbeats / ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, qr_token)
        logger.info(f"WebSocket client disconnected cleanly for token: {qr_token}")
    except Exception as e:
        manager.disconnect(websocket, qr_token)
        logger.warning(f"WebSocket client error: {e}")
