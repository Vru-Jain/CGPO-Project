FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# gcc and python3-dev needed for building some python packages
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies with CPU-only PyTorch to save space (saves ~2-3GB)
# separating torch install to ensure the correct index url is used
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
