import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/jurix_db')
    DB_NAME = os.getenv('DB_NAME', 'jurix_db')
    
    # JWT
    JWT_SECRET = os.getenv('JWT_SECRET')
    JWT_EXPIRY_DAYS = int(os.getenv('JWT_EXPIRY_DAYS', 7))
    
    # AI Services
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    
    # File Upload
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploaded_evidence')
    
    # CORS
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '').split(',') if os.getenv('ALLOWED_ORIGINS') else [
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174", 
        "https://jurix.vercel.app"
    ]
    
    # Environment
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

class TestConfig(Config):
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/jurix_test_db'
    DB_NAME = 'jurix_test_db'
    JWT_SECRET = 'test-secret-key-do-not-use-in-production'         