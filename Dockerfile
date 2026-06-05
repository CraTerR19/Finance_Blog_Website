FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy requirements file first for caching
COPY backend/requirements.txt /app/backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the rest of the application
COPY backend /app/backend
COPY frontend /app/frontend

# Set working directory to backend so relative paths (like '../frontend') match
WORKDIR /app/backend

# Expose port 8000
EXPOSE 8000

# Start uvicorn, reading $PORT dynamically or defaulting to 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
