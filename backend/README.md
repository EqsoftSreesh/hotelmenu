# Hotel Digital Menu System — Backend API

Production-ready REST API and WebSocket backend for a Hotel Digital Menu / Restaurant Menu Display System built with **FastAPI**, **SQLAlchemy 2.x**, **Pydantic v2**, and **Alembic**.

> **Note**: This system is strictly a **Digital Menu + Review + Waitstaff Rating** system with live availability updates. It intentionally contains **NO** shopping cart, checkout, payment, or order tracking functionality.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Requirements](#3-requirements)
4. [Environment Setup](#4-environment-setup)
5. [Database Setup & Migrations](#5-database-setup--migrations)
6. [Seed Data](#6-seed-data)
7. [Running the Server](#7-running-the-server)
8. [API Documentation](#8-api-documentation)
9. [Admin Authentication](#9-admin-authentication)
10. [Live Availability & WebSockets](#10-live-availability--websockets)
11. [File Uploads](#11-file-uploads)
12. [QR Code Generation & Location Flow](#12-qr-code-generation--location-flow)
13. [Review & Anti-Spam System](#13-review--anti-spam-system)
14. [Testing](#14-testing)
15. [PostgreSQL Migration Guide](#15-postgresql-migration-guide)
16. [Production Deployment Instructions](#16-production-deployment-instructions)

---

## 1. Project Overview

The customer journey is as follows:
1. Customer enters hotel/restaurant and scans the QR code on their table or room.
2. QR code directs them to `https://frontend-domain.com/menu/{token}`.
3. Customer browses categorized dishes, searches menu items, views item descriptions, high-res photos, preparation time, tags, prices, and reviews.
4. If an item becomes **OUT OF STOCK**, the admin marks it so from the admin dashboard.
5. Connected customer screens receive real-time **WebSocket updates** immediately displaying the `OUT OF STOCK` badge without manual page refresh.
6. Customers can submit star ratings and feedback for food, staff, or restaurant ambiance (with anti-spam protection).

---

## 2. Architecture

```text
app/
├── core/
│   ├── config.py          # Pydantic v2 settings & environment variables
│   ├── database.py        # SQLAlchemy 2.0 engine, sessions & Base
│   ├── security.py        # Bcrypt password hashing & PyJWT token handling
│   ├── exceptions.py      # Centralized AppException and error handlers
│   └── logging.py         # Structured logging & request timing middleware
├── models/
│   ├── admin.py           # System administrators
│   ├── category.py        # Menu categories
│   ├── menu_item.py       # Menu items with availability flags
│   ├── banner.py          # Promotional banners
│   ├── staff.py           # Serving & waiting staff
│   ├── location.py        # Tables, rooms, and dining areas
│   ├── qr_code.py         # Secure QR token associations
│   ├── review.py          # Ratings & customer reviews (food, staff, venue)
│   └── menu_version.py    # Global revision counter for polling clients
├── schemas/               # Strict Pydantic v2 validation models
├── repositories/          # Isolated data access layer
├── services/              # Business logic, orchestration, broadcast & uploads
├── routers/               # FastAPI route definitions (Auth, Menu, Admin, WS)
├── utils/                 # QR image generator, slugifier, anti-spam rate limiter
└── main.py                # App entrypoint, CORS, static mounts, middlewares
```

---

## 3. Requirements

- Python 3.11+ or Python 3.12+
- `pip` package manager
- SQLite (built into Python, used for local development)
- PostgreSQL (optional, for production)

---

## 4. Environment Setup

Clone the repository and prepare the virtual environment:

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Copy the example environment configuration:

```bash
cp .env.example .env
```

Key configuration options in `.env`:
- `DATABASE_URL`: `sqlite:///./hotel_menu.db` (or PostgreSQL connection string)
- `JWT_SECRET_KEY`: Secure random key (minimum 32 characters)
- `JWT_ALGORITHM`: `HS256`
- `FRONTEND_URL`: URL of the Next.js frontend (e.g. `http://localhost:3000`)
- `ALLOWED_ORIGINS`: Comma-separated CORS allowed origins
- `UPLOAD_DIR`: Local folder for uploaded images (`uploads`)
- `REVIEW_RATE_LIMIT_PER_HOUR`: Maximum allowed reviews per hour per client
- `REVIEW_COOLDOWN_SECONDS`: Minimum cooldown interval between reviews (default 30s)

---

## 5. Database Setup & Migrations

The project uses **Alembic** to manage database schema migrations.

### Run Migrations:
```bash
alembic upgrade head
```

### Rollback Migration:
```bash
alembic downgrade -1
```

---

## 6. Seed Data

To populate initial categories, sample menu items, serving staff, tables with QR codes, banners, reviews, and a default Super Admin:

```bash
python seed.py
```

### Default Credentials:
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: `super_admin`

---

## 7. Running the Server

Start the Uvicorn development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be accessible at `http://localhost:8000`.

---

## 8. API Documentation

Interactive OpenAPI documentation is generated automatically by FastAPI:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 9. Admin Authentication

Admin routes are secured using JWT Bearer tokens.

### 1. Login:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "admin": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

### 2. Accessing Protected Endpoints:
Pass the header in subsequent requests:
```http
Authorization: Bearer <access_token>
```

---

## 10. Live Availability & WebSockets

### Live Stock Flow:
1. Admin switches item status in Admin Panel:
   ```http
   PATCH /api/v1/admin/menu-items/1/availability
   Authorization: Bearer <JWT>
   Content-Type: application/json

   {
     "is_available": false
   }
   ```
2. The database updates immediately.
3. The server increments the global menu version counter.
4. The server broadcasts a WebSocket event to all connected customer clients:
   ```json
   {
     "event": "MENU_ITEM_AVAILABILITY_CHANGED",
     "data": {
       "menu_item_id": 1,
       "name": "Creamy Alfredo Pasta",
       "is_available": false
     }
   }
   ```
5. Customer devices update the dish UI in real time to **OUT OF STOCK** without reloading the page.

### Connecting via WebSocket:
```text
ws://localhost:8000/api/v1/ws/menu/{qr_token}
```

### Fallback Polling Endpoint:
If WebSockets are blocked on the client network:
```http
GET /api/v1/menu/{qr_token}/version
```
Returns:
```json
{
  "version": 42
}
```

---

## 11. File Uploads

File uploads are handled through an extensible `UploadService` interface. The default implementation `LocalUploadService` safely stores images on disk and returns public URLs.

- **Supported Formats**: JPG, JPEG, PNG, WEBP.
- **Validation**:
  - File extension check
  - Declared MIME type check
  - File size check (`MAX_UPLOAD_SIZE_MB`, default 5MB)
  - Magic bytes binary signature check to prevent forged extensions.
- **Upload Endpoints**:
  - `POST /api/v1/admin/categories/{id}/image`
  - `POST /api/v1/admin/menu-items/{id}/image`
  - `POST /api/v1/admin/banners/{id}/image`
  - `POST /api/v1/admin/staff/{id}/image`
  - `POST /api/v1/reviews/upload-image`

---

## 12. QR Code Generation & Location Flow

- Admin creates a location:
  ```http
  POST /api/v1/admin/locations
  {
    "name": "Table 04",
    "location_type": "TABLE",
    "table_number": "04"
  }
  ```
- Backend automatically generates:
  - A cryptographically secure random token (e.g. `kG4G42MjyA-zDoBE`).
  - A scannable QR code PNG image pointing to `{FRONTEND_URL}/menu/{token}`.
- Admin can download or regenerate QR codes anytime via:
  - `GET /api/v1/admin/locations/{id}/qr`
  - `POST /api/v1/admin/locations/{id}/generate-qr`

---

## 13. Review & Anti-Spam System

Customers can review food, waitstaff, or restaurant ambiance without creating an account:
```http
POST /api/v1/reviews
Content-Type: application/json

{
  "customer_name": "Sophia",
  "customer_identifier": "browser-fingerprint-or-uuid",
  "menu_item_id": 1,
  "rating": 5,
  "review_text": "Remarkable flavor and texture!"
}
```

### Anti-Spam Protections:
- **Cooldown**: Minimum 30 seconds interval between consecutive submissions per client identifier or IP.
- **Rate Limit**: Maximum 5 reviews per hour per client.
- **Auto Moderation**: Reviews can be automatically approved or held for admin moderation (`AUTO_APPROVE_REVIEWS`).
- **Auto Rating Recalculation**: MenuItem average ratings and Staff average ratings recalculate instantly upon approved review submissions.

---

## 14. Testing

Run the automated test suite covering authentication, authorization, CRUD, live stock toggles, WebSocket connections, anti-spam, rating recalculations, and file validation:

```bash
pytest -v
```

---

## 15. PostgreSQL Migration Guide

The application uses SQLAlchemy ORM and Alembic migrations without SQLite-specific SQL constructs.

To switch from SQLite to PostgreSQL:

1. Install psycopg:
   ```bash
   pip install "psycopg[binary]>=3.1.18"
   ```
2. Update `.env`:
   ```ini
   DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/hotel_menu
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
4. Run the seed script:
   ```bash
   python seed.py
   ```

No application code changes are required.

---

## 16. Production Deployment Instructions

### Production checklist:
1. Set `DEBUG=false` in `.env`.
2. Generate a secure, random 64-character `JWT_SECRET_KEY`.
3. Set `ALLOWED_ORIGINS` to your production frontend domains.
4. Set `FRONTEND_URL` to your production frontend domain (for QR codes).
5. Run behind Gunicorn with Uvicorn workers:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```
6. Set up Nginx reverse proxy with SSL (Let's Encrypt) and WebSocket forwarding:
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:8000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }

   location /api/v1/ws/ {
       proxy_pass http://127.0.0.1:8000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
   ```
