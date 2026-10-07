from fastapi.testclient import TestClient


def test_public_get_menu_items(client: TestClient, test_menu_item):
    response = client.get("/api/v1/menu-items")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    assert data["pagination"]["total"] >= 1


def test_filter_and_search_menu_items(client: TestClient, test_menu_item):
    # Search by keyword
    response = client.get("/api/v1/menu-items?search=garlic")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1
    assert "Garlic" in data["data"][0]["name"]

    # Filter by price range
    response = client.get("/api/v1/menu-items?min_price=5&max_price=10")
    assert response.status_code == 200
    assert len(response.json()["data"]) >= 1

    # Filter by non-matching search
    response = client.get("/api/v1/menu-items?search=nonexistentfoodxyz")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 0


def test_get_menu_item_detail(client: TestClient, test_menu_item):
    # By ID
    response = client.get(f"/api/v1/menu-items/{test_menu_item.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["name"] == test_menu_item.name

    # By slug
    response = client.get(f"/api/v1/menu-items/{test_menu_item.slug}")
    assert response.status_code == 200
    assert response.json()["data"]["slug"] == test_menu_item.slug


def test_admin_create_menu_item(client: TestClient, admin_headers, test_category):
    payload = {
        "category_id": test_category.id,
        "name": "Bruschetta al Pomodoro",
        "short_description": "Toasted bread with seasoned tomatoes",
        "price": 8.00,
        "is_available": True,
        "is_featured": False,
        "is_popular": True,
        "display_order": 2,
    }
    response = client.post("/api/v1/admin/menu-items", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Bruschetta al Pomodoro"
    assert data["data"]["slug"] == "bruschetta-al-pomodoro"


def test_admin_live_availability_toggle(client: TestClient, admin_headers, test_menu_item):
    """Verifies live stock toggle: Marking item OUT OF STOCK and then AVAILABLE."""
    # 1. Mark OUT OF STOCK
    response = client.patch(
        f"/api/v1/admin/menu-items/{test_menu_item.id}/availability",
        json={"is_available": False},
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["is_available"] is False
    assert "OUT OF STOCK" in data["message"]

    # Verify public API reflects the OUT OF STOCK state immediately
    check_response = client.get(f"/api/v1/menu-items/{test_menu_item.id}")
    assert check_response.status_code == 200
    assert check_response.json()["data"]["is_available"] is False

    # 2. Mark AVAILABLE again
    response2 = client.patch(
        f"/api/v1/admin/menu-items/{test_menu_item.id}/availability",
        json={"is_available": True},
        headers=admin_headers,
    )
    assert response2.status_code == 200
    assert response2.json()["data"]["is_available"] is True


def test_admin_delete_menu_item(client: TestClient, admin_headers, test_menu_item):
    response = client.delete(f"/api/v1/admin/menu-items/{test_menu_item.id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Item should not be returned in public list now
    check_response = client.get(f"/api/v1/menu-items/{test_menu_item.id}")
    assert check_response.status_code == 404
