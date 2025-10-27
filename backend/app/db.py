from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# ✅ Use /data for persistent storage inside the container
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/shaunarr.db")

# 🧠 SQLite requires special connection args
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# 🚀 Create the engine
engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args
)

# 🧰 Create session and base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 🧼 Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
