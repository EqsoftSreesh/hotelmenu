import pytest
from fastapi.testclient import TestClient


def test_websocket_menu_connection(client: TestClient):
    with client.websocket_connect("/api/v1/ws/menu/test-qr-token-123") as websocket:
        # Check initial acknowledgment
        data = websocket.receive_json()
        assert data["event"] == "CONNECTED"
        assert data["data"]["qr_token"] == "test-qr-token-123"

        # Check ping pong
        websocket.send_text("ping")
        pong = websocket.receive_text()
        assert pong == "pong"
