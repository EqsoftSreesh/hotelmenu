from fastapi.testclient import TestClient


def test_admin_dashboard_stats(client: TestClient, admin_headers):
    response = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    stats = data["data"]
    assert "total_menu_items" in stats
    assert "available_items" in stats
    assert "out_of_stock_items" in stats
    assert "total_categories" in stats
    assert "total_staff" in stats
    assert "total_reviews" in stats
    assert "average_restaurant_rating" in stats
    assert "recent_reviews" in stats
    assert "popular_items" in stats
    assert "top_staff" in stats


def test_admin_users_management(client: TestClient, admin_headers):
    # 1. List admin users
    list_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert list_res.status_code == 200
    admins = list_res.json()["data"]
    assert len(admins) >= 1

    # 2. Create secondary admin user
    payload = {
        "name": "Sub Admin",
        "email": "subadmin@example.com",
        "password": "subpassword123",
        "role": "admin",
    }
    create_res = client.post("/api/v1/admin/users", json=payload, headers=admin_headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["data"]["id"]

    # 3. Deactivate admin user
    del_res = client.delete(f"/api/v1/admin/users/{created_id}", headers=admin_headers)
    assert del_res.status_code == 200
