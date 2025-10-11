import jwt
import os
import datetime
import secrets

# JWT Secret
JWT_SECRET = os.getenv('JWT_SECRET') or 'your-secret-key-for-development-only'

def validate_jwt_secret():
    """Validate JWT secret strength and warn if using default"""
    if JWT_SECRET == 'your-secret-key-for-development-only':
        raise ValueError("JWT_SECRET is using the default development key. Please set a secure JWT_SECRET environment variable.")

    if len(JWT_SECRET) < 32:
        raise ValueError("JWT_SECRET must be at least 32 characters long for security.")

    # Check for common weak patterns
    weak_patterns = ['password', 'secret', 'key', 'token', 'default', 'development']
    if any(pattern in JWT_SECRET.lower() for pattern in weak_patterns):
        raise ValueError("JWT_SECRET contains weak patterns. Please use a strong, random secret.")

    return True

# Validate on import
validate_jwt_secret()

def generate_token(user_id, email):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user_id),
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
