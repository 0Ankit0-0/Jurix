import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image

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


# ---------------- Evidence Upload ---------------- #
@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename, ALLOWED_EVIDENCE_EXTENSIONS):
        filename = secure_filename(file.filename)
        file_path = os.path.join(EVIDENCE_DIR, filename)
        file.save(file_path)
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': f"/uploads/evidence/{filename}"
        }), 200

    return jsonify({
        'error': 'Invalid file type',
        'allowed_extensions': list(ALLOWED_EVIDENCE_EXTENSIONS)
    }), 400


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
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename, ALLOWED_AVATAR_EXTENSIONS):
        return jsonify({'error': 'Invalid file type'}), 400

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
