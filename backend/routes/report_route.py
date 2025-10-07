from flask import Blueprint, request, jsonify
from datetime import datetime
from model.case_model import get_case_by_id, update_case

# Create Blueprint for report routes
report_bp = Blueprint('reports', __name__)



@report_bp.route('/reports/generate/<case_id>', methods=['POST', 'OPTIONS'])
def generate_detailed_report(case_id):
    """Generate a detailed analysis report for a completed simulation"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print(f"📋 Generating detailed report for case: {case_id}")
        
        # Get case details
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        # Check if simulation exists
        simulation_results = case.get('simulation_results')
        if not simulation_results:
            return jsonify({'error': 'No simulation found for this case. Please run simulation first.'}), 400
        
        simulation_text = simulation_results.get('simulation_text', '')
        
        # Generate detailed report using EnhancedReportGenerator
        print("🔍 Step 1: Generating comprehensive report...")
        from services.document_Service.report_generator import EnhancedReportGenerator
        generator = EnhancedReportGenerator()
        report_data = generator.generate_comprehensive_report(case, simulation_results)
        
        # Save report to case
        print("💾 Step 3: Saving report...")
        update_data = {
            'detailed_report': report_data
        }
        
        update_success = update_case(case_id, update_data)
        
        if not update_success:
            return jsonify({'error': 'Failed to save report'}), 500
        
        print("✅ Report generated successfully!")
        
        return jsonify({
            'message': 'Detailed report generated successfully',
            'report': report_data
        }), 201
        
    except Exception as e:
        print(f"❌ Report generation failed: {e}")
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500

@report_bp.route('/reports/get/<case_id>', methods=['GET', 'OPTIONS'])
def get_case_report(case_id):
    """Get the detailed report for a case"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        detailed_report = case.get('detailed_report')
        if not detailed_report:
            return jsonify({'error': 'No detailed report found. Please generate report first.'}), 404
        
        return jsonify({
            'message': 'Report found',
            'case_id': case_id,
            'report': detailed_report
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting report: {e}")
        return jsonify({'error': 'Failed to get report'}), 500

@report_bp.route('/reports/summary/<case_id>', methods=['GET', 'OPTIONS'])
def get_case_summary(case_id):
    """Get a quick summary of case, simulation, and report status"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        # Check what's available
        has_simulation = bool(case.get('simulation_results'))
        has_report = bool(case.get('detailed_report'))
        
        summary = {
            'case_id': case_id,
            'title': case['title'],
            'case_type': case['case_type'],
            'status': case['status'],
            'created_at': case['created_at'].isoformat() if case.get('created_at') else None,
            'parties': case.get('parties', {}),
            'progress': {
                'case_created': True,
                'simulation_completed': has_simulation,
                'report_generated': has_report
            },
            'next_steps': []
        }
        
        # Suggest next steps
        if not has_simulation:
            summary['next_steps'].append('Run courtroom simulation')
        elif not has_report:
            summary['next_steps'].append('Generate detailed report')
        else:
            summary['next_steps'].append('Case analysis complete!')
        
        # Add simulation info if available
        if has_simulation:
            sim_results = case['simulation_results']
            summary['simulation_info'] = {
                'simulation_id': sim_results.get('simulation_id'),
                'evidence_analyzed': sim_results.get('evidence_analyzed', 0),
                'generated_at': sim_results.get('generated_at').isoformat() if sim_results.get('generated_at') else None
            }
        
        # Add report info if available
        if has_report:
            report = case['detailed_report']
            summary['report_info'] = {
                'report_id': report.get('report_id'),
                'generated_at': report.get('generated_at').isoformat() if report.get('generated_at') else None
            }
        
        return jsonify(summary), 200
        
    except Exception as e:
        print(f"❌ Error getting case summary: {e}")
        return jsonify({'error': 'Failed to get case summary'}), 500

@report_bp.route('/reports/export/<case_id>', methods=['GET', 'OPTIONS'])
def export_case_report(case_id):
    """Export complete case report as formatted text"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        # Build complete export
        export_content = f"""
COURTROOM SIMULATION - COMPLETE CASE REPORT
{'=' * 60}

CASE INFORMATION:
- Case ID: {case_id}
- Title: {case['title']}
- Type: {case['case_type']}
- Status: {case['status']}
- Created: {case.get('created_at', 'Unknown')}

PARTIES INVOLVED:
- Plaintiff: {case.get('parties', {}).get('plaintiff', 'Not specified')}
- Defendant: {case.get('parties', {}).get('defendant', 'Not specified')}
- Judge: {case.get('parties', {}).get('judge', 'AI Judge')}

CASE DESCRIPTION:
{case.get('description', 'No description provided')}
        """
        
        # Add simulation results if available
        if case.get('simulation_results'):
            sim_results = case['simulation_results']
            export_content += f"""

SIMULATION RESULTS:
{'=' * 30}
Simulation ID: {sim_results.get('simulation_id', 'N/A')}
Evidence Analyzed: {sim_results.get('evidence_analyzed', 0)} files
Generated: {sim_results.get('generated_at', 'Unknown')}

SIMULATION TEXT:
{sim_results.get('simulation_text', 'No simulation text available')}
            """
        
        # Add detailed report if available
        if case.get('detailed_report'):
            report = case['detailed_report']
            export_content += f"""

DETAILED ANALYSIS:
{'=' * 30}
Report ID: {report.get('report_id', 'N/A')}
Generated: {report.get('generated_at', 'Unknown')}

{report.get('analysis', 'No detailed analysis available')}
            """
        
        export_content += f"""

{'=' * 60}
Report generated by Courtroom Simulation System
Export Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
{'=' * 60}
        """
        
        return jsonify({
            'message': 'Case report exported successfully',
            'case_id': case_id,
            'export_content': export_content,
            'export_date': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"❌ Error exporting report: {e}")
        return jsonify({'error': 'Failed to export report'}), 500

# Health check for reports service
@report_bp.route('/reports/health', methods=['GET'])
def reports_health_check():
    """Check if reports service is working"""
    return jsonify({
        'status': 'Reports service is running',
        'enhanced_report_generator': '✅ Available',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
