"""
Authentication Routes Module

This module handles all user authentication related operations including:
- Google OAuth login/signup
- Local user registration and login
- JWT token management
- User profile management
- Password validation and security

Dependencies:
- Flask Blueprint for routing
- JWT for token management
- Google OAuth2 for social login
- MongoDB for user storage
- Password validation utilities

Author: Jurix Development Team
"""

from flask import Blueprint, request, jsonify
import re
import jwt
import datetime
import os
from model.user import (
    create_user, get_user_by_email, get_user_by_id,
    update_user, verify_password, email_exists
)
from bson import ObjectId

# Google OAuth imports
try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
    import google.auth.exceptions
    GOOGLE_AUTH_AVAILABLE = True
    print("✅ Google Auth libraries loaded successfully")
except ImportError:
    print("⚠️ Google Auth libraries not installed. Run: pip install google-auth google-auth-oauthlib")
    GOOGLE_AUTH_AVAILABLE = False

# Blueprint
user_bp = Blueprint('users', __name__)

# Config
JWT_SECRET = os.getenv('JWT_SECRET') or 'your-secret-key-for-development-only'
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

# ---------------- Helper Functions ----------------

def validate_email(email):
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def serialize_user(user):
    """Convert MongoDB user doc to JSON-serializable format"""
    if user:
        user_copy = user.copy()
        user_copy['_id'] = str(user_copy['_id'])
        user_copy.pop('password', None)
        return user_copy
    return None

def generate_token(user_id, email):
    """Generate JWT token"""
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
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print(f"❌ Token verification failed: {e}")
        return None

# ---------------- Routes ----------------

