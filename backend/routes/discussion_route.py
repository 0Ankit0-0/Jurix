from flask import Blueprint, request, jsonify
from model.discussion_model import add_discussion, get_case_discussions, like_discussion, delete_discussion, get_discussion_by_id
from model.case_model import get_case_by_id
from middleware.auth_middleware import require_auth
from utils.jwt_utils import verify_token

discussion_bp = Blueprint('discussions', __name__)
"""Comment routes for cases"""

@discussion_bp.route('/discussions/<case_id>', methods=['GET', 'OPTIONS'])
def get_discussions(case_id):
    """Get all discussions for a case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        is_public = case.get('is_public', False)
        if not is_public:
            # Private case: require auth and ownership
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'Authentication required for private case discussions'}), 401
            try:
                token = auth_header.split(' ')[1]
                payload = verify_token(token)
                if not payload:
                    return jsonify({'error': 'Invalid token'}), 401
                user_id = payload.get('user_id')
                if user_id != case.get('user_id'):
                    return jsonify({'error': 'Access denied'}), 403
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401

        discussions = get_case_discussions(case_id)

        return jsonify({
            'message': 'Discussions found',
            'discussions': discussions,
            'count': len(discussions)
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get discussions'}), 500

@discussion_bp.route('/discussions/<case_id>/add', methods=['POST', 'OPTIONS'])
@require_auth
def add_new_discussion(case_id):
    """Add a new discussion to a case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()

        if not data or not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400

        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        is_public = case.get('is_public', False)
        if not is_public and request.current_user_id != case.get('user_id'):
            return jsonify({'error': 'Cannot comment on private case'}), 403

        discussion_id = add_discussion(
            case_id=case_id,
            user_id=data['user_id'],
            username=data.get('username', 'Anonymous'),
            content=data['content'],
            parent_id=data.get('parent_id')  # For replies
        )

        return jsonify({
            'message': 'Discussion added successfully',
            'discussion_id': discussion_id
        }), 201

    except Exception as e:
        return jsonify({'error': 'Failed to add discussion'}), 500

@discussion_bp.route('/discussions/<discussion_id>/like', methods=['POST', 'OPTIONS'])
@require_auth
def like_a_discussion(discussion_id):
    """Like a discussion"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        discussion = get_discussion_by_id(discussion_id)
        if not discussion:
            return jsonify({'error': 'Discussion not found'}), 404

        case = get_case_by_id(discussion['case_id'])
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        is_public = case.get('is_public', False)
        if not is_public and request.current_user_id != case.get('user_id'):
            return jsonify({'error': 'Access denied'}), 403

        success = like_discussion(discussion_id)

        if success:
            return jsonify({'message': 'Discussion liked!'}), 200
        else:
            return jsonify({'error': 'Failed to like discussion'}), 400

    except Exception as e:
        return jsonify({'error': 'Failed to like discussion'}), 500

@discussion_bp.route('/discussions/<discussion_id>/delete', methods=['DELETE', 'OPTIONS'])
@require_auth
def delete_a_discussion(discussion_id):
    """Delete a discussion"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id or user_id != request.current_user_id:
            return jsonify({'error': 'Invalid user'}), 400

        discussion = get_discussion_by_id(discussion_id)
        if not discussion:
            return jsonify({'error': 'Discussion not found'}), 404

        case = get_case_by_id(discussion['case_id'])
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        is_public = case.get('is_public', False)
        if not is_public and request.current_user_id != case.get('user_id'):
            return jsonify({'error': 'Access denied'}), 403

        success = delete_discussion(discussion_id, user_id)

        if success:
            return jsonify({'message': 'Discussion deleted'}), 200
        else:
            return jsonify({'error': 'Failed to delete discussion'}), 400

    except Exception as e:
        return jsonify({'error': 'Failed to delete discussion'}), 500
