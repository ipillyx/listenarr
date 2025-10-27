from fastapi import APIRouter, Query, HTTPException
import httpx
import os

router = APIRouter(prefix="/search", tags=["Search"])

# 🌐 Environment variables
PROWLARR_URL = os.getenv("PROWLARR_URL", "http://localhost:9696")
PROWLARR_KEY = os.getenv("PROWLARR_API_KEY", "")
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY", "")

@router.get("/")
async def search_all(q: str = Query(..., min_length=2)):
    """Search Google Books and Prowlarr for audiobooks/books in parallel."""
    results = {"query": q, "google_books": [], "prowlarr": []}

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 📚 GOOGLE BOOKS
        try:
            params = {"q": q, "maxResults": 20, "printType": "books"}
            if GOOGLE_BOOKS_API_KEY:
                params["key"] = GOOGLE_BOOKS_API_KEY

            g_resp = await client.get("https://www.googleapis.com/books/v1/volumes", params=params)
            g_resp.raise_for_status()
            g_data = g_resp.json().get("items", [])

            for item in g_data:
                volume = item.get("volumeInfo", {})
                results["google_books"].append({
                    "id": item.get("id"),
                    "title": volume.get("title"),
                    "author": ", ".join(volume.get("authors", [])) if volume.get("authors") else "Unknown",
                    "cover": volume.get("imageLinks", {}).get("thumbnail"),
                    "source": "google_books"
                })
        except Exception as e:
            # we log / return gracefully — not crash everything
            results["google_books_error"] = f"Google Books error: {str(e)}"

        # 🧲 PROWLARR
        if PROWLARR_KEY:
            try:
                p_params = {"apikey": PROWLARR_KEY, "query": q, "cat": 3030}
                p_resp = await client.get(f"{PROWLARR_URL}/api/v1/search", params=p_params)
                p_resp.raise_for_status()
                results["prowlarr"] = p_resp.json()
            except Exception as e:
                results["prowlarr_error"] = f"Prowlarr error: {str(e)}"
        else:
            results["prowlarr_error"] = "Missing PROWLARR_API_KEY"

    return results
