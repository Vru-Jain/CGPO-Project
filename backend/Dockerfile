FROM python:3.11

WORKDIR /app

# Copy requirements and install Python dependencies
# Using full python image includes gcc and build tools, so no apt-get needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
