# 🚀 Complete Guide: Hosting Hotel Digital Menu on Dokploy (Hostinger VPS)

This comprehensive guide walks you through deploying the complete **Hotel Digital Menu System** (FastAPI Backend, Next.js Customer Frontend, Next.js Admin Panel, and PostgreSQL Database) on your **Hostinger VPS** using **Dokploy**.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Point Your DNS Records](#step-1-point-your-dns-records)
4. [Step 2: Push Project Code to GitHub](#step-2-push-project-code-to-github)
5. [Step 3: Create Compose Service in Dokploy](#step-3-create-compose-service-in-dokploy)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Assign Domains and SSL Certificates](#step-5-assign-domains-and-ssl-certificates)
8. [Step 6: Deploy and Monitor](#step-6-deploy-and-monitor)
9. [Step 7: Verify Initial Login & Seed Data](#step-7-verify-initial-login--seed-data)
10. [Troubleshooting & Maintenance](#troubleshooting--maintenance)

---

## 1. Architecture Overview

Your application runs in 4 synchronized containers orchestrated by Docker Compose:

```
                          Internet (HTTPS / WSS)
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
     https://menu.domain   https://admin.domain   https://api.domain
               │                    │                    │
               ▼                    ▼                    ▼
       ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
       │   frontend   │     │  adminpanel  │     │   backend    │
       │ Next.js:3000 │     │ Next.js:3000 │     │ FastAPI:8000 │
       └──────────────┘     └──────────────┘     └───────┬──────┘
                                                         │
                                    ┌────────────────────┴────────┐
                                    ▼                             ▼
                            ┌──────────────┐             ┌─────────────────┐
                            │   postgres   │             │ Persistent Data │
                            │ Postgres:16  │             │ ├── postgres_db │
                            └──────────────┘             │ └── uploads/    │
                                                         └─────────────────┘
```

- **PostgreSQL 16**: High-performance persistent database (handles high concurrent visitors & reviews without locking).
- **Backend (FastAPI)**: REST API, WebSockets for live stock updates, QR code generator, file upload handler.
- **Frontend (Next.js 15 Standalone)**: Responsive customer menu, table QR token resolver, instant stock badges.
- **Admin Panel (Next.js 15 Standalone)**: Dish management, stock toggles, staff ratings, review moderation, QR printable downloads.

---

## 2. Prerequisites

1. **Hostinger VPS** with Dokploy installed (accessible at `http://YOUR_VPS_IP:3000` or via custom Dokploy domain).
2. A domain name (e.g. `yourdomain.com`).
3. A **GitHub** account connected to Dokploy.

---

## Step 1: Point Your DNS Records

In your domain registrar (Hostinger DNS Management, Cloudflare, Namecheap, etc.), add **3 A Records** pointing to your **VPS IP Address**:

| Type | Name / Subdomain | Target / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `menu` | `YOUR_VPS_IP` | Customer Menu frontend (`menu.yourdomain.com`) |
| **A** | `admin` | `YOUR_VPS_IP` | Admin Dashboard (`admin.yourdomain.com`) |
| **A** | `api` | `YOUR_VPS_IP` | Backend REST API & WebSockets (`api.yourdomain.com`) |

*(Note: DNS propagation usually takes between 2 to 15 minutes).*

---

## Step 2: Push Project Code to GitHub

Make sure all files, including Dockerfiles and Compose configurations, are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Configure Docker, PostgreSQL, and Dokploy deployment"
git push origin main
```

---

## Step 3: Create Compose Service in Dokploy

1. Open your **Dokploy Dashboard** (`http://YOUR_VPS_IP:3000`).
2. Go to **Projects** on the left menu.
3. Click **Create Project** (Name: `Hotel Menu`).
4. Click into the project and click **Create Service** ➔ Select **Compose**.
5. Fill in the repository details:
   - **Service Name**: `hotel-menu-stack`
   - **Source**: `GitHub`
   - **Repository**: Select your `hotelmenu` repository.
   - **Branch**: `main`
   - **Compose Path**: `docker-compose.yml`
6. Click **Save**.

---

## Step 4: Configure Environment Variables

1. In your new Compose service, click on the **Environment** tab.
2. Paste the following configuration, **replacing `yourdomain.com` with your actual domain**:

```ini
# ==========================================
# DATABASE SETTINGS (POSTGRESQL)
# ==========================================
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=Adoxhosting@123
POSTGRES_DB=hotel_menu

# ==========================================
# BACKEND SETTINGS
# ==========================================
PROJECT_NAME="Hotel Digital Menu API"
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=k9F3mQ8zL2pW5vY1bX7rT4eU0nA6sD3gH8jK1lM4oP7q
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AUTO_SEED=true
MAX_UPLOAD_SIZE_MB=10

# Backend CORS & QR Code Generation URL
FRONTEND_URL=https://menu.yourdomain.com
ALLOWED_ORIGINS=https://menu.yourdomain.com,https://admin.yourdomain.com

# ==========================================
# FRONTEND CLIENT ENVIRONMENT (Next.js)
# ==========================================
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/api/v1/ws
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com

# ==========================================
# ADMIN PANEL CLIENT ENVIRONMENT
# ==========================================
NEXT_PUBLIC_CUSTOMER_MENU_URL=https://menu.yourdomain.com
```

3. Click **Save** to persist the environment variables.

---

## Step 5: Assign Domains and SSL Certificates

Dokploy uses Traefik as its reverse proxy with automatic Let's Encrypt SSL certificates.

Navigate to the **Domains** section of your Compose service and add the 3 routes:

### 1. Customer Frontend Domain:
- **Host**: `menu.yourdomain.com`
- **Service**: `frontend`
- **Container Port**: `3000`
- **HTTPS**: Toggle **ON** (Redirect HTTP to HTTPS)
- Click **Save**.

### 2. Admin Panel Domain:
- **Host**: `admin.yourdomain.com`
- **Service**: `adminpanel`
- **Container Port**: `3000`
- **HTTPS**: Toggle **ON** (Redirect HTTP to HTTPS)
- Click **Save**.

### 3. Backend API Domain:
- **Host**: `api.yourdomain.com`
- **Service**: `backend`
- **Container Port**: `8000`
- **HTTPS**: Toggle **ON** (Redirect HTTP to HTTPS)
- Click **Save**.

---

## Step 6: Deploy and Monitor

1. Go to the **Deployments** tab in Dokploy.
2. Click **Deploy**.
3. Dokploy will execute:
   - Downloading PostgreSQL 16 image.
   - Building the FastAPI backend image.
   - Building the customer Next.js frontend with standalone optimization.
   - Building the admin Next.js panel with standalone optimization.
   - Starting PostgreSQL and waiting for its healthcheck.
   - Running database migrations (`alembic upgrade head`).
   - Seeding default admin accounts, sample categories, dishes, tables, and banners (`python seed.py`).
   - Issuing Let's Encrypt SSL certificates for all 3 subdomains.

---

## Step 7: Verify Initial Login & Seed Data

Once the deployment status indicates **Running**:

### 1. Check Backend Swagger Documentation
Open your browser and navigate to:
```
https://api.yourdomain.com/docs
```
You should see the interactive OpenAPI/Swagger page with all endpoints and healthcheck.

### 2. Log in to the Admin Dashboard
Open:
```
https://admin.yourdomain.com
```
Use the seeded credentials:
- **Email**: `admin@hotel.com`
- **Password**: `admin123`

*(Important: Navigate to **Settings** or **Profile** to update this password to your private credentials).*

### 3. Open Customer Digital Menu
Open:
```
https://menu.yourdomain.com
```
Browse categories, check dish images, and verify real-time availability badges.

### 4. Test Table QR Codes
1. Go to **Admin Panel** ➔ **Locations & QR**.
2. Download or view a QR code generated for Table 1.
3. Scanning the QR code with your smartphone will open:
   `https://menu.yourdomain.com/menu/{token}` with the table context pre-selected!

---

## Troubleshooting & Maintenance

### 1. How to View Real-Time Logs
In Dokploy:
1. Open your Compose service.
2. Click **Logs**.
3. Select the service from the dropdown (`backend`, `postgres`, `frontend`, or `adminpanel`) to view errors and requests.

### 2. WebSocket Real-Time Availability
- The frontend connects to `wss://api.yourdomain.com/api/v1/ws`.
- Dokploy's Traefik reverse proxy handles WebSocket upgrades (`Upgrade: websocket`) out of the box.
- Test: Open customer menu on your phone, then toggle any item "Out of Stock" in the admin dashboard on your desktop. The phone updates instantly without page reload.

### 3. Uploaded Images Persistence
All uploaded food photos, staff profile images, and generated QR codes are stored inside the persistent Docker volume `backend_uploads` (`/app/uploads`). They remain safe across updates and container restarts.

### 4. PostgreSQL Database Backups
All database records are preserved in the persistent volume `postgres_data`. To take a manual backup anytime from your VPS terminal:
```bash
docker exec -t $(docker ps -qf "name=postgres") pg_dump -U hotel_user hotel_menu > backup_$(date +%F).sql
```

### 5. Redeploying New Code Updates
Whenever you push changes to your GitHub `main` branch, simply open Dokploy and click **Deploy** (or enable Dokploy's **Auto Deploy / Webhook** for automatic deployment on git push).

### 6. Error: 'Bind for 0.0.0.0:3000 failed: port is already allocated'
Dokploy's own web panel runs on host port **3000** (`http://YOUR_VPS_IP:3000`). If `docker-compose.yml` attempts to bind the frontend container to host port 3000 (`3000:3000`), Docker fails because port 3000 is already taken.
- We have set the default host port to `3002:3000` in [`docker-compose.yml`](docker-compose.yml) (`${FRONTEND_PORT:-3002}:3000`).
- When configuring Dokploy's **Domains** tab, the **Container Port** for `frontend` and `adminpanel` remains **`3000`**, because Traefik communicates with the container's internal network port.
