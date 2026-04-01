import requests
from datetime import datetime, timedelta, timezone
from app.db import video_collection
import os
from dotenv import load_dotenv

load_dotenv()

# ✅ Load and clean API keys
keys = os.getenv("YOUTUBE_API_KEYS", "")
API_KEYS = [k.strip() for k in keys.split(",") if k.strip()]

if not API_KEYS:
    raise Exception("No API keys found in .env")

current_key_index = 0


def get_api_key():
    return API_KEYS[current_key_index]


def switch_key():
    global current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)


def fetch_from_youtube(query: str):

    global current_key_index

    url = "https://www.googleapis.com/youtube/v3/search"

    published_after = (
        datetime.now(timezone.utc) - timedelta(days=1)
    ).isoformat(timespec="seconds").replace("+00:00", "Z")

    for _ in range(len(API_KEYS)):

        api_key = get_api_key()

        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "date",
            "publishedAfter": published_after,
            "maxResults": 10,
            "key": api_key
        }

        try:
            response = requests.get(url, params=params, timeout=5)
        except:
            switch_key()
            continue

        if response.status_code == 200:
            try:
                data = response.json()
            except:
                switch_key()
                continue

            videos = []

            for item in data.get("items", []):

                if "videoId" not in item.get("id", {}):
                    continue

                snippet = item.get("snippet", {})

                videos.append({
                    "video_id": str(item["id"]["videoId"]),
                    "title": str(snippet.get("title", "")),
                    "description": str(snippet.get("description", "")),
                    "published_at": str(snippet.get("publishedAt", "")),
                    "thumbnail": str(
                        snippet.get("thumbnails", {})
                        .get("default", {})
                        .get("url", "")
                    ),
                    "query": str(query)
                })

            if videos:
                try:
                    video_collection.insert_many(videos, ordered=False)
                except:
                    pass  # ignore duplicates

            return videos

        else:
            switch_key()

    return []