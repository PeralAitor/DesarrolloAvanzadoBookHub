FROM python:3.9-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    mariadb-dev \
    pkgconfig \
    curl

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

EXPOSE 3001

# Usar uvicorn directamente y mantenerlo en primer plano
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001", "--loop", "asyncio"]