import re
import html
from typing import Dict, Any, List, Optional

class InputValidator:
    """Input validation and sanitization utility"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            return ""
        
        # Remove HTML tags and escape special characters
        value = html.escape(value.strip())
        
        # Limit length
        if len(value) > max_length:
            value = value[:max_length]
        
        return value
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_case_data(data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate case creation data"""
        errors = []
        
        # Required fields
        required_fields = ['title', 'case_type', 'description']
        for field in required_fields:
            if not data.get(field) or not str(data[field]).strip():
                errors.append(f"{field} is required")
        
        # Validate title length
        if data.get('title') and len(data['title']) > 200:
            errors.append("Title must be less than 200 characters")
        
        # Validate description length
        if data.get('description') and len(data['description']) > 5000:
            errors.append("Description must be less than 5000 characters")
        
        # Validate case type
        valid_case_types = ['criminal', 'civil', 'constitutional', 'corporate', 'family', 'other']
        if data.get('case_type') and data['case_type'].lower() not in valid_case_types:
            errors.append("Invalid case type")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def sanitize_case_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize case data"""
        sanitized = {}
        
        # Sanitize string fields
        string_fields = ['title', 'description', 'case_type', 'jurisdiction']
        for field in string_fields:
            if field in data:
                sanitized[field] = InputValidator.sanitize_string(
                    str(data[field]), 
                    max_length=5000 if field == 'description' else 200
                )
        
        # Handle parties (if present)
        if 'parties' in data and isinstance(data['parties'], dict):
            sanitized['parties'] = {}
            for key, value in data['parties'].items():
                sanitized['parties'][key] = InputValidator.sanitize_string(str(value), 100)
        
        # Copy other safe fields
        safe_fields = ['user_id', 'is_public', 'created_at', 'updated_at']
        for field in safe_fields:
            if field in data:
                sanitized[field] = data[field]
        
        return sanitized
    
    @staticmethod
    def validate_file_upload(filename: str, allowed_extensions: List[str]) -> tuple[bool, str]:
        """Validate file upload"""
        if not filename:
            return False, "No filename provided"
        
        # Check extension
        if '.' not in filename:
            return False, "File must have an extension"
        
        extension = filename.rsplit('.', 1)[1].lower()
        if extension not in allowed_extensions:
            return False, f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        
        # Check for dangerous characters
        dangerous_chars = ['..', '/', '\\', '<', '>', '|', ':', '*', '?', '"']
        for char in dangerous_chars:
            if char in filename:
                return False, "Filename contains invalid characters"
        
        return True, "Valid file"