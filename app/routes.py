from fastapi import APIRouter
from app.db import video_collection
from app.fetcher import fetch_from_youtube

router = APIRouter()

active_queries = set()


@router.get("/videos")
def get_videos(q: str, page: int = 1, limit: int = 10):

    skip = (page - 1) * limit

    try:
        # 🔹 STEP 1: DB check
        existing = list(
            video_collection.find({"query": q})
            .sort("published_at", -1)
            .skip(skip)
            .limit(limit)
        )

        if existing:
            for v in existing:
                v["_id"] = str(v["_id"])

            return {
                "source": "database",
                "videos": existing
            }

        # 🔹 STEP 2: already fetching
        if q in active_queries:
            return {
                "status": "processing",
                "message": "Fetching videos, try again shortly"
            }

        # 🔹 STEP 3: lock
        active_queries.add(q)

        try:
            new_videos = fetch_from_youtube(q)
        except Exception as e:
            print("Fetch error:", e)
            return {"error": "Fetch failed"}

        finally:
            active_queries.discard(q)

        if not new_videos:
            return {"message": "No videos found"}

        # 🔥 VERY IMPORTANT: SAFE RESPONSE
        safe_videos = []

        for v in new_videos:
            safe_videos.append({
                "video_id": v.get("video_id"),
                "title": v.get("title"),
                "description": v.get("description"),
                "published_at": v.get("published_at"),
                "thumbnail": v.get("thumbnail")
            })

        return {
            "source": "youtube_api",
            "videos": safe_videos
        }

    except Exception as e:
        print("Route error:", e)
        return {"error": "Something went wrong"}