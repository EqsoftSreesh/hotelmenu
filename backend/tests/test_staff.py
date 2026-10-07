from fastapi.testclient import TestClient


def test_public_get_staff(client: TestClient, test_staff):
    response = client.get("/api/v1/staff")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Employee code must not be exposed to public customers
    for s in data["data"]:
        assert "employee_code" not in s
        assert "name" in s
        assert "designation" in s


def test_admin_staff_crud(client: TestClient, admin_headers):
    # Create staff
    payload = {
        "name": "Tom Hollander",
        "employee_code": "EMP-999",
        "designation": "Bartender",
        "is_active": True,
    }
    create_res = client.post("/api/v1/admin/staff", json=payload, headers=admin_headers)
    assert create_res.status_code == 201
    staff_id = create_res.json()["data"]["id"]

    # Try duplicate code (should fail with 409)
    dup_res = client.post("/api/v1/admin/staff", json=payload, headers=admin_headers)
    assert dup_res.status_code == 409

    # Update staff
    up_res = client.put(
        f"/api/v1/admin/staff/{staff_id}",
        json={"name": "Thomas Hollander"},
        headers=admin_headers,
    )
    assert up_res.status_code == 200
    assert up_res.json()["data"]["name"] == "Thomas Hollander"

    # Get staff rating distribution
    rate_res = client.get(f"/api/v1/admin/staff/{staff_id}/ratings", headers=admin_headers)
    assert rate_res.status_code == 200
    assert "distribution" in rate_res.json()["data"]

    # Soft delete staff
    del_res = client.delete(f"/api/v1/admin/staff/{staff_id}", headers=admin_headers)
    assert del_res.status_code == 200
