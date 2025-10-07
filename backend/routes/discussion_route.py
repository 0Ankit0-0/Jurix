from flask import Blueprint, request, jsonify
from model.discussion_model import add_discussion, get_case_discussions, like_discussion, delete_discussion
from model.case_model import get_case_by_id

discussion_bp = Blueprint('discussions', __name__)
"""Comment routes for cases"""

@discussion_bp.route('/discussions/<case_id>', methods=['GET', 'OPTIONS'])
def get_discussions(case_id):
    """Get all discussions for a case"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Check if case exists and is public
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        if not case.get('is_public', False):
            return jsonify({'error': 'Case is private'}), 403
        
        discussions = get_case_discussions(case_id)
        
        return jsonify({
            'message': 'Discussions found',
            'discussions': discussions,
            'count': len(discussions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get discussions'}), 500

@discussion_bp.route('/discussions/<case_id>/add', methods=['POST', 'OPTIONS'])
def add_new_discussion(case_id):
    """Add a new discussion to a case"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data or not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Check if case exists and is public
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        if not case.get('is_public', False):
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
def like_a_discussion(discussion_id):
    """Like a discussion"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        success = like_discussion(discussion_id)
        
        if success:
            return jsonify({'message': 'Discussion liked!'}), 200
        else:
            return jsonify({'error': 'Failed to like discussion'}), 400
            
    except Exception as e:
        return jsonify({'error': 'Failed to like discussion'}), 500

@discussion_bp.route('/discussions/<discussion_id>/delete', methods=['DELETE', 'OPTIONS'])
def delete_a_discussion(discussion_id):
    """Delete a discussion"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        success = delete_discussion(discussion_id, user_id)
        
        if success:
            return jsonify({'message': 'Discussion deleted'}), 200
        else:
            return jsonify({'error': 'Failed to delete discussion'}), 400
            
    except Exception as e:
        return jsonify({'error': 'Failed to delete discussion'}), 500