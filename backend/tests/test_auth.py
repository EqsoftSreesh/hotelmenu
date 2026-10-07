from fastapi.testclient import TestClient


def test_admin_login_success(client: TestClient, test_admin):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@example.com", "password": "adminpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["admin"]["email"] == "testadmin@example.com"
    assert data["admin"]["role"] == "super_admin"


def test_admin_login_wrong_password(client: TestClient, test_admin):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@example.com", "password": "incorrect_password"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "INVALID_CREDENTIALS"


def test_admin_login_nonexistent_email(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False


def test_get_current_admin(client: TestClient, admin_headers):
    response = client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testadmin@example.com"


def test_unauthorized_access(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "TOKEN_MISSING"


def test_invalid_token(client: TestClient):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "INVALID_TOKEN"
