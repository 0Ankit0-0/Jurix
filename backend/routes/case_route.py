from flask import Blueprint, request, jsonify, send_file
import uuid
from datetime import datetime
from model.case_model import (
    create_case,
    get_case_by_id,
    update_case,
    get_cases_by_user_id,
    set_case_privacy,
    get_public_cases
)
from model.evidence_model import create_evidence, list_evidences
from services.parsing.document_parsing_services import master_parser
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO

case_bp = Blueprint('cases', __name__)

@case_bp.route('/cases/create', methods=['POST', 'OPTIONS'])
def create_new_case():
    """Create a new legal case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        print(f"📋 Case creation request: {data}")  # Debug log

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Required fields for a case
        required_fields = ['title', 'description', 'case_type', 'user_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Create unique case ID
        case_id = str(uuid.uuid4())

        # Prepare case data
        case_data = {
            'case_id': case_id,
            'title': data['title'],
            'description': data['description'],
            'case_type': data['case_type'],
            'user_id': data['user_id'],
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'has_evidence': data.get('has_evidence', False),  # Flag for evidence requirement
            'parties': {
                'plaintiff': data.get('plaintiff', ''),
                'defendant': data.get('defendant', ''),
                'judge': data.get('judge', 'AI Judge'),
            },
            'evidence_files': [],
            'simulation_results': None,
            'is_public': data.get('is_public', False)
        }

        created_case_id = create_case(case_data)

        return jsonify({
            'message': 'Case created successfully',
            'case_id': case_id,
            'database_id': created_case_id
        }), 201

    except Exception as e:
        print(f"❌ Error creating case: {e}")
        return jsonify({'error': f'Failed to create case: {str(e)}'}), 500

@case_bp.route('/cases/user/<user_id>', methods=['GET', 'OPTIONS'])
def get_user_cases(user_id):
    """Get all cases created by a specific user"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        cases = get_cases_by_user_id(user_id)
        return jsonify({
            'message': f'Found {len(cases)} cases for user',
            'cases': cases,
            'user_id': user_id
        }), 200

    except Exception as e:
        print(f"❌ Error getting user cases: {e}")
        return jsonify({'error': 'Failed to get user cases'}), 500

@case_bp.route('/cases/<case_id>', methods=['GET', 'OPTIONS'])
def get_case_details(case_id):
    """Get details of a specific case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # Get case from database
        case = get_case_by_id(case_id)

        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Get evidence files for this case
        evidence_files = list_evidences({'case_id': case_id})
        case['evidence_files'] = evidence_files

        return jsonify({
            'message': 'Case found',
            'case': case
        }), 200

    except Exception as e:
        print(f"Error getting case: {e}")
        return jsonify({'error': 'Failed to get case'}), 500

@case_bp.route('/cases/<case_id>/upload-evidence', methods=['POST', 'OPTIONS'])
def upload_evidence_to_case(case_id):
    """Upload evidence files to a specific case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # Check if case exists
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Get additional information about the evidence
        evidence_title = request.form.get('title', file.filename)
        evidence_description = request.form.get('description', '')
        evidence_type = request.form.get('type', 'document')  # document, image, video, etc.

        # Save file (using existing upload logic)
        upload_folder = os.path.join(os.path.dirname(__file__), '..', 'uploaded_evidence')
        os.makedirs(upload_folder, exist_ok=True)

        # Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
        file_path = os.path.join(upload_folder, unique_filename)

        # Save the file
        file.save(file_path)

        # Parse the document to extract text content
        print(f"🔍 Parsing uploaded evidence: {unique_filename}")
        parsed_result = master_parser(file_path, use_cache=False)

        # Extract text content from parsing result
        if isinstance(parsed_result, dict):
            extracted_text = parsed_result.get('text', parsed_result.get('content', ''))
            word_count = parsed_result.get('word_count', 0)
            extraction_method = parsed_result.get('extraction_method', 'unknown')
        else:
            extracted_text = str(parsed_result)
            word_count = len(extracted_text.split()) if extracted_text else 0
            extraction_method = 'fallback'

        # Create evidence record in database with parsed content
        evidence_data = {
            'case_id': case_id,
            'title': evidence_title,
            'description': evidence_description,
            'evidence_type': evidence_type,
            'file_name': unique_filename,
            'file_path': file_path,
            'original_name': file.filename,
            'file_size': os.path.getsize(file_path),
            'uploaded_at': datetime.utcnow(),
            'parsed_content': extracted_text,
            'word_count': word_count,
            'extraction_method': extraction_method,
            'parsing_completed': True
        }

        # Save evidence to database
        evidence_id = create_evidence(evidence_data)

        print(f"✅ Evidence uploaded and parsed: {word_count} words extracted using {extraction_method}")

        return jsonify({
            'message': 'Evidence uploaded and processed successfully',
            'evidence_id': evidence_id,
            'file_name': unique_filename,
            'parsed_content': extracted_text,
            'word_count': word_count,
            'extraction_method': extraction_method,
            'ready_for_simulation': True
        }), 201

    except Exception as e:
        print(f"Error uploading evidence: {e}")
        return jsonify({'error': 'Failed to upload evidence'}), 500

