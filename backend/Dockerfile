FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Ensure upload folders and data directory exist
RUN mkdir -p uploads/banners uploads/menu_items uploads/staff uploads/reviews uploads/qrcodes uploads/categories data


EXPOSE 8000

# Start command: run migrations, optionally seed, and launch uvicorn
CMD ["sh", "-c", "alembic upgrade head 2>/dev/null || true; if [ \"$AUTO_SEED\" = \"true\" ]; then python seed.py || true; fi; uvicorn app.main:app --host 0.0.0.0 --port 8000"]
