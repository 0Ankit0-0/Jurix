from db.mongo import get_case_collection
from bson import ObjectId
from datetime import datetime

def create_case(case_data):
    """Creates a new case in the database"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        # Add timestamp if not provided
        if 'created_at' not in case_data:
            case_data['created_at'] = datetime.utcnow()
        if 'updated_at' not in case_data:
            case_data['updated_at'] = datetime.utcnow()

        result = collection.insert_one(case_data)
        print(f"✅ Case created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"❌ Error saving case: {str(e)}")
        raise e

def get_case_by_id(case_id):
    """Retrieve a case by its case_id with enhanced error handling and validation
    
    Args:
        case_id (str): The ID of the case to retrieve
        
    Returns:
        dict: The case document with serialized IDs, or None if not found
        
    Raises:
        ConnectionError: If database connection is not available
        ValueError: If case_id is invalid
        Exception: For other database errors
    """
    if not case_id:
        raise ValueError("Case ID cannot be empty")
        
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
        
    try:
        # Add request logging
        print(f"🔍 Attempting to retrieve case: {case_id}")
        
        # Query with timeout
        case = collection.find_one(
            {"case_id": case_id},
            max_time_ms=5000  # 5 second timeout
        )
        
        if case:
            # Convert ObjectId to string for JSON serialization
            case['_id'] = str(case['_id'])
            
            # Validate required fields
            required_fields = ['case_id', 'title', 'status']
            missing_fields = [field for field in required_fields if field not in case]
            
            if missing_fields:
                print(f"⚠️ Case {case_id} is missing required fields: {missing_fields}")
            
            print(f"✅ Case found: {case_id} (status: {case.get('status', 'unknown')})")
            
            # Add last accessed timestamp
            collection.update_one(
                {"case_id": case_id},
                {"$set": {"last_accessed": datetime.utcnow()}}
            )
            
            return case
        else:
            print(f"⚠️ Case not found: {case_id}")
            return None
            
    except Exception as e:
        error_msg = f"❌ Error retrieving case {case_id}: {str(e)}"
        print(error_msg)
        
        # Re-raise with additional context
        raise type(e)(f"{error_msg} (original error: {str(e)})")

def update_case(case_id, update_data):
    """Update a case"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        # Always update the timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        result = collection.update_one(
            {"case_id": case_id},
            {"$set": update_data}
        )
        
        success = result.modified_count > 0
        if success:
            print(f"✅ Case updated: {case_id}")
        else:
            print(f"⚠️ No changes made to case: {case_id}")
        return success
    except Exception as e:
        print(f"❌ Error updating case: {str(e)}")
        raise e

def get_cases_by_user_id(user_id):
    """Get all cases created by a specific user"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        cases = list(collection.find({"user_id": user_id}))
        # Convert ObjectId to string for all cases
        for case in cases:
            case['_id'] = str(case['_id'])
        
        print(f"✅ Found {len(cases)} cases for user: {user_id}")
        return cases
    except Exception as e:
        print(f"❌ Error retrieving user cases: {str(e)}")
        raise e

def get_cases_by_status(status):
    """Get all cases with a specific status"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        cases = list(collection.find({"status": status}))
        # Convert ObjectId to string for all cases
        for case in cases:
            case['_id'] = str(case['_id'])
        
        print(f"✅ Found {len(cases)} cases with status: {status}")
        return cases
    except Exception as e:
        print(f"❌ Error retrieving cases by status: {str(e)}")
        raise e

def delete_case(case_id):
    """Delete a case (be careful with this!)"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        result = collection.delete_one({"case_id": case_id})
        success = result.deleted_count > 0
        if success:
            print(f"✅ Case deleted: {case_id}")
        else:
            print(f"⚠️ Case not found for deletion: {case_id}")
        return success
    except Exception as e:
        print(f"❌ Error deleting case: {str(e)}")
        raise e

def get_all_cases(page=1, per_page=20, filters=None):
    """Get cases with pagination and filters"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    
    try:
        skip = (page - 1) * per_page
        
        # Build filter query
        query = {}
        if filters:
            if filters.get('case_type'):
                query['case_type'] = filters['case_type']
            if filters.get('status'):
                query['status'] = filters['status']
            if filters.get('is_public') is not None:
                query['is_public'] = filters['is_public']
        
        # Get total count
        total = collection.count_documents(query)
        
        # Get paginated results
        cases = list(
            collection
            .find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(per_page)
        )
        
        # Convert ObjectId to string
        for case in cases:
            case['_id'] = str(case['_id'])
        
        return {
            'cases': cases,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }
    except Exception as e:
        print(f"❌ Error retrieving cases: {e}")
        raise e
    
def add_evidence_to_case(case_id, evidence_id):
    """Add evidence ID to case's evidence list"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        result = collection.update_one(
            {"case_id": case_id},
            {"$addToSet": {"evidence_files": evidence_id}}  # addToSet prevents duplicates
        )
        
        success = result.modified_count > 0
        if success:
            print(f"✅ Evidence {evidence_id} added to case: {case_id}")
        return success
    except Exception as e:
        print(f"❌ Error adding evidence to case: {str(e)}")
        raise e

def set_case_privacy(case_id, is_public=False):
    """Set case as public or private"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        update_data = {
            'is_public': is_public,
            'updated_at': datetime.utcnow()
        }
        
        result = collection.update_one(
            {"case_id": case_id},
            {"$set": update_data}
        )
        
        success = result.modified_count > 0
        if success:
            status = "public" if is_public else "private"
            print(f"✅ Case privacy updated to {status}: {case_id}")
        return success
    except Exception as e:
        print(f"❌ Error updating case privacy: {e}")
        raise e

def get_public_cases(limit=10):
    """Get all public cases"""
    collection = get_case_collection()
    if collection is None:
        raise ConnectionError("Database connection not available")
    try:
        # ✅ FIX: Use aggregation to join user data for author name
        pipeline = [
            {'$match': {'is_public': True}},
            {'$sort': {'created_at': -1}},
            {'$limit': limit},
            {
                # Convert user_id string to ObjectId for lookup
                '$addFields': {
                    'userObjectId': {
                        '$cond': {
                           'if': { '$and': [{'$ne': ['$user_id', None]}, {'$ne': ['$user_id', ""]}]},
                           'then': { '$toObjectId': '$user_id' },
                           'else': None
                        }
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'userObjectId',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            },
            {
                '$unwind': {
                    'path': '$userDetails',
                    'preserveNullAndEmptyArrays': True # Keep cases even if user is not found
                }
            },
            {
                '$addFields': {
                    'user': {
                        'name': '$userDetails.name',
                        'avatarUrl': '$userDetails.avatar'
                    }
                }
            },
            {
                '$project': {
                    'userDetails': 0,
                    'userObjectId': 0
                }
            }
        ]
        cases = list(collection.aggregate(pipeline))
        
        # Convert ObjectId to string for all cases
        for case in cases:
            case['_id'] = str(case['_id'])
        
        print(f"✅ Retrieved {len(cases)} public cases with user info")
        return cases
    except Exception as e:
        print(f"❌ Error retrieving public cases: {e}")
        raise e

