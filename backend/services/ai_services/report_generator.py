"""PDF Report Generator for Court Simulation"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from datetime import datetime
import os

def generate_simulation_report(case_data, simulation_results, output_path):
    """Generate a comprehensive PDF report of the court simulation"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='Justify',
        alignment=TA_JUSTIFY
    ))
    styles.add(ParagraphStyle(
        name='Center',
        alignment=TA_CENTER,
        fontSize=14,
        spaceAfter=30
    ))
    
    # Content elements
    elements = []
    
    # Title
    title = Paragraph(f"Court Simulation Report", styles['Center'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Case Information
    elements.append(Paragraph("Case Information", styles['Heading1']))
    elements.append(Spacer(1, 12))
    case_info = [
        ["Case Title:", case_data.get('title', '')],
        ["Case Type:", case_data.get('case_type', '')],
        ["Date:", datetime.now().strftime("%B %d, %Y")],
        ["Status:", case_data.get('status', '')]
    ]
    case_table = Table(case_info, colWidths=[120, 350])
    case_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(case_table)
    elements.append(Spacer(1, 20))
    
    # Participants
    elements.append(Paragraph("Court Participants", styles['Heading1']))
    elements.append(Spacer(1, 12))
    if case_data.get('parties'):
        parties = case_data['parties']
        participants = [
            ["Role", "Name"],
            ["Judge", parties.get('judge', '')],
            ["Plaintiff/Prosecutor", parties.get('plaintiff', '')],
            ["Defendant", parties.get('defendant', '')]
        ]
        part_table = Table(participants, colWidths=[120, 350])
        part_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(part_table)
    elements.append(Spacer(1, 20))
    
    # Simulation Results
    elements.append(Paragraph("Simulation Analysis", styles['Heading1']))
    elements.append(Spacer(1, 12))
    
    # Add thinking processes for each role
    for turn in simulation_results.get('turns', []):
        # Role header
        elements.append(Paragraph(f"{turn['role']} Analysis", styles['Heading2']))
        elements.append(Spacer(1, 6))
        
        # Thinking process
        if turn.get('thinking_process'):
            process_text = turn['thinking_process']
            elements.append(Paragraph(process_text, styles['Justify']))
            elements.append(Spacer(1, 12))
        
        # Statement
        if turn.get('message'):
            elements.append(Paragraph("Statement:", styles['Heading3']))
            elements.append(Paragraph(turn['message'], styles['Normal']))
            elements.append(Spacer(1, 12))
    
    # Final Judgment
    elements.append(Paragraph("Final Judgment", styles['Heading1']))
    elements.append(Spacer(1, 12))
    if simulation_results.get('final_judgment'):
        elements.append(Paragraph(simulation_results['final_judgment'], styles['Justify']))
    
    # Generate PDF
    doc.build(elements)
    return output_path