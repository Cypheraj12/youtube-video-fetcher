import requests
from datetime import datetime, timedelta, timezone
from app.db import video_collection
import os
from dotenv import load_dotenv

load_dotenv()

keys = os.getenv("YOUTUBE_API_KEYS", "")
API_KEYS = [k.strip() for k in keys.split(",") if k.strip()]

if not API_KEYS:
    raise Exception("No API keys found")

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
        datetime.now(timezone.utc) - timedelta(days=30)
    ).isoformat(timespec="seconds").replace("+00:00", "Z")

    all_videos = []

    next_page_token = None

    # 🔥 Fetch 5 pages
    for _ in range(5):

        success = False

        # 🔥 Try all API keys
        for _ in range(len(API_KEYS)):

            api_key = get_api_key()

            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "order": "date",
                "publishedAfter": published_after,
                "maxResults": 50,
                "pageToken": next_page_token,
                "key": api_key
            }

            try:
                response = requests.get(
                    url,
                    params=params,
                    timeout=10
                )

            except:
                switch_key()
                continue

            # ✅ Success
            if response.status_code == 200:

                data = response.json()

                items = data.get("items", [])

                for item in items:

                    if "videoId" not in item.get("id", {}):
                        continue

                    snippet = item.get("snippet", {})

                    video = {
                        "video_id": str(item["id"]["videoId"]),
                        "title": str(snippet.get("title", "")),
                        "description": str(snippet.get("description", "")),
                        "published_at": str(snippet.get("publishedAt", "")),
                        "thumbnail": str(
                            snippet.get("thumbnails", {})
                            .get("high", {})
                            .get("url", "")
                        ),
                        "query": query
                    }

                    all_videos.append(video)

                # 🔥 Next page token
                next_page_token = data.get("nextPageToken")

                success = True

                break

            else:
                switch_key()

        # ❌ If all keys failed
        if not success:
            break

        # ❌ No more pages
        if not next_page_token:
            break

    # 🔥 Insert all videos
    if all_videos:

        try:
            video_collection.insert_many(
                all_videos,
                ordered=False
            )

        except:
            pass

    return all_videos