import logging
import os
from datetime import datetime

class Logger:
    """Centralized logging utility"""
    
    def __init__(self, name="jurix"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG if os.getenv('DEBUG') == 'true' else logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler
        if not self.logger.handlers:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
            
            # File handler for production
            if os.getenv('ENVIRONMENT') == 'production':
                file_handler = logging.FileHandler('jurix.log')
                file_handler.setFormatter(formatter)
                self.logger.addHandler(file_handler)
    
    def info(self, message):
        self.logger.info(message)
    
    def error(self, message):
        self.logger.error(message)
    
    def warning(self, message):
        self.logger.warning(message)
    
    def debug(self, message):
        self.logger.debug(message)

# Global logger instance
logger = Logger()