@case_bp.route('/cases/<case_id>/update-status', methods=['PUT', 'OPTIONS'])
def update_case_status(case_id):
    """Update case status (draft -> ready_for_simulation -> completed)"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        new_status = data.get('status')

        # Valid status options
        valid_statuses = ['draft', 'ready_for_simulation', 'completed']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400

        # Update case status
        update_data = {
            'status': new_status,
            'updated_at': datetime.utcnow()
        }

        success = update_case(case_id, update_data)

        if not success:
            return jsonify({'error': 'Case not found or update failed'}), 404

        return jsonify({
            'message': 'Case status updated successfully',
            'new_status': new_status
        }), 200

    except Exception as e:
        print(f"Error updating case status: {e}")
        return jsonify({'error': 'Failed to update case status'}), 500

@case_bp.route('/cases/<case_id>/privacy', methods=['PUT', 'OPTIONS'])
def update_case_privacy(case_id):
    """Make case public or private"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        is_public = data.get('is_public', False)

        # Import the function
        from model.case_model import set_case_privacy

        success = set_case_privacy(case_id, is_public)

        if not success:
            return jsonify({'error': 'Case not found or update failed'}), 404

        status = "public" if is_public else "private"
        return jsonify({
            'message': f'Case is now {status}',
            'case_id': case_id,
            'is_public': is_public
        }), 200

    except Exception as e:
        print(f"Error updating privacy: {e}")
        return jsonify({'error': 'Failed to update privacy'}), 500

@case_bp.route('/cases/public', methods=['GET', 'OPTIONS'])
def get_all_public_cases():
    """Get all public cases for community viewing"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        from model.case_model import get_public_cases

        limit = int(request.args.get('limit', 10))
        cases = get_public_cases(limit)

        return jsonify({
            'message': 'Public cases found',
            'cases': cases,
            'count': len(cases)
        }), 200

    except Exception as e:
        print(f"Error getting public cases: {e}")
        return jsonify({'error': 'Failed to get public cases'}), 500

@case_bp.route('/cases/<case_id>/publish', methods=['POST', 'OPTIONS'])
def publish_case(case_id):
    """Publish a case to make it publicly available"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Get case to verify ownership
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Verify user owns the case
        if case.get('user_id') != user_id:
            return jsonify({'error': 'You can only publish your own cases'}), 403

        # Check if case has simulation (optional but recommended)
        has_simulation = bool(case.get('simulation_results'))

        # Publish the case
        success = set_case_privacy(case_id, is_public=True)

        if not success:
            return jsonify({'error': 'Failed to publish case'}), 500

        # Add publication metadata
        publication_data = {
            'published_at': datetime.utcnow(),
            'published_by': user_id,
            'publication_status': 'published',
            'has_simulation': has_simulation
        }

        update_case(case_id, publication_data)

        return jsonify({
            'message': 'Case published successfully',
            'case_id': case_id,
            'published_at': publication_data['published_at'].isoformat(),
            'has_simulation': has_simulation,
            'note': 'Case is now publicly visible and can be simulated by other users'
        }), 200

    except Exception as e:
        print(f"Error publishing case: {e}")
        return jsonify({'error': 'Failed to publish case'}), 500

