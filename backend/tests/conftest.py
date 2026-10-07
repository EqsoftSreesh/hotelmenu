import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_hotel_menu.db"
os.environ["JWT_SECRET_KEY"] = "test_jwt_secret_key_1234567890_test_key"
os.environ["REVIEW_COOLDOWN_SECONDS"] = "2"
os.environ["REVIEW_RATE_LIMIT_PER_HOUR"] = "5"

from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.admin import Admin
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.staff import Staff
from app.models.location import Location
from app.models.qr_code import QRCode
from app.models.menu_version import MenuVersion
from app.utils.qr_generator import generate_secure_token

TEST_DB_URL = "sqlite:///./test_hotel_menu.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_hotel_menu.db"):
        try:
            os.remove("./test_hotel_menu.db")
        except OSError:
            pass


@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Initialize menu version if absent
    if not session.query(MenuVersion).filter(MenuVersion.key == "global").first():
        session.add(MenuVersion(key="global", version=1))
        session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_admin(db):
    admin = db.query(Admin).filter(Admin.email == "testadmin@example.com").first()
    if not admin:
        admin = Admin(
            name="Test Administrator",
            email="testadmin@example.com",
            password_hash=hash_password("adminpass123"),
            role="super_admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    return admin


@pytest.fixture
def admin_headers(test_admin):
    token = create_access_token(data={"sub": test_admin.id, "role": test_admin.role})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_category(db):
    cat = Category(
        name="Test Starters",
        slug="test-starters",
        description="Delicious starter bites",
        display_order=1,
        is_active=True,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture
def test_menu_item(db, test_category):
    item = MenuItem(
        category_id=test_category.id,
        name="Test Garlic Bread",
        slug="test-garlic-bread",
        short_description="Crispy toast with garlic butter",
        description="Freshly toasted sourdough with roasted garlic butter and Italian herbs.",
        price=6.50,
        is_available=True,
        is_featured=True,
        is_popular=True,
        display_order=1,
        is_active=True,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@pytest.fixture
def test_location(db):
    token = generate_secure_token(12)
    loc = Location(
        name="Table 99",
        location_type="TABLE",
        table_number="99",
        qr_token=token,
        is_active=True,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)

    qr = QRCode(location_id=loc.id, token=token, qr_image_url="/uploads/qrcodes/test.png", is_active=True)
    db.add(qr)
    db.commit()
    return loc


@pytest.fixture
def test_staff(db):
    st = Staff(
        name="Jane Waiter",
        employee_code="STAFF-TEST-001",
        designation="Senior Server",
        average_rating=0.0,
        total_ratings=0,
        is_active=True,
    )
    db.add(st)
    db.commit()
    db.refresh(st)
    return st
