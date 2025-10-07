from flask import jsonify
from datetime import datetime

class APIResponse:
    """Standardized API response utility"""
    
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        """Create success response"""
        response = {
            'success': True,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if data is not None:
            response['data'] = data
        
        return jsonify(response), status_code
    
    @staticmethod
    def error(message="Error occurred", status_code=400, error_code=None):
        """Create error response"""
        response = {
            'success': False,
            'error': message,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if error_code:
            response['error_code'] = error_code
        
        return jsonify(response), status_code
    
    @staticmethod
    def validation_error(errors, message="Validation failed"):
        """Create validation error response"""
        response = {
            'success': False,
            'error': message,
            'validation_errors': errors,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(response), 400