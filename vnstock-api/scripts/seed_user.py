from pymongo import MongoClient
from bson import ObjectId
import datetime

uri = "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/univen2025?appName=Cluster0"

try:
    print(f"Connecting to {uri}...")
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    db = client.get_database("univen2025_dev")
    
    # 1. Ensure Role
    roles_col = db.roles
    user_role = roles_col.find_one({"role_name": "user"})
    
    if not user_role:
        print("Role 'user' not found. Creating it...")
        res = roles_col.insert_one({
            "role_name": "user",
            "role_slug": "user",
            "role_status": "active",
            "role_desc": "Regular user",
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        })
        role_id = res.inserted_id
        print(f"Created role 'user' with ID: {role_id}")
    else:
        role_id = user_role["_id"]
        print(f"Found role 'user' with ID: {role_id}")
        
    # 2. Insert User
    users_col = db.users
    target_id_str = "696a56fe5b9be732d077f11f"
    target_id = ObjectId(target_id_str)
    
    existing_user = users_col.find_one({"_id": target_id})
    
    if existing_user:
        print("User already exists!")
    else:
        print(f"Creating user {target_id_str}...")
        users_col.insert_one({
            "_id": target_id,
            "user_fullName": "Restored User",
            "email": "restored@example.com",
            "user_role": role_id,
            "balance": 100000000,
            "user_status": "active",
            "isGuest": False,
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        })
        print("User created successfully!")
        
    # Verify
    u = users_col.find_one({"_id": target_id})
    print(f"VERIFIED User: {u['user_fullName']} Balance: {u['balance']}")

except Exception as e:
    print(f"Error: {e}")
