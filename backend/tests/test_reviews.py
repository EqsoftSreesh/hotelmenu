import time
from fastapi.testclient import TestClient


def test_submit_menu_item_review(client: TestClient, test_menu_item, test_location):
    payload = {
        "customer_name": "Alice Wonderland",
        "customer_identifier": "client-test-uuid-1",
        "menu_item_id": test_menu_item.id,
        "location_id": test_location.id,
        "rating": 5,
        "review_text": "Exquisite garlic bread!",
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["rating"] == 5

    # Verify menu item rating and count updated
    item_res = client.get(f"/api/v1/menu-items/{test_menu_item.id}")
    assert item_res.status_code == 200
    assert item_res.json()["data"]["review_count"] >= 1
    assert item_res.json()["data"]["rating"] >= 1.0


def test_submit_staff_review(client: TestClient, test_staff, test_location):
    payload = {
        "customer_name": "Bob Builder",
        "customer_identifier": "client-test-uuid-2",
        "staff_id": test_staff.id,
        "location_id": test_location.id,
        "rating": 4,
        "review_text": "Very attentive and warm service.",
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True

    # Verify staff ratings updated
    staff_res = client.get("/api/v1/staff")
    assert staff_res.status_code == 200
    matching = [s for s in staff_res.json()["data"] if s["id"] == test_staff.id]
    assert len(matching) == 1
    assert matching[0]["average_rating"] == 4.0


def test_invalid_review_rating_validation(client: TestClient):
    # Rating 6 (out of range)
    payload = {
        "customer_identifier": "client-test-uuid-3",
        "rating": 6,
        "review_text": "Way too high rating",
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 422

    # Rating 0 (out of range)
    payload["rating"] = 0
    response2 = client.post("/api/v1/reviews", json=payload)
    assert response2.status_code == 422


def test_review_anti_spam_cooldown(client: TestClient):
    payload = {
        "customer_name": "Spam Tester",
        "customer_identifier": "spam-client-id",
        "rating": 5,
        "review_text": "First quick review",
    }
    # First submit succeeds
    res1 = client.post("/api/v1/reviews", json=payload)
    assert res1.status_code == 201

    # Immediate second submit should trigger cooldown (429)
    res2 = client.post("/api/v1/reviews", json=payload)
    assert res2.status_code == 429
    assert res2.json()["error_code"] == "REVIEW_COOLDOWN"


def test_admin_review_moderation(client: TestClient, admin_headers):
    # 0. Create a review first
    client.post(
        "/api/v1/reviews",
        json={
            "customer_name": "Mod Tester",
            "customer_identifier": "mod-test-client-unique",
            "rating": 4,
            "review_text": "Good atmosphere",
        },
    )

    # 1. List reviews
    list_res = client.get("/api/v1/admin/reviews", headers=admin_headers)
    assert list_res.status_code == 200
    reviews = list_res.json()["data"]
    assert len(reviews) >= 1
    review_id = reviews[0]["id"]

    # 2. Toggle visibility
    vis_res = client.patch(
        f"/api/v1/admin/reviews/{review_id}/visibility",
        json={"is_visible": False},
        headers=admin_headers,
    )
    assert vis_res.status_code == 200
    assert vis_res.json()["data"]["is_visible"] is False

    # 3. Toggle approval
    app_res = client.patch(
        f"/api/v1/admin/reviews/{review_id}/approve",
        json={"is_approved": False},
        headers=admin_headers,
    )
    assert app_res.status_code == 200
    assert app_res.json()["data"]["is_approved"] is False
