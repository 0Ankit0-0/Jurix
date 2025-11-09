"""
PDF Report Generation Service for Jurix

This service creates detailed, well-formatted PDF reports for legal cases,
integrating advanced transcript formatting and comprehensive case data visualization.
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime

# Import the advanced transcript formatter
try:
    from backend.services.transcript_formatter import format_transcript_for_pdf
except ImportError:
    # Provide a fallback if the formatter is not available
    def format_transcript_for_pdf(transcript, **kwargs):
        return transcript.replace('\n', '<br/>')

# --- Styling ---
def get_custom_styles():
    """Returns a dictionary of custom paragraph styles for the report."""
    styles = getSampleStyleSheet()
    
    # Base font settings
    base_font = 'Helvetica'
    bold_font = 'Helvetica-Bold'
    
    # Color scheme
    primary_color = colors.HexColor('#2563eb')
    secondary_color = colors.HexColor('#4f46e5')
    text_color = colors.HexColor('#374151')
    grey_text = colors.HexColor('#6b7280')

    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['h1'],
        fontName=bold_font,
        fontSize=22,
        leading=28,
        spaceAfter=20,
        alignment=1,
        textColor=primary_color,
    ))
    styles.add(ParagraphStyle(
        name='CustomHeading',
        parent=styles['h2'],
        fontName=bold_font,
        fontSize=16,
        leading=20,
        spaceAfter=12,
        textColor=secondary_color,
        borderBottomWidth=2,
        borderBottomColor=primary_color,
        paddingBottom=6,
    ))
    styles.add(ParagraphStyle(
        name='CustomSubheading',
        parent=styles['h3'],
        fontName=bold_font,
        fontSize=13,
        leading=16,
        spaceAfter=8,
        textColor=secondary_color,
    ))
    styles.add(ParagraphStyle(
        name='Normal',
        parent=styles['Normal'],
        fontName=base_font,
        fontSize=10,
        leading=14,
        spaceAfter=12,
        textColor=text_color,
    ))
    styles.add(ParagraphStyle(
        name='Italic',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        textColor=grey_text,
        alignment=2,
    ))
    styles.add(ParagraphStyle(
        name='Speaker',
        fontName=bold_font,
        fontSize=11,
        textColor=secondary_color,
        spaceAfter=4,
        spaceBefore=8,
    ))
    styles.add(ParagraphStyle(
        name='Statement',
        parent=styles['Normal'],
        leftIndent=20,
    ))

    return styles

# --- Page Template for Headers and Footers ---
class PageTemplate(SimpleDocTemplate):
    """Custom document template to add headers and footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.styles = get_custom_styles()

    def beforePage(self):
        """Adds a header to each page."""
        header = Paragraph("Jurix Simulation - Confidential", self.styles['Italic'])
        header.wrap(self.width, self.topMargin)
        header.drawOn(self.canv, self.leftMargin, self.height + self.topMargin - 30)

    def afterPage(self):
        """Adds a footer with page number and generation date."""
        footer = Paragraph(
            f"Page {self.page} | Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
            self.styles['Italic']
        )
        footer.wrap(self.width, self.bottomMargin)
        footer.drawOn(self.canv, self.leftMargin, 30)

# --- Report Sections ---
def _add_title(content, styles, case_data):
    """Adds the main title of the report."""
    title = case_data.get('title', 'Official Case Report')
    content.append(Paragraph(f"COURTROOM SIMULATION: {title.upper()}", styles['CustomTitle']))
    content.append(Spacer(1, 0.25 * inch))

