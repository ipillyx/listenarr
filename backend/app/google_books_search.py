from fastapi import APIRouter, Query, HTTPException
import httpx
import os

router = APIRouter(prefix="/googlebooks", tags=["Google Books"])

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY", "")

@router.get("/search")
async def search_google_books(q: str = Query(..., min_length=2)):
    """
    Search Google Books, preferring Open Library covers for sharper, larger images.
    Falls back to Google thumbnails when Open Library has no match.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            params = {
                "q": q,
                "maxResults": 20,
                "printType": "books",
            }
            if GOOGLE_BOOKS_API_KEY:
                params["key"] = GOOGLE_BOOKS_API_KEY

            resp = await client.get("https://www.googleapis.com/books/v1/volumes", params=params)
            resp.raise_for_status()
            items = resp.json().get("items", [])

        books = []
        for item in items:
            volume = item.get("volumeInfo", {})
            identifiers = volume.get("industryIdentifiers", []) or []

            # Try to extract ISBN (either 13 or 10)
            isbn = None
            for ident in identifiers:
                if ident.get("type", "").startswith("ISBN"):
                    isbn = ident.get("identifier")
                    break

            # Try Open Library cover first (typically 800px+)
            cover = None
            if isbn:
                test_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
                try:
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        check = await client.head(test_url)
                        if check.status_code == 200:
                            cover = test_url
                except Exception:
                    pass

            # Fallback to Google thumbnails if needed
            if not cover:
                links = volume.get("imageLinks", {})
                cover = (
                    links.get("extraLarge")
                    or links.get("large")
                    or links.get("medium")
                    or links.get("thumbnail")
                    or links.get("smallThumbnail")
                )

                if cover:
                    cover = (
                        cover.replace("http://", "https://")
                        .replace("&edge=curl", "")
                        .replace("zoom=1", "zoom=2")
                        .replace("zoom=0", "zoom=3")
                    )

            books.append({
                "id": item.get("id"),
                "title": volume.get("title"),
                "author": ", ".join(volume.get("authors", [])) if volume.get("authors") else "Unknown",
                "cover": cover,
                "publishedDate": volume.get("publishedDate"),
                "isbn": isbn,
                "source": "google_books"
            })

        return {"query": q, "count": len(books), "results": books}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
