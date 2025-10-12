"""Enhanced PDF Report Generator with Proper Formatting"""

from datetime import datetime
import os
import re

def format_transcript_for_report(transcript, case_data=None):
    """Format transcript with proper structure and spacing for PDF using enhanced formatter"""
    try:
        # Import the new formatter
        from ..transcript_formatter import format_transcript_for_pdf

        # Use the enhanced formatter for better results
        return format_transcript_for_pdf(transcript, case_data)
    except ImportError:
        # Fallback to original formatting if import fails
        print("⚠️ Enhanced transcript formatter not available, using basic formatting")
        return _format_transcript_basic(transcript)


def _format_transcript_basic(transcript):
    """Basic fallback formatting (original implementation)"""
    lines = transcript.split('\n')
    formatted_lines = []

    for line in lines:
        stripped = line.strip()

        # Skip empty lines but preserve spacing
        if not stripped:
            if formatted_lines and formatted_lines[-1] != '':
                formatted_lines.append('')
            continue

        # Format section separators
        if stripped.startswith('='):
            formatted_lines.append('')
            formatted_lines.append(stripped)
            formatted_lines.append('')
            continue

        # Format thinking process markers with proper indentation
        thinking_match = re.match(r'^(■+)\s*(.+)$', stripped)
        if thinking_match:
            level = len(thinking_match.group(1))
            content = thinking_match.group(2)
            indent = '  ' * (level - 1)
            formatted_lines.append(f'{indent}💭 {content}')
            continue

        # Format speaker lines with spacing
        speaker_match = re.match(r'^(JUDGE|PROSECUTOR|DEFENSE|COURT|WITNESS):\s*(.+)$', stripped, re.IGNORECASE)
        if speaker_match:
            speaker = speaker_match.group(1).upper()
            content = speaker_match.group(2)
            formatted_lines.append('')
            formatted_lines.append(f'[{speaker}]')
            # Word wrap long content
            if len(content) > 80:
                words = content.split()
                current_line = []
                current_length = 0
                for word in words:
                    if current_length + len(word) + 1 > 80:
                        formatted_lines.append(f'  {" ".join(current_line)}')
                        current_line = [word]
                        current_length = len(word)
                    else:
                        current_line.append(word)
                        current_length += len(word) + 1
                if current_line:
                    formatted_lines.append(f'  {" ".join(current_line)}')
            else:
                formatted_lines.append(f'  {content}')
            formatted_lines.append('')
            continue

        # Format section titles (all caps)
        if stripped == stripped.upper() and len(stripped) > 5 and ':' not in stripped:
            formatted_lines.append('')
            formatted_lines.append(f'━━━ {stripped} ━━━')
            formatted_lines.append('')
            continue

        # Format bullet points
        if re.match(r'^[-*•]\s+', stripped):
            formatted_lines.append(f'  • {stripped[2:]}')
            continue

        # Regular text - wrap long lines
        if len(stripped) > 80:
            words = stripped.split()
            current_line = []
            current_length = 0

            for word in words:
                if current_length + len(word) + 1 > 80:
                    formatted_lines.append(' '.join(current_line))
                    current_line = [word]
                    current_length = len(word)
                else:
                    current_line.append(word)
                    current_length += len(word) + 1

            if current_line:
                formatted_lines.append(' '.join(current_line))
        else:
            formatted_lines.append(stripped)

    return '\n'.join(formatted_lines)


