"""
Performance Monitoring Utilities
"""

import time
import logging
from functools import wraps

def track_performance(func):
    """Decorator to track function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        func_name = func.__name__
        
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start
            
            # Log slow operations
            if duration > 5.0:
                logging.warning(f"⚠️ SLOW: {func_name} took {duration:.2f}s")
            else:
                logging.info(f"✅ {func_name} completed in {duration:.2f}s")
            
            return result
        except Exception as e:
            duration = time.time() - start
            logging.error(f"❌ ERROR in {func_name} after {duration:.2f}s: {e}")
            raise
    return wrapper

# Usage example:
# from utils.performance import track_performance
#
# @track_performance
# def your_slow_function():
#     # ... code ...
