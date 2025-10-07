from db.mongo import evidence_collection
from bson import ObjectId
from datetime import datetime

def create_evidence(evidence_data):
    """Creates a new evidence entry in the database"""
    if evidence_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        evidence_data['created_at'] = datetime.utcnow()
        result = evidence_collection.insert_one(evidence_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving evidence: {str(e)}")
        raise e

def get_evidence_by_id(evidence_id):
    """Retrieve an evidence entry by its ID"""
    if evidence_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        evidence = evidence_collection.find_one({"_id": ObjectId(evidence_id)})
        if evidence:
            # Convert ObjectId to string for JSON serialization
            evidence['_id'] = str(evidence['_id'])
        return evidence
    except Exception as e:
        print(f"Error retrieving evidence: {str(e)}")
        raise e

def update_evidence(evidence_id, update_data):
    """Update an evidence entry"""
    if evidence_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        result = evidence_collection.update_one(
            {"_id": ObjectId(evidence_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating evidence: {str(e)}")
        raise e

def delete_evidence(evidence_id):
    """Delete an evidence entry"""
    if evidence_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        result = evidence_collection.delete_one({"_id": ObjectId(evidence_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting evidence: {str(e)}")
        raise e

def list_evidences(filter_criteria=None):
    """List all evidence entries, optionally filtered by criteria"""
    if evidence_collection is None:
        raise ConnectionError("Database connection not available")
    try:
        filter_criteria = filter_criteria or {}
        evidences = list(evidence_collection.find(filter_criteria))
        for evidence in evidences:
            evidence['_id'] = str(evidence['_id'])  # Convert ObjectId to string
        return evidences
    except Exception as e:
        print(f"Error listing evidences: {str(e)}")
        raise e