@case_bp.route('/cases/<case_id>/unpublish', methods=['POST', 'OPTIONS'])
def unpublish_case(case_id):
    """Unpublish a case to make it private again"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Get case to verify ownership
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Verify user owns the case
        if case.get('user_id') != user_id:
            return jsonify({'error': 'You can only unpublish your own cases'}), 403

        # Unpublish the case
        success = set_case_privacy(case_id, is_public=False)

        if not success:
            return jsonify({'error': 'Failed to unpublish case'}), 500

        # Update publication metadata
        unpublication_data = {
            'unpublished_at': datetime.utcnow(),
            'publication_status': 'private'
        }

        update_case(case_id, unpublication_data)

        return jsonify({
            'message': 'Case unpublished successfully',
            'case_id': case_id,
            'unpublished_at': unpublication_data['unpublished_at'].isoformat(),
            'note': 'Case is now private and only visible to you'
        }), 200

    except Exception as e:
        print(f"Error unpublishing case: {e}")
        return jsonify({'error': 'Failed to unpublish case'}), 500

@case_bp.route('/cases/public/<case_id>/simulate', methods=['POST', 'OPTIONS'])
def simulate_public_case(case_id):
    """Allow users to simulate a published case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Get the public case
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Verify case is public
        if not case.get('is_public', False):
            return jsonify({'error': 'This case is not publicly available'}), 403

        # Check if case already has simulation
        existing_simulation = case.get('simulation_results')

        if existing_simulation:
            # Return existing simulation
            return jsonify({
                'message': 'Simulation already exists for this case',
                'case_id': case_id,
                'case_title': case.get('title'),
                'simulation': {
                    'id': existing_simulation.get('simulation_id'),
                    'text': existing_simulation.get('simulation_text'),
                    'thinking_processes': existing_simulation.get('thinking_processes', {}),
                    'evidence_count': existing_simulation.get('evidence_analyzed', 0),
                    'generated_at': existing_simulation.get('generated_at').isoformat() if existing_simulation.get('generated_at') else None,
                    'type': existing_simulation.get('simulation_type', 'unknown')
                },
                'user_access': {
                    'can_view': True,
                    'can_simulate': False,  # Already simulated
                    'accessed_by': user_id
                }
            }), 200

        else:
            # Case needs simulation - redirect to simulation service
            return jsonify({
                'message': 'Case ready for simulation',
                'case_id': case_id,
                'case_title': case.get('title'),
                'case_description': case.get('description'),
                'parties': case.get('parties', {}),
                'status': case.get('status'),
                'simulation_needed': True,
                'next_step': f'/api/simulation/start/{case_id}',
                'note': 'Use the simulation endpoint to generate courtroom simulation'
            }), 200

    except Exception as e:
        print(f"Error simulating public case: {e}")
        return jsonify({'error': 'Failed to access public case simulation'}), 500

