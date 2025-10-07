import re
from typing import Dict, List, Any

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_case_data(data: Dict) -> tuple[bool, List[str]]:
    """Validate case data"""
    errors = []
    
    if not data.get('title'):
        errors.append('Title is required')
    elif len(data['title']) > 200:
        errors.append('Title must be less than 200 characters')
    
    if not data.get('description'):
        errors.append('Description is required')
    elif len(data['description']) > 5000:
        errors.append('Description must be less than 5000 characters')
    
    if not data.get('case_type'):
        errors.append('Case type is required')
    elif data['case_type'] not in ['criminal', 'civil', 'corporate', 'family', 'constitutional']:
        errors.append('Invalid case type')
    
    return len(errors) == 0, errors

def validate_file_type(filename: str, allowed_extensions: set) -> bool:
    """Check if file type is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove any path components
    filename = os.path.basename(filename)
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    return filename