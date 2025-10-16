import os
import uuid
import mimetypes
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image

from config import Config
from model.user import update_user, get_user_by_id

upload_bp = Blueprint('upload', __name__)

# Base upload directory
BASE_UPLOADS_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
EVIDENCE_DIR = os.path.join(BASE_UPLOADS_DIR, 'evidence')
AVATARS_DIR = os.path.join(BASE_UPLOADS_DIR, 'avatars')

# Ensure directories exist
os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)

ALLOWED_EVIDENCE_EXTENSIONS = {'pdf', 'jpg', 'docx', 'png', 'txt', 'jpeg'}
ALLOWED_AVATAR_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename, allowed_exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts


def validate_file(file, allowed_exts):
    """Validate file type, size, and MIME type"""
    if not file or file.filename == '':
        return False, 'No file selected'

    if not allowed_file(file.filename, allowed_exts):
        return False, f'Invalid file type. Allowed: {", ".join(allowed_exts)}'

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > Config.MAX_CONTENT_LENGTH:
        return False, f'File too large. Max size: {Config.MAX_CONTENT_LENGTH / (1024*1024)}MB'

    # Check MIME type
    mime_type, _ = mimetypes.guess_type(file.filename)
    if not mime_type:
        return False, 'Unable to determine file type'

    # Basic MIME validation (can be extended)
    allowed_mimes = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'txt': 'text/plain',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }
    ext = file.filename.rsplit('.', 1)[1].lower()
    expected_mime = allowed_mimes.get(ext)
    if expected_mime and not mime_type.startswith(expected_mime.split('/')[0]):
        return False, f'MIME type mismatch. Expected {expected_mime}, got {mime_type}'

    return True, 'Valid'


# ---------------- Evidence Upload ---------------- #
@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('file')
    uploaded_files = []

    for file in files:
        # Validate file
        is_valid, message = validate_file(file, ALLOWED_EVIDENCE_EXTENSIONS)
        if not is_valid:
            # You might want to decide how to handle this - skip file or fail all
            # For now, we'll just skip the invalid file
            print(f"Skipping invalid file {file.filename}: {message}")
            continue

        # Generate unique filename
        original_filename = secure_filename(file.filename)
        ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex[:8]}_{original_filename}"
        file_path = os.path.join(EVIDENCE_DIR, unique_filename)

        # Save file
        file.save(file_path)

        uploaded_files.append({
            'message': 'File uploaded successfully',
            'filename': unique_filename,
            'original_filename': original_filename,
            'url': f"/uploads/evidence/{unique_filename}"
        })

    if not uploaded_files:
        return jsonify({'error': 'No valid files were uploaded'}), 400

    return jsonify(uploaded_files), 200


# ---------------- Avatar Upload ---------------- #
@upload_bp.route('/upload/avatar', methods=['POST', 'OPTIONS'])
def upload_avatar():
    if request.method == 'OPTIONS':
        return '', 200

    if 'avatar' not in request.files:
        return jsonify({'error': 'No avatar file provided'}), 400

    file = request.files['avatar']
    user_id = request.form.get('userId')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # Validate file
    is_valid, message = validate_file(file, ALLOWED_AVATAR_EXTENSIONS)
    if not is_valid:
        return jsonify({'error': message}), 400

    # Unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(AVATARS_DIR, unique_filename)

    # Save file
    file.save(file_path)

    # Resize & crop
    try:
        with Image.open(file_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')

            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            w, h = img.size
            size = min(w, h)
            left, top = (w - size) // 2, (h - size) // 2
            img = img.crop((left, top, left + size, top + size))
            img.save(file_path, 'JPEG', quality=85, optimize=True)
    except Exception as e:
        print(f"Image processing error: {e}")

    # Update DB
    avatar_url = f"/uploads/avatars/{unique_filename}"
    if not update_user(user_id, {'avatar': avatar_url}):
        os.remove(file_path)
        return jsonify({'error': 'Failed to update user avatar'}), 500

    return jsonify({
        'message': 'Avatar uploaded successfully',
        'avatarUrl': avatar_url,
        'filename': unique_filename
    }), 200


# ---------------- Avatar Deletion ---------------- #
@upload_bp.route('/upload/avatar/<user_id>', methods=['DELETE', 'OPTIONS'])
def delete_avatar(user_id):
    if request.method == 'OPTIONS':
        return '', 200

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    current_avatar = user.get('avatar')
    if current_avatar:
        filename = os.path.basename(current_avatar)
        file_path = os.path.join(AVATARS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    if update_user(user_id, {'avatar': ''}):
        return jsonify({'message': 'Avatar removed successfully'}), 200

    return jsonify({'error': 'Failed to remove avatar'}), 500


# ---------------- Serving Uploads ---------------- #
@upload_bp.route('/uploads/<folder>/<filename>', methods=['GET'])
def serve_uploaded_file(folder, filename):
    if folder not in ['evidence', 'avatars']:
        return jsonify({'error': 'Invalid folder'}), 400
    return send_from_directory(os.path.join(BASE_UPLOADS_DIR, folder), filename)
