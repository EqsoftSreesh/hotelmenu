import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.menu_version import MenuVersion


class ConnectionManager:
    """Manages WebSocket connections and real-time broadcasts for menu updates."""

    def __init__(self):
        # Maps qr_token -> list of connected WebSockets
        self.location_connections: Dict[str, List[WebSocket]] = {}
        # Global list of all active WebSockets
        self.all_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, qr_token: str):
        await websocket.accept()
        if qr_token not in self.location_connections:
            self.location_connections[qr_token] = []
        self.location_connections[qr_token].append(websocket)
        self.all_connections.append(websocket)
        logger.info(f"WebSocket connected for token: {qr_token}. Total connected: {len(self.all_connections)}")

    def disconnect(self, websocket: WebSocket, qr_token: str):
        if qr_token in self.location_connections and websocket in self.location_connections[qr_token]:
            self.location_connections[qr_token].remove(websocket)
            if not self.location_connections[qr_token]:
                del self.location_connections[qr_token]
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
        logger.info(f"WebSocket disconnected for token: {qr_token}. Total connected: {len(self.all_connections)}")

    async def broadcast(self, event: str, data: Dict[str, Any]):
        """Broadcasts an event to all connected clients."""
        payload = {"event": event, "data": data}
        dead_connections = []
        for ws in list(self.all_connections):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.warning(f"Error sending WebSocket message: {e}")
                dead_connections.append(ws)

        for ws in dead_connections:
            if ws in self.all_connections:
                self.all_connections.remove(ws)

    async def broadcast_to_menu(self, qr_token: str, event: str, data: Dict[str, Any]):
        """Broadcasts an event only to clients listening on a specific qr_token."""
        payload = {"event": event, "data": data}
        clients = self.location_connections.get(qr_token, [])
        dead_connections = []
        for ws in list(clients):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.warning(f"Error sending WebSocket message to {qr_token}: {e}")
                dead_connections.append(ws)

        for ws in dead_connections:
            self.disconnect(ws, qr_token)

    @staticmethod
    def increment_menu_version(db: Session) -> int:
        """Increments and commits the global menu revision number."""
        record = db.query(MenuVersion).filter(MenuVersion.key == "global").first()
        if not record:
            record = MenuVersion(key="global", version=1)
            db.add(record)
        else:
            record.version += 1
        db.commit()
        db.refresh(record)
        return record.version


manager = ConnectionManager()