# ----------- Google OAuth Login/Signup -----------
@user_bp.route('/auth/google', methods=['POST', 'OPTIONS'])
def google_login():
    if request.method == 'OPTIONS':
        return '', 200

    print(f"🔍 Google login attempt - GOOGLE_AUTH_AVAILABLE: {GOOGLE_AUTH_AVAILABLE}")
    print(f"🔍 GOOGLE_CLIENT_ID configured: {'Yes' if GOOGLE_CLIENT_ID else 'No'}")

    if not GOOGLE_AUTH_AVAILABLE:
        print("❌ Google auth libraries not available")
        return jsonify({'error': 'Google authentication not available. Please install required packages.'}), 503
    
    if not GOOGLE_CLIENT_ID:
        print("❌ Google Client ID not configured")
        return jsonify({'error': 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable.'}), 500

    data = request.get_json()
    print(f"🔍 Received data: {data is not None}")
    
    if not data or 'credential' not in data:
        print("❌ No credential in request")
        return jsonify({'error': 'Google credential is required'}), 400

    credential = data['credential']
    print(f"🔍 Credential length: {len(credential) if credential else 0}")

    # Verify token with enhanced error handling
    try:
        print("🔍 Verifying Google token...")
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        print(f"✅ Token verified successfully for email: {idinfo.get('email')}")
    except ValueError as e:
        print(f"❌ Google token verification failed: {str(e)}")
        return jsonify({'error': f'Invalid Google token: {str(e)}'}), 401
    except Exception as e:
        print(f"❌ Unexpected error during token verification: {str(e)}")
        return jsonify({'error': f'Token verification error: {str(e)}'}), 500

    email = idinfo.get('email')
    if not email or not idinfo.get('email_verified', False):
        return jsonify({'error': 'Google email not verified'}), 400

    existing_user = get_user_by_email(email.lower())

    if existing_user:
        # Update Google info and last login
        update_user(str(existing_user['_id']), {
            'google_id': idinfo.get('sub'),
            'avatar': idinfo.get('picture', existing_user.get('avatar', '')),
            'last_login': datetime.datetime.utcnow()
        })
        updated_user = get_user_by_id(str(existing_user['_id']))
        token = generate_token(existing_user['_id'], existing_user['email'])
        return jsonify({
            'message': 'Google login successful',
            'token': token,
            'user': serialize_user(updated_user),
            'is_new_user': False
        }), 200

    # Create new Google user
    user_data = {
        'name': idinfo.get('name', ''),
        'firstName': idinfo.get('given_name', ''),
        'lastName': idinfo.get('family_name', ''),
        'email': email.lower(),
        'password': '',
        'role': 'lawyer',
        'avatar': idinfo.get('picture', ''),
        'auth_provider': 'google',
        'google_id': idinfo.get('sub'),
        'email_verified': True,
        'last_login': datetime.datetime.utcnow()
    }
    user_id = create_user(user_data)
    new_user = get_user_by_id(str(user_id))
    token = generate_token(new_user['_id'], new_user['email'])
    return jsonify({
        'message': 'Account created and login successful',
        'token': token,
        'user': serialize_user(new_user),
        'is_new_user': True
    }), 201

# ----------- Signup -----------
@user_bp.route('/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['firstName', 'lastName', 'email', 'password', 'role']
    for field in required_fields:
        if not data.get(field) or not data.get(field).strip():
            return jsonify({'error': f'{field} is required'}), 400

    email = data['email'].lower().strip()
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if email_exists(email):
        return jsonify({'error': 'Email already registered'}), 409

    password = data['password']
    from utils.password_validator import PasswordValidator
    is_valid, errors = PasswordValidator.validate_password(password)
    if not is_valid:
        return jsonify({'error': 'Password validation failed', 'details': errors}), 400

    user_data = {
        'name': f"{data['firstName'].strip()} {data['lastName'].strip()}",
        'firstName': data['firstName'].strip(),
        'lastName': data['lastName'].strip(),
        'email': email,
        'password': password,
        'role': data['role'],
        'phone': data.get('phone', '').strip(),
        'location': data.get('location', '').strip(),
        'avatar': data.get('avatar', ''),
        'auth_provider': 'local',
        'email_verified': False
    }
    user_id = create_user(user_data)
    new_user = get_user_by_id(str(user_id))
    return jsonify({
        'message': 'User created successfully',
        'user': serialize_user(new_user)
    }), 201

# ----------- Login -----------
@user_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = verify_password(email, password)
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    update_user(str(user['_id']), {'last_login': datetime.datetime.utcnow()})
    token = generate_token(user['_id'], user['email'])
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': serialize_user(user)
    }), 200

# ----------- Token Verification -----------
@user_bp.route('/auth/verify', methods=['GET', 'OPTIONS'])
def verify_token_endpoint():
    if request.method == 'OPTIONS':
        return '', 200

    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401

    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    user = get_user_by_id(payload['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'valid': True, 'user': serialize_user(user)}), 200

# ----------- Logout -----------
@user_bp.route('/auth/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 200

    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if payload:
            user = get_user_by_id(payload['user_id'])
            if user:
                update_user(str(user['_id']), {'last_logout': datetime.datetime.utcnow()})

    return jsonify({'message': 'Logout successful'}), 200

# ----------- Health Check -----------
@user_bp.route('/auth/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return '', 200
    google_status = "✅ Available" if (GOOGLE_AUTH_AVAILABLE and GOOGLE_CLIENT_ID) else "⚠️ Not configured"
    jwt_status = "✅ Configured" if JWT_SECRET != 'your-secret-key-for-development-only' else "⚠️ Using default"
    return jsonify({
        'status': 'Auth service is running',
        'google_oauth': google_status,
        'jwt_secret': jwt_status,
        'timestamp': datetime.datetime.utcnow().isoformat()
    }), 200

# ----------- User Profile -----------
@user_bp.route('/auth/<user_id>', methods=['GET', 'PUT', 'OPTIONS'])
def user_profile(user_id):
    if request.method == 'OPTIONS':
        return '', 200

    if request.method == 'GET':
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(serialize_user(user)), 200

    if request.method == 'PUT':
        data = request.get_json()
        for field in ['_id', 'password', 'created_at']:
            data.pop(field, None)

        if 'email' in data:
            if not validate_email(data['email']):
                return jsonify({'error': 'Invalid email format'}), 400
            existing_user = get_user_by_email(data['email'].lower())
            if existing_user and str(existing_user['_id']) != user_id:
                return jsonify({'error': 'Email already taken'}), 409
            data['email'] = data['email'].lower()

        modified_count = update_user(user_id, data)
        if modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404

        updated_user = get_user_by_id(user_id)
        return jsonify(serialize_user(updated_user)), 200

# ----------- User Published Cases (Mock) -----------
@user_bp.route('/auth/<user_id>/published-cases', methods=['GET', 'OPTIONS'])
def get_user_published_cases(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    mock_cases = [
        {"id": 1, "title": "State vs Sharma", "type": "Criminal",
         "description": "Case regarding theft under IPC Section 378.",
         "createdAt": "2024-08-15", "isPublic": True,
         "likes": 12, "comments": 3, "userId": user_id},
        {"id": 2, "title": "Kumar vs Union of India", "type": "Constitutional",
         "description": "Challenge to a law under Article 14 of the Constitution.",
         "createdAt": "2024-09-01", "isPublic": False,
         "likes": 5, "comments": 1, "userId": user_id}
    ]
    return jsonify(mock_cases), 200