def generate_simulation_report(case_data, simulation_results, output_path):
    """Generate enhanced PDF report with better formatting"""

    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
        from reportlab.lib.units import inch
    except ImportError as e:
        print(f"⚠️ Reportlab import failed: {e}. Falling back to text report.")
        return _generate_text_report(case_data, simulation_results, output_path)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=50,
        bottomMargin=50
    )

    # Enhanced styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SubHeader',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Speaker',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#1e40af'),
        fontName='Helvetica-Bold',
        spaceAfter=6,
        leftIndent=0,
        spaceBefore=10
    ))
    
    styles.add(ParagraphStyle(
        name='Statement',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        leftIndent=20,
        rightIndent=10,
        spaceAfter=10,
        alignment=TA_JUSTIFY,
        leading=14
    ))
    
    styles.add(ParagraphStyle(
        name='Thinking',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        leftIndent=30,
        rightIndent=10,
        fontName='Helvetica-Oblique',
        spaceAfter=8,
        spaceBefore=5,
        leading=12
    ))
    
    styles.add(ParagraphStyle(
        name='Separator',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#9ca3af'),
        alignment=TA_CENTER,
        spaceAfter=10,
        spaceBefore=10
    ))

    # Content elements
    elements = []

    # Title with professional styling
    title_data = [[Paragraph("⚖️ COURTROOM SIMULATION REPORT", styles['CustomTitle'])]]
    title_table = Table(title_data, colWidths=[6.5*inch])
    title_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 2, colors.HexColor('#2563eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    elements.append(title_table)
    elements.append(Spacer(1, 20))

    # 1. Case Metadata
    elements.append(Paragraph("1. Case Metadata", styles['SectionHeader']))
    elements.append(Spacer(1, 10))
    
    metadata = [
        ['<b>Case ID:</b>', simulation_results.get('simulation_id', 'N/A')],
        ['<b>Case Title:</b>', case_data.get('title', 'Untitled')],
        ['<b>Case Type:</b>', case_data.get('case_type', 'N/A')],
        ['<b>Submitted By:</b>', case_data.get('user_id', 'N/A')],
        ['<b>Date of Simulation:</b>', datetime.now().strftime('%d/%m/%Y')],
        ['<b>Evidence Count:</b>', str(len(case_data.get('evidence_files', [])))]
    ]
    
    metadata_table = Table(metadata, colWidths=[1.5*inch, 5*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#fafafa')])
    ]))
    elements.append(metadata_table)
    elements.append(Spacer(1, 20))

    # 2. Case Summary
    elements.append(Paragraph("2. Case Summary", styles['SectionHeader']))
    elements.append(Spacer(1, 10))
    
    # Case details
    case_details = [
        ['<b>Case Type:</b>', case_data.get('case_type', 'N/A')],
        ['<b>Plaintiff:</b>', case_data.get('parties', {}).get('plaintiff', 'N/A')],
        ['<b>Defendant:</b>', case_data.get('parties', {}).get('defendant', 'N/A')],
        ['<b>Judge:</b>', case_data.get('parties', {}).get('judge', 'AI Judge')]
    ]
    
    details_table = Table(case_details, colWidths=[1.5*inch, 5*inch])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dbeafe'))
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 15))
    
    # Case description
    elements.append(Paragraph("<b>Case Description:</b>", styles['SubHeader']))
    elements.append(Paragraph(case_data.get('description', 'No description provided'), styles['Normal']))
    elements.append(Spacer(1, 20))

    # 3. Simulation Overview
    elements.append(Paragraph("3. Simulation Overview", styles['SectionHeader']))
    elements.append(Spacer(1, 10))
    
    sim_info = [
        ['<b>Simulation Mode:</b>', simulation_results.get('simulation_type', 'N/A')],
        ['<b>AI Model Used:</b>', simulation_results.get('simulation_type', 'local_agents')],
        ['<b>Evidence Analyzed:</b>', str(simulation_results.get('evidence_analyzed', 0))],
        ['<b>Generated At:</b>', str(simulation_results.get('generated_at', 'N/A'))]
    ]
    
    sim_table = Table(sim_info, colWidths=[1.8*inch, 4.7*inch])
    sim_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdf4')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dcfce7'))
    ]))
    elements.append(sim_table)
    elements.append(Spacer(1, 20))

    # 4. Transcript - Start on new page
    elements.append(PageBreak())
    elements.append(Paragraph("4. Transcript of Proceedings", styles['SectionHeader']))
    elements.append(Spacer(1, 15))
    
    transcript = simulation_results.get('simulation_text', '')
    formatted_transcript = format_transcript_for_report(transcript, case_data)
    
    # Parse and format transcript with proper spacing
    for line in formatted_transcript.split('\n'):
        if not line.strip():
            elements.append(Spacer(1, 6))
            continue
            
        # Speaker
        if line.startswith('[') and ']' in line:
            speaker = line[1:line.index(']')]
            elements.append(Paragraph(f"<b>{speaker}:</b>", styles['Speaker']))
            
        # Thinking process
        elif line.strip().startswith('💭'):
            thinking_text = line.strip()[2:].strip()
            elements.append(Paragraph(f"<i>💭 {thinking_text}</i>", styles['Thinking']))
            
        # Section separator
        elif line.startswith('━━━'):
            section_name = line.replace('━━━', '').strip()
            if section_name:
                elements.append(Spacer(1, 15))
                elements.append(Paragraph(section_name, styles['SubHeader']))
                elements.append(Spacer(1, 8))
                
        # Major separator
        elif line.startswith('==='):
            elements.append(Spacer(1, 12))
            elements.append(Paragraph("─" * 60, styles['Separator']))
            elements.append(Spacer(1, 12))
            
        # Bullet points
        elif line.strip().startswith('•'):
            elements.append(Paragraph(line.strip(), styles['Statement']))
            
        # Regular text
        else:
            if line.strip():
                elements.append(Paragraph(line.strip(), styles['Statement']))

    # Footer
    elements.append(Spacer(1, 30))
    footer_text = f"<i>Report generated by Jurix AI System on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC | Report ID: {simulation_results.get('simulation_id', 'N/A')}</i>"
    elements.append(Paragraph(footer_text, styles['Normal']))

    # Build PDF
    try:
        doc.build(elements)
        print(f"✅ PDF report generated successfully: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Error building PDF: {e}")
        return _generate_text_report(case_data, simulation_results, output_path)


