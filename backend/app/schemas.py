from pydantic import BaseModel
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class BookItem(BaseModel):
    id: str
    title: str
    authors: List[str] = []
    description: Optional[str] = None
    thumbnail: Optional[str] = None