def _add_case_information(content, styles, case_data):
    """Adds a styled table with general case information."""
    content.append(Paragraph("CASE INFORMATION", styles['CustomHeading']))
    
    created_at = case_data.get('created_at')
    if isinstance(created_at, datetime):
        created_at = created_at.strftime('%Y-%m-%d %H:%M')
    
    case_info = [
        ['Case ID:', case_data.get('case_id', 'N/A')],
        ['Case Type:', case_data.get('case_type', 'N/A')],
        ['Status:', case_data.get('status', 'N/A').replace('_', ' ').title()],
        ['Created On:', created_at or 'N/A'],
    ]
    
    table = Table(case_info, colWidths=[1.5 * inch, 5 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    content.append(table)
    content.append(Spacer(1, 0.4 * inch))

def _add_parties_involved(content, styles, case_data):
    """Adds a table with all parties involved, including victims and witnesses."""
    content.append(Paragraph("PARTIES INVOLVED", styles['CustomHeading']))
    parties = case_data.get('parties', {})
    
    # Handle list of victims/witnesses
    victims = parties.get('victims', [])
    witnesses = parties.get('witnesses', [])
    
    parties_info = [
        ['Plaintiff:', parties.get('plaintiff', 'Not specified')],
        ['Defendant:', parties.get('defendant', 'Not specified')],
        ['Victim(s):', ', '.join(victims) if victims else 'Not specified'],
        ['Witness(es):', ', '.join(witnesses) if witnesses else 'Not specified'],
        ['Presiding Judge:', parties.get('judge', 'AI Judge')],
    ]
    
    table = Table(parties_info, colWidths=[1.5 * inch, 5 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eff6ff')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dbeafe')),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    content.append(table)
    content.append(Spacer(1, 0.4 * inch))

def _add_case_description(content, styles, case_data):
    """Adds the detailed case description."""
    content.append(Paragraph("CASE DESCRIPTION", styles['CustomHeading']))
    description = case_data.get('description', 'No description provided.').replace('\n', '<br/>')
    content.append(Paragraph(description, styles['Normal']))
    content.append(Spacer(1, 0.4 * inch))

def _add_simulation_transcript(content, styles, case_data):
    """Adds the formatted simulation transcript."""
    content.append(Paragraph("SIMULATION TRANSCRIPT", styles['CustomHeading']))
    simulation_results = case_data.get('simulation_results')
    
    if simulation_results and simulation_results.get('simulation_text'):
        raw_transcript = simulation_results['simulation_text']
        
        # Use the advanced formatter
        formatted_transcript = format_transcript_for_pdf(raw_transcript, case_context=case_data)
        
        # Parse and add to PDF with styling
        for line in formatted_transcript.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            if re.match(r'^(JUDGE|PROSECUTOR|DEFENSE|WITNESS):', line, re.IGNORECASE):
                speaker, rest = line.split(':', 1)
                content.append(Paragraph(f"<b>{speaker.strip()}:</b>", styles['Speaker']))
                content.append(Paragraph(rest.strip(), styles['Statement']))
            elif line.startswith('---'):
                content.append(Spacer(1, 12))
                content.append(Paragraph('─' * 80, styles['Normal']))
                content.append(Spacer(1, 12))
            else:
                content.append(Paragraph(line, styles['Normal']))
    else:
        content.append(Paragraph("No simulation transcript available.", styles['Normal']))
        
    content.append(Spacer(1, 0.4 * inch))

def _add_verdict(content, styles, case_data):
    """Adds the final verdict and justification."""
    verdict = case_data.get('verdict')
    if verdict:
        content.append(Paragraph("VERDICT", styles['CustomHeading']))
        outcome = verdict.get('outcome', 'No verdict reached.')
        justification = verdict.get('justification', 'No justification provided.').replace('\n', '<br/>')
        
        content.append(Paragraph(f"<b>Outcome:</b> {outcome}", styles['Normal']))
        content.append(Paragraph(f"<b>Justification:</b>", styles['CustomSubheading']))
        content.append(Paragraph(justification, styles['Normal']))
        content.append(Spacer(1, 0.4 * inch))

def _add_evidence_summary(content, styles, evidence_list):
    """Adds a table summarizing the case evidence."""
    if evidence_list:
        content.append(Paragraph("EVIDENCE SUMMARY", styles['CustomHeading']))
        evidence_data = [['#', 'Title', 'Type', 'Word Count', 'Upload Date']]
        
        for i, evidence in enumerate(evidence_list, 1):
            uploaded_at = evidence.get('uploaded_at')
            if isinstance(uploaded_at, datetime):
                uploaded_at = uploaded_at.strftime('%Y-%m-%d')
            
            evidence_data.append([
                i,
                Paragraph(evidence.get('title', 'N/A')[:40], styles['Normal']),
                evidence.get('evidence_type', 'N/A'),
                str(evidence.get('word_count', 0)),
                uploaded_at or 'N/A'
            ])

        table = Table(evidence_data, colWidths=[0.4*inch, 2.5*inch, 1*inch, 1*inch, 1.1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ]))
        content.append(table)
        content.append(Spacer(1, 0.4 * inch))

def _add_timeline_of_events(content, styles, evidence_list):
    """Adds a timeline of events based on evidence upload dates."""
    content.append(Paragraph("TIMELINE OF KEY EVENTS", styles['CustomHeading']))
    
    if not evidence_list:
        content.append(Paragraph("No evidence available to construct a timeline.", styles['Normal']))
        return

    # Sort evidence by upload date
    try:
        sorted_evidence = sorted(evidence_list, key=lambda e: e.get('uploaded_at') or datetime.min)
    except TypeError:
        # Fallback if dates are mixed types
        sorted_evidence = evidence_list

    timeline_data = [['Date', 'Event (Evidence Uploaded)']]
    for item in sorted_evidence:
        date = item.get('uploaded_at')
        if isinstance(date, datetime):
            date = date.strftime('%Y-%m-%d %H:%M')
        
        title = item.get('title', 'Untitled Evidence')
        timeline_data.append([date or 'N/A', Paragraph(title, styles['Normal'])])

    table = Table(timeline_data, colWidths=[1.5 * inch, 5 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2ff')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dbeafe')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    content.append(table)
    content.append(Spacer(1, 0.4 * inch))

# --- Main PDF Generation Function ---
def generate_case_pdf(case_data, evidence_list):
    """
    Generates a comprehensive, multi-page PDF report for a given case.

    Args:
        case_data (dict): The case details.
        evidence_list (list): A list of evidence associated with the case.

    Returns:
        BytesIO: A buffer containing the generated PDF.
    """
    buffer = BytesIO()
    styles = get_custom_styles()
    
    doc = PageTemplate(buffer, pagesize=letter, topMargin=inch, bottomMargin=inch)

    content = []

    # Build the report section by section
    _add_title(content, styles, case_data)
    _add_case_information(content, styles, case_data)
    _add_parties_involved(content, styles, case_data)
    _add_case_description(content, styles, case_data)
    
    content.append(PageBreak())
    
    _add_simulation_transcript(content, styles, case_data)
    _add_verdict(content, styles, case_data)
    
    content.append(PageBreak())
    
    _add_evidence_summary(content, styles, evidence_list)
    _add_timeline_of_events(content, styles, evidence_list)

    doc.build(content)
    buffer.seek(0)
    return buffer
