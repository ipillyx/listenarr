from fastapi import APIRouter, HTTPException, Body
import httpx
import os
import re

router = APIRouter(prefix="/prowlarr", tags=["Prowlarr"])

PROWLARR_URL = os.getenv("PROWLARR_URL", "http://prowlarr:9696")
PROWLARR_API_KEY = os.getenv("PROWLARR_API_KEY", "")

QBITTORRENT_URL = os.getenv("QBITTORRENT_URL", "http://qbittorrent:8080")
QBITTORRENT_USER = os.getenv("QBITTORRENT_USER", "admin")
QBITTORRENT_PASS = os.getenv("QBITTORRENT_PASS", "Spi203017*")
QBIT_SAVE_PATH = os.getenv("QBIT_SAVE_PATH", "/media/audiobooks")


@router.get("/search")
async def search_prowlarr(q: str):
    params = {
        "apikey": PROWLARR_API_KEY,
        "query": q,
        "cat": 3030,  # Audiobooks
        "indexerIds": "6",  # MyAnonamouse only
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{PROWLARR_URL}/api/v1/search", params=params)
            r.raise_for_status()
            results = r.json()

            # 🔍 Try to fetch cover image from MyAnonamouse details
            for item in results:
                if item.get("indexer", "").lower() == "myanonamouse" and item.get("infoUrl"):
                    try:
                        proxy_url = f"{PROWLARR_URL}/proxy/{item['indexerId']}?url={item['infoUrl']}"
                        headers = {"X-Api-Key": PROWLARR_API_KEY}
                        resp = await client.get(proxy_url, headers=headers)
                        if resp.status_code == 200:
                            match = re.search(r'<img[^>]+src="([^"]+\.jpg)"', resp.text)
                            if match:
                                item["poster"] = match.group(1)
                    except Exception:
                        item["poster"] = None

        return {"query": q, "count": len(results), "results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prowlarr error: {e}")


@router.post("/download")
async def download_from_prowlarr(payload: dict = Body(...)):
    guid = payload.get("guid")
    title = payload.get("title") or "Unknown"
    download_url = payload.get("downloadUrl")

    if not download_url:
        raise HTTPException(status_code=400, detail="Missing download URL")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 1️⃣ Login to qBittorrent
            login_resp = await client.post(
                f"{QBITTORRENT_URL}/api/v2/auth/login",
                data={"username": QBITTORRENT_USER, "password": QBITTORRENT_PASS},
            )
            if login_resp.status_code != 200 or "SID" not in login_resp.cookies:
                raise HTTPException(status_code=500, detail="Failed to authenticate with qBittorrent")

            cookies = login_resp.cookies

            # 2️⃣ Get torrent from Prowlarr
            torrent_resp = await client.get(download_url)
            torrent_resp.raise_for_status()

            # 3️⃣ Send to qBittorrent
            files = {"torrents": ("file.torrent", torrent_resp.content)}
            data = {"savepath": QBIT_SAVE_PATH, "autoTMM": "false", "paused": "false"}
            add_resp = await client.post(
                f"{QBITTORRENT_URL}/api/v2/torrents/add",
                data=data,
                files=files,
                cookies=cookies,
            )
            add_resp.raise_for_status()

            return {"message": f"✅ {title} sent to qBittorrent successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prowlarr download error: {e}")
