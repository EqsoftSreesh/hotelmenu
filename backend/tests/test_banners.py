from fastapi.testclient import TestClient


def test_banner_crud(client: TestClient, admin_headers):
    # 1. Create banner
    payload = {
        "title": "Summer Festival",
        "subtitle": "Cool treats all day",
        "description": "Enjoy half-priced drinks",
        "image_url": "/uploads/banners/summer.jpg",
        "button_text": "Order Now",
        "button_link": "/menu",
        "display_order": 1,
        "is_active": True,
    }
    response = client.post("/api/v1/admin/banners", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    banner_id = data["data"]["id"]

    # 2. Get active banners (public)
    pub_res = client.get("/api/v1/banners")
    assert pub_res.status_code == 200
    assert any(b["id"] == banner_id for b in pub_res.json()["data"])

    # 3. Update banner
    up_res = client.put(
        f"/api/v1/admin/banners/{banner_id}",
        json={"title": "Monsoon Festival"},
        headers=admin_headers,
    )
    assert up_res.status_code == 200
    assert up_res.json()["data"]["title"] == "Monsoon Festival"

    # 4. Delete banner
    del_res = client.delete(f"/api/v1/admin/banners/{banner_id}", headers=admin_headers)
    assert del_res.status_code == 200
