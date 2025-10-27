FROM python:3.11-slim

WORKDIR /app

# Copy everything from backend into the container
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

# Launch the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
