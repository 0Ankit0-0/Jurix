"""
Database Index Setup - Run this once
python setup_indexes.py
"""

from db.mongo import get_db

def setup_indexes():
    """Create indexes for better query performance"""
    db = get_db()
    
    print("Creating indexes...")
    
    # Cases collection
    cases = db['cases']
    cases.create_index([("user_id", 1), ("created_at", -1)])
    cases.create_index([("case_id", 1)], unique=True)
    cases.create_index([("is_public", 1), ("created_at", -1)])
    cases.create_index([("status", 1)])
    print("✅ Cases indexes created")
    
    # Evidence collection
    evidence = db['evidence']
    evidence.create_index([("case_id", 1)])
    evidence.create_index([("uploaded_at", -1)])
    print("✅ Evidence indexes created")
    
    # Users collection
    users = db['users']
    users.create_index([("email", 1)], unique=True)
    users.create_index([("created_at", -1)])
    print("✅ User indexes created")
    
    # Discussions collection
    discussions = db['discussions']
    discussions.create_index([("case_id", 1), ("created_at", -1)])
    discussions.create_index([("user_id", 1)])
    print("✅ Discussion indexes created")
    
    print("
🎉 All indexes created successfully!")

if __name__ == "__main__":
    setup_indexes()
