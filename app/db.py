from pymongo import MongoClient

MONGO_URI = "mongodb+srv://admin:12novemberaj123@cluster12.xh5nl8l.mongodb.net/youtube_db?retryWrites=true&w=majority"

# Create connection
client = MongoClient(MONGO_URI)

# Access database
db = client["youtube_db"]

# Create collection (like table)
video_collection = db["videos"]