@case_bp.route('/cases/public/featured', methods=['GET', 'OPTIONS'])
def get_featured_public_cases():
    """Get featured public cases with simulations"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        from model.case_model import get_public_cases

        # Get public cases
        all_public_cases = get_public_cases(limit=20)

        # Filter for cases with simulations (featured)
        featured_cases = []
        for case in all_public_cases:
            if case.get('simulation_results'):
                case_summary = {
                    'case_id': case['case_id'],
                    'title': case['title'],
                    'case_type': case['case_type'],
                    'description': case.get('description', '')[:200] + '...' if len(case.get('description', '')) > 200 else case.get('description', ''),
                    'parties': case.get('parties', {}),
                    'published_at': case.get('published_at'),
                    'has_simulation': True,
                    'simulation_info': {
                        'evidence_analyzed': case['simulation_results'].get('evidence_analyzed', 0),
                        'simulation_type': case['simulation_results'].get('simulation_type', 'unknown'),
                        'generated_at': case['simulation_results'].get('generated_at')
                    }
                }
                featured_cases.append(case_summary)

        # Sort by publication date (newest first)
        featured_cases.sort(key=lambda x: x.get('published_at', datetime.min), reverse=True)

        return jsonify({
            'message': 'Featured cases found',
            'featured_cases': featured_cases[:10],  # Limit to 10 featured cases
            'total_featured': len(featured_cases),
            'total_public': len(all_public_cases)
        }), 200

    except Exception as e:
        print(f"Error getting featured cases: {e}")
        return jsonify({'error': 'Failed to get featured cases'}), 500


@case_bp.route('/cases/<case_id>/download-pdf', methods=['GET', 'OPTIONS'])
def download_case_pdf(case_id):
    """Download a PDF report for a specific case"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # Get case details
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404

        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
        )
        normal_style = styles['Normal']

        # Build PDF content
        content = []

        # Title
        content.append(Paragraph("COURTROOM SIMULATION - CASE REPORT", title_style))
        content.append(Spacer(1, 12))

        # Case Information Table
        case_data = [
            ['Case ID:', case_id],
            ['Title:', case.get('title', 'N/A')],
            ['Type:', case.get('case_type', 'N/A')],
            ['Status:', case.get('status', 'N/A')],
            ['Created:', case.get('created_at', 'N/A')],
        ]

        case_table = Table(case_data, colWidths=[100, 400])
        case_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        content.append(case_table)
        content.append(Spacer(1, 20))

        # Parties
        content.append(Paragraph("PARTIES INVOLVED", heading_style))
        parties = case.get('parties', {})
        parties_data = [
            ['Plaintiff:', parties.get('plaintiff', 'Not specified')],
            ['Defendant:', parties.get('defendant', 'Not specified')],
            ['Judge:', parties.get('judge', 'AI Judge')],
        ]
        parties_table = Table(parties_data, colWidths=[100, 400])
        parties_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        content.append(parties_table)
        content.append(Spacer(1, 20))

        # Case Description
        content.append(Paragraph("CASE DESCRIPTION", heading_style))
        description = case.get('description', 'No description provided')
        content.append(Paragraph(description, normal_style))
        content.append(Spacer(1, 20))

        # Simulation Results
        simulation_results = case.get('simulation_results')
        if simulation_results:
            content.append(Paragraph("SIMULATION RESULTS", heading_style))
            sim_data = [
                ['Simulation ID:', simulation_results.get('simulation_id', 'N/A')],
                ['Evidence Analyzed:', str(simulation_results.get('evidence_analyzed', 0))],
                ['Generated At:', str(simulation_results.get('generated_at', 'N/A'))],
            ]
            sim_table = Table(sim_data, colWidths=[120, 380])
            sim_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgreen),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            content.append(sim_table)
            content.append(Spacer(1, 12))

            # Simulation Text
            content.append(Paragraph("Simulation Transcript:", styles['Heading3']))
            sim_text = simulation_results.get('simulation_text', 'No simulation text available')
            # Truncate if too long for PDF
            if len(sim_text) > 2000:
                sim_text = sim_text[:2000] + "..."
            content.append(Paragraph(sim_text, normal_style))
            content.append(Spacer(1, 20))

        # Evidence Summary
        evidence_files = list_evidences({'case_id': case_id})
        if evidence_files:
            content.append(Paragraph("EVIDENCE SUMMARY", heading_style))
            evidence_data = [['Title', 'Type', 'Words', 'Uploaded']]
            for evidence in evidence_files[:10]:  # Limit to 10 for PDF
                evidence_data.append([
                    evidence.get('title', 'N/A')[:30],
                    evidence.get('evidence_type', 'N/A'),
                    str(evidence.get('word_count', 0)),
                    str(evidence.get('uploaded_at', 'N/A'))[:10]
                ])

            evidence_table = Table(evidence_data, colWidths=[150, 80, 60, 80])
            evidence_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            content.append(evidence_table)
            content.append(Spacer(1, 20))

        # Footer
        content.append(Paragraph(f"Report generated by Courtroom Simulation System on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", styles['Italic']))

        # Build PDF
        doc.build(content)

        # Prepare response
        buffer.seek(0)
        filename = f"case_report_{case_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

        return send_file(
            buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({'error': 'Failed to generate PDF report'}), 500

# Health check for cases
@case_bp.route('/cases/health', methods=['GET'])
def cases_health_check():
    """Check if case service is working"""
    return jsonify({
        'status': 'Case service is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
