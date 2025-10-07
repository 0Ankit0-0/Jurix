from functools import wraps
from flask import request, jsonify
from model.user import get_user_by_id
from utils.jwt_utils import verify_token   # ✅ no circular import

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401

        if not token:
            return jsonify({'error': 'Authentication token is required'}), 401

        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        # Attach user info to request
        request.current_user_id = payload.get('user_id')
        request.current_user_email = payload.get('email')

        return f(*args, **kwargs)
    return decorated_function


def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user_id'):
                return jsonify({'error': 'Authentication required'}), 401

            user = get_user_by_id(request.current_user_id)
            if not user or user.get('role') != required_role:
                return jsonify({'error': f'Role {required_role} required'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