def _generate_text_report(case_data, simulation_results, output_path):
    """Fallback text report generation"""
    text_path = output_path.replace('.pdf', '.txt')
    
    try:
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write("⚖️ COURTROOM SIMULATION REPORT\n")
            f.write("=" * 80 + "\n\n")
            
            # 1. Metadata
            f.write("1. Case Metadata\n")
            f.write("-" * 80 + "\n")
            f.write(f"Case ID: {simulation_results.get('simulation_id', 'N/A')}\n")
            f.write(f"Case Title: {case_data.get('title', '')}\n")
            f.write(f"Case Type: {case_data.get('case_type', '')}\n")
            f.write(f"Date: {datetime.now().strftime('%d/%m/%Y')}\n")
            f.write(f"Evidence Count: {len(case_data.get('evidence_files', []))}\n\n")
            
            # 2. Case Summary
            f.write("2. Case Summary\n")
            f.write("-" * 80 + "\n")
            f.write(f"Description: {case_data.get('description', '')}\n")
            f.write(f"Plaintiff: {case_data.get('parties', {}).get('plaintiff', 'N/A')}\n")
            f.write(f"Defendant: {case_data.get('parties', {}).get('defendant', 'N/A')}\n\n")
            
            # 3. Transcript
            f.write("3. Transcript of Proceedings\n")
            f.write("=" * 80 + "\n\n")
            transcript = simulation_results.get('simulation_text', '')
            formatted = format_transcript_for_report(transcript, case_data)
            f.write(formatted + "\n\n")
            
            # Footer
            f.write("\n" + "=" * 80 + "\n")
            f.write(f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC\n")
            f.write("=" * 80 + "\n")
        
        print(f"✅ Text report generated: {text_path}")
        return text_path
        
    except Exception as e:
        print(f"❌ Error generating text report: {e}")
        raise
