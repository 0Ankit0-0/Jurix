from db.mongo import get_db
from bson import ObjectId
from datetime import datetime

def get_discussions_collection():
    """Get the discussions collection"""
    db = get_db()
    return db["discussions"]

def add_discussion(case_id, user_id, username, content, parent_id=None):
    """Add a new discussion/comment to a case"""
    try:
        discussion_data = {
            'case_id': case_id,
            'user_id': user_id,
            'username': username,
            'content': content,
            'parent_id': parent_id,  # For replies
            'created_at': datetime.utcnow(),
            'likes': 0,
            'replies_count': 0
        }
        
        collection = get_discussions_collection()
        result = collection.insert_one(discussion_data)
        
        # If this is a reply, update parent's reply count
        if parent_id:
            collection.update_one(
                {"_id": ObjectId(parent_id)},
                {"$inc": {"replies_count": 1}}
            )
        
        print(f"✅ Discussion added: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"❌ Error adding discussion: {e}")
        raise e

def get_case_discussions(case_id):
    """Get all discussions for a case"""
    try:
        collection = get_discussions_collection()
        discussions = list(collection.find({"case_id": case_id}).sort("created_at", -1))
        
        # Convert ObjectId to string
        for discussion in discussions:
            discussion['_id'] = str(discussion['_id'])
        
        print(f"✅ Found {len(discussions)} discussions for case: {case_id}")
        return discussions
    except Exception as e:
        print(f"❌ Error getting discussions: {e}")
        return []

def like_discussion(discussion_id):
    """Like a discussion"""
    try:
        collection = get_discussions_collection()
        result = collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$inc": {"likes": 1}}
        )
        
        success = result.modified_count > 0
        if success:
            print(f"✅ Discussion liked: {discussion_id}")
        return success
    except Exception as e:
        print(f"❌ Error liking discussion: {e}")
        return False

def get_discussion_by_id(discussion_id):
    """Get a single discussion by ID"""
    try:
        collection = get_discussions_collection()
        discussion = collection.find_one({"_id": ObjectId(discussion_id)})
        if discussion:
            discussion['_id'] = str(discussion['_id'])
            print(f"✅ Discussion found: {discussion_id}")
            return discussion
        return None
    except Exception as e:
        print(f"❌ Error getting discussion: {e}")
        return None

def delete_discussion(discussion_id, user_id):
    """Delete a discussion (only by the user who created it)"""
    try:
        collection = get_discussions_collection()
        result = collection.delete_one({"_id": ObjectId(discussion_id), "user_id": user_id})

        success = result.deleted_count > 0
        if success:
            print(f"✅ Discussion deleted: {discussion_id}")
        return success
    except Exception as e:
        print(f"❌ Error deleting discussion: {e}")
        return False
