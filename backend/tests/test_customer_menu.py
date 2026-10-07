from fastapi.testclient import TestClient


def test_customer_menu_retrieval(client: TestClient, test_location, test_category, test_menu_item):
    response = client.get(f"/api/v1/menu/{test_location.qr_token}")
    assert response.status_code == 200
    data = response.json()
    assert "location" in data
    assert data["location"]["name"] == test_location.name
    assert "categories" in data
    assert "menu_items" in data
    assert len(data["menu_items"]) >= 1


def test_customer_menu_invalid_token(client: TestClient):
    response = client.get("/api/v1/menu/invalid_random_token_123")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "LOCATION_NOT_FOUND"


def test_customer_menu_version_polling(client: TestClient, test_location):
    response = client.get(f"/api/v1/menu/{test_location.qr_token}/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert isinstance(data["version"], int)
