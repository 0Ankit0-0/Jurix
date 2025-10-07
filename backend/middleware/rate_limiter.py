from functools import wraps
from flask import request, jsonify
import time
from collections import defaultdict, deque
import threading

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.lock = threading.Lock()
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is allowed based on rate limit"""
        with self.lock:
            now = time.time()
            
            # Clean old requests outside the window
            while self.requests[key] and self.requests[key][0] <= now - window:
                self.requests[key].popleft()
            
            # Check if limit exceeded
            if len(self.requests[key]) >= limit:
                return False
            
            # Add current request
            self.requests[key].append(now)
            return True

# Global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(limit: int = 100, window: int = 3600, per: str = 'ip'):
    """
    Rate limiting decorator
    
    Args:
        limit: Number of requests allowed
        window: Time window in seconds
        per: Rate limit per 'ip' or 'user'
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Determine the key for rate limiting
            if per == 'ip':
                key = request.remote_addr
            elif per == 'user':
                # Try to get user from token
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    from utils.jwt_utils import verify_token
                    token = auth_header.split(' ')[1]
                    payload = verify_token(token)
                    key = payload.get('user_id') if payload else request.remote_addr
                else:
                    key = request.remote_addr
            else:
                key = request.remote_addr
            
            if not rate_limiter.is_allowed(key, limit, window):
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Limit: {limit} per {window} seconds'
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator