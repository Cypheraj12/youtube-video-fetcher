from fastapi import FastAPI
from app.db import video_collection

app = FastAPI()


@app.get("/")
def home():
    return {"message": "API is running 🚀"}


# 🔹 Insert sample data (run once)
@app.get("/insert-sample")
def insert_sample():

    sample_videos = [
        {
            "title": "Cricket Highlights",
            "description": "Match highlights",
            "published_at": "2024-01-10"
        },
        {
            "title": "Football Goals",
            "description": "Top goals",
            "published_at": "2024-01-12"
        },
        {
            "title": "Tech News",
            "description": "Latest updates",
            "published_at": "2024-01-15"
        }
    ]

    video_collection.insert_many(sample_videos)

    return {"message": "Sample videos inserted"}


# 🔹 Main API (NOW USING DATABASE)
@app.get("/videos")
def get_videos(page: int = 1, limit: int = 10):

    skip = (page - 1) * limit

    videos = list(
        video_collection.find()
        .sort("published_at", -1)
        .skip(skip)
        .limit(limit)
    )

    # Convert ObjectId to string
    for video in videos:
        video["_id"] = str(video["_id"])

    total = video_collection.count_documents({})

    return {
        "page": page,
        "limit": limit,
        "total_videos": total,
        "videos": videos
    }


# 🔹 Test DB connection
@app.get("/test-db")
def test_db():
    video_collection.insert_one({"test": "connection working"})
    return {"message": "Data inserted successfully"}