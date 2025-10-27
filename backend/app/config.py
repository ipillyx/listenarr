import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-prod-super-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes"
