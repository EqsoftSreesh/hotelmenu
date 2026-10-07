from fastapi.testclient import TestClient


def test_location_and_qr_management(client: TestClient, admin_headers):
    # 1. Create location
    payload = {
        "name": "Patio Table 05",
        "location_type": "TABLE",
        "table_number": "P05",
        "is_active": True,
    }
    response = client.post("/api/v1/admin/locations", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    location_id = data["data"]["id"]
    initial_token = data["data"]["qr_token"]
    assert initial_token is not None
    assert data["data"]["qr_image_url"] is not None

    # 2. Get QR info
    qr_res = client.get(f"/api/v1/admin/locations/{location_id}/qr", headers=admin_headers)
    assert qr_res.status_code == 200
    assert qr_res.json()["data"]["token"] == initial_token

    # 3. Regenerate QR code
    regen_res = client.post(f"/api/v1/admin/locations/{location_id}/generate-qr", headers=admin_headers)
    assert regen_res.status_code == 200
    new_token = regen_res.json()["data"]["qr_token"]
    assert new_token != initial_token

    # 4. Delete location
    del_res = client.delete(f"/api/v1/admin/locations/{location_id}", headers=admin_headers)
    assert del_res.status_code == 200
