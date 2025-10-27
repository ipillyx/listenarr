from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .db import get_db
from .models import User

router = APIRouter(prefix="/admin", tags=["Admin"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    """
    Returns a list of all registered users (id, username, email)
    """
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return [{"id": u.id, "username": u.username, "email": getattr(u, "email", None)} for u in users]


@router.post("/reset-password/{username}")
def reset_password(
    username: str,
    new_password: str = Query(..., description="New password for the user"),
    db: Session = Depends(get_db)
):
    """
    Resets a user's password to a new value.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = pwd_context.hash(new_password)
    db.commit()
    return {"message": f"Password reset for user '{username}'"}


@router.delete("/user/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    """
    Deletes a specific user by username.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User '{username}' deleted successfully"}


@router.delete("/users")
def delete_all_users(db: Session = Depends(get_db)):
    """
    ⚠️ Deletes all users from the database (use with caution).
    """
    count = db.query(User).delete()
    db.commit()
    return {"message": f"All users deleted ({count} removed)."}
