from pymongo import MongoClient
import os
import sys

# Try localhost first, assuming port forwarding or host networking
uri = "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/test?appName=Cluster0"

try:
    print(f"Connecting to {uri}...")
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    db = client.get_database("test")
    
    # Check if we can ping
    client.admin.command('ping')
    print("Connected successfully!")
    
    users_col = db.users
    
    target_id = "696a56fe5b9be732d077f11f"
    
    print(f"Looking for user {target_id}...")
    try:
        from bson import ObjectId
        target_oid = ObjectId(target_id)
        user = users_col.find_one({"_id": target_oid})
        if user:
            print(f"FOUND User: {user.get('user_fullName')} ({user.get('email')})")
        else:
            print("User NOT FOUND.")
    except Exception as e:
        print(f"Invalid ID format: {e}")
        
    print("\nListing first 5 users:")
    for u in users_col.find().limit(5):
        print(f"- ID: {u['_id']} | Name: {u.get('user_fullName', 'N/A')} | Email: {u.get('email', 'N/A')}")
        
except Exception as e:
    print(f"Connection failed: {e}")
    # Try mongodb-dev hostname just in case we are inside the container network
    try:
        print("\nRetrying with hostname 'mongodb-dev'...")
        uri = "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/test?appName=Cluster0"
        client = MongoClient(uri, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("Connected successfully to mongodb-dev!")
        # ... logic repeat ...
    except Exception as e2:
        print(f"Retry failed: {e2}")

