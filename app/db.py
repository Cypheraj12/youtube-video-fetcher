from pymongo import MongoClient

MONGO_URI = "mongodb+srv://admin:12novemberaj123@cluster12.xh5nl8l.mongodb.net/youtube_db?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)

db = client["youtube_db"]
video_collection = db["videos"]

# 🔥 REMOVE BAD DATA (IMPORTANT FIX)
video_collection.delete_many({"video_id": None})

# 🔥 CREATE INDEXES SAFELY
video_collection.create_index("video_id", unique=True)
video_collection.create_index([("query", 1), ("published_at", -1)])