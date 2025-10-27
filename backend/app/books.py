from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import httpx
from typing import List

from .db import get_db
from .schemas import BookItem
from .auth import get_current_user
from .config import GOOGLE_BOOKS_BASE

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/search", response_model=List[BookItem])
async def search_books(q: str = Query(..., min_length=2), db: Session = Depends(get_db), user=Depends(get_current_user)):
    params = {"q": q, "printType": "books", "maxResults": 20}
    items: list[BookItem] = []
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(GOOGLE_BOOKS_BASE, params=params)
        r.raise_for_status()
        data = r.json()
        for it in data.get("items", []):
            vol = it.get("volumeInfo", {})
            img = vol.get("imageLinks", {})
            items.append(BookItem(
                id=it.get("id", ""),
                title=vol.get("title", "Unknown"),
                authors=vol.get("authors", []) or [],
                description=vol.get("description", None),
                thumbnail=img.get("thumbnail", None),
            ))
    return items
