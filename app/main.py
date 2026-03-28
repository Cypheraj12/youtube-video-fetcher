from fastapi import FastAPI

app = FastAPI()

# Dummy data
videos = [
    {
        "id": i,
        "title": f"Video {i}",
        "description": f"This is video {i}",
        "published_at": f"2024-01-{i:02d}"
    }
    for i in range(1, 51)
]

# Sort latest first
videos = sorted(videos, key=lambda x: x["published_at"], reverse=True)

@app.get("/")
def home():
    return {"message": "API is running 🚀"}

@app.get("/videos")
def get_videos(page: int = 1, limit: int = 10):
    
    start = (page - 1) * limit
    end = start + limit

    paginated_videos = videos[start:end]

    return {
        "page": page,
        "limit": limit,
        "total_videos": len(videos),
        "videos": paginated_videos
    }