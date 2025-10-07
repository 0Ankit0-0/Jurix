from db.mongo import user_collection
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime
import re

def get_user_by_email(email: str):
    """Retrieve user by email"""
    if user_collection is None:
        raise ConnectionError("Database connection not available")
    return user_collection.find_one({'email': email})

def get_user_by_id(user_id: str):
    """Retrieve user by ID"""
    if user_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        if ObjectId.is_valid(user_id):
            return user_collection.find_one({'_id': ObjectId(user_id)})
        return None
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

def create_user(user_data: dict):
    """Insert a new user with hashed password"""
    if user_collection is None:
        raise ConnectionError("Database connection not available")
    
    # Hash the password before storing
    if 'password' in user_data and user_data['password']:
        user_data['password'] = generate_password_hash(user_data['password'])
    
    # Add timestamps
    user_data['created_at'] = datetime.utcnow()
    user_data['updated_at'] = datetime.utcnow()
    
    try:
        result = user_collection.insert_one(user_data)
        print(f"✅ User created with ID: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        raise e

def update_user(user_id: str, update_data: dict):
    """Update an existing user by ID"""
    if user_collection is None:
        raise ConnectionError("Database connection not available")
    
    # Add updated timestamp
    update_data['updated_at'] = datetime.utcnow()
    
    try:
        if ObjectId.is_valid(user_id):
            result = user_collection.update_one(
                {'_id': ObjectId(user_id)}, 
                {'$set': update_data}
            )
            return result.modified_count
        return 0
    except Exception as e:
        print(f"❌ Error updating user: {e}")
        return 0

def verify_password(email: str, password: str):
    """Verify user password"""
    try:
        user = get_user_by_email(email)
        if user and user.get('password') and check_password_hash(user['password'], password):
            return user
        return None
    except Exception as e:
        print(f"❌ Error verifying password: {e}")
        return None

def email_exists(email: str):
    """Check if email already exists"""
    if user_collection is None:
        return False
    try:
        return user_collection.find_one({'email': email}) is not None
    except Exception as e:
        print(f"❌ Error checking email existence: {e}")
        return False