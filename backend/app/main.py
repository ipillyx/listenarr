from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .models import User

# 🧭 Routers
from .auth import router as auth_router
from .books import router as books_router
from .google_books_search import router as google_books_router
from .prowlarr_search import router as prowlarr_router
from .search import router as search_router
from .admin import router as admin_router  # 🆕 Admin router

# 🚀 Create the FastAPI app
app = FastAPI(
    title="Shaunarr API",
    version="0.1.0",
    description="Audiobook management API — custom Readarr alternative."
)

# 🧱 Initialize the database
Base.metadata.create_all(bind=engine)

# 🌐 Allowed origins (update as needed)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.1.1.161:3000",
    "https://listenarr.pilly.uk",
    "https://api.listenarr.pilly.uk",
]

# 🔐 CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🏠 Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to Shaunarr API 🚀"}

# 🧾 Register routers
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(google_books_router)
app.include_router(prowlarr_router)
app.include_router(search_router)
app.include_router(admin_router)  # 🆕 Added
