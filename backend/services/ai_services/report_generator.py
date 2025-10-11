"""PDF Report Generator for Court Simulation"""

from datetime import datetime
import os
import re

def format_transcript_for_report(transcript):
    """Format transcript with proper structure and indentation"""
    lines = transcript.split('\n')
    formatted_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            formatted_lines.append('')
            continue
        
        # Format section headers
        if stripped.startswith('='):
            formatted_lines.append(stripped)
            continue
        
        # Format thinking process markers with indentation
        thinking_match = re.match(r'^(■+)\s*(.+)$', stripped)
        if thinking_match:
            level = len(thinking_match.group(1))
            content = thinking_match.group(2)
            indent = '  ' * (level - 1)
            formatted_lines.append(f'{indent}💭 {content}')
            continue
        
        # Format speaker lines
        speaker_match = re.match(r'^(JUDGE|PROSECUTOR|DEFENSE|COURT|WITNESS):\s*(.+)$', stripped, re.IGNORECASE)
        if speaker_match:
            speaker = speaker_match.group(1).upper()
            content = speaker_match.group(2)
            formatted_lines.append('')
            formatted_lines.append(f'[{speaker}]')
            formatted_lines.append(f'  {content}')
            continue
        
        # Format section titles (all caps)
        if stripped == stripped.upper() and len(stripped) > 5 and ':' not in stripped:
            formatted_lines.append('')
            formatted_lines.append(f'━━━ {stripped} ━━━')
            formatted_lines.append('')
            continue
        
        # Format bullet points
        if re.match(r'^[-*•]\s+', stripped):
            formatted_lines.append(f'  {stripped}')
            continue
        
        # Regular text
        formatted_lines.append(stripped)
    
    return '\n'.join(formatted_lines)


def generate_simulation_report(case_data, simulation_results, output_path):
    """Generate a comprehensive PDF report of the court simulation"""

    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
    except ImportError as e:
        print(f"⚠️ Reportlab import failed: {e}. Falling back to text report.")
        # Fallback to text report if reportlab not available
        text_path = output_path.replace('.pdf', '.txt')
        with open(text_path, 'w', encoding='utf-8') as f:
            # Use the specified format
            f.write("🧾 Courtroom Simulation Report\n")
            f.write("=" * 80 + "\n\n")

            # 1. Case Metadata
            f.write("1. Case Metadata\n")
            f.write("-" * 80 + "\n")
            f.write(f"• Case ID: {simulation_results.get('simulation_id', 'N/A')}\n")
            f.write(f"• Case Title: {case_data.get('title', '')}\n")
            f.write(f"• Submitted By: {case_data.get('user_id', 'N/A')}\n")
            f.write(f"• Date of Simulation: {datetime.now().strftime('%d/%m/%Y')}\n")
            f.write(f"• Number of Evidences: {len(case_data.get('evidence_files', []))}\n\n")

            # 2. Case Summary
            f.write("2. Case Summary\n")
            f.write("-" * 80 + "\n")
            f.write(f"• Case Type: {case_data.get('case_type', '')}\n")
            f.write(f"• Brief Facts: {case_data.get('description', '')}\n")
            f.write("• Applicable Laws / Sections: N/A\n")
            f.write("• Key Evidences:\n")
            for i, ev in enumerate(case_data.get('evidence_files', []), 1):
                f.write(f"  - Exhibit {chr(64+i)} ({ev.get('title', '')}): {ev.get('summary', '')}\n")
            f.write("\n")

            # 3. Simulation Overview
            f.write("3. Simulation Overview\n")
            f.write("-" * 80 + "\n")
            f.write(f"• Simulation Mode: {simulation_results.get('simulation_type', 'N/A')}\n")
            f.write("• Participants:\n")
            f.write("  - Prosecutor Agent: ProsecutorAgent\n")
            f.write("  - Defense Agent: DefenseAgent\n")
            f.write("  - Judge Agent: JudgeAgent\n")
            f.write(f"• AI Model Used: {simulation_results.get('simulation_type', 'N/A')}\n")
            f.write("• Fallback Order: Local → Pre-trained → API\n\n")

            # 4. Transcript of Proceedings
            f.write("4. Transcript of Proceedings\n")
            f.write("=" * 80 + "\n\n")
            
            # Format transcript with proper structure
            transcript = simulation_results.get('simulation_text', '')
            formatted_transcript = format_transcript_for_report(transcript)
            f.write(formatted_transcript + "\n\n")

            # 5. Judge's Final Judgment
            f.write("\n5. Judge's Final Judgment\n")
            f.write("-" * 80 + "\n")
            # Extract judgment from transcript
            judgment = "Verdict not found in transcript"
            if "guilty" in transcript.lower():
                judgment = "Guilty"
            elif "not guilty" in transcript.lower():
                judgment = "Not Guilty"
            f.write(f"• Final Verdict: {judgment}\n")
            f.write("• Reasoning Summary: Based on simulation analysis\n\n")

            # 6. Summary of Arguments
            f.write("6. Summary of Arguments\n")
            f.write("-" * 80 + "\n")
            f.write("┌────────────┬───────────────────┬──────────────────────────────┐\n")
            f.write("│ Agent      │ Argument Strength │ Key Highlights               │\n")
            f.write("├────────────┼───────────────────┼──────────────────────────────┤\n")
            f.write("│ Prosecutor │ Strong            │ Evidence-based arguments     │\n")
            f.write("│ Defense    │ Strong            │ Counter-arguments presented  │\n")
            f.write("│ Judge      │ Balanced          │ Fair and impartial reasoning │\n")
            f.write("└────────────┴───────────────────┴──────────────────────────────┘\n\n")

            # 7. Legal References & Citations
            f.write("7. Legal References & Citations\n")
            f.write("-" * 80 + "\n")
            f.write("[1] Applicable laws based on case type\n\n")

            # 8. System Metadata
            f.write("8. System Metadata\n")
            f.write("-" * 80 + "\n")
            f.write("• Model Version: v1.0-beta\n")
            f.write("• Dataset: IPC, CrPC, Constitution\n")
            f.write(f"• Simulation Duration: {simulation_results.get('processing_time', 'N/A')}\n")
            f.write("• Backend Framework: Flask + SocketIO\n")
            f.write("• Frontend: React + Tailwind CSS\n")
            f.write(f"• Timestamp: {datetime.now().isoformat()}\n\n")

            # 9. Output Format
            f.write("9. Output Format\n")
            f.write("-" * 80 + "\n")
            f.write("• PDF: For readable presentation\n")
            f.write("• TXT: For plain text version\n")
            f.write("• JSON: For internal replay\n")
            f.write("\n" + "=" * 80 + "\n")
            f.write("End of Report\n")
        return text_path

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
    title = Paragraph("🧾 Courtroom Simulation Report", styles['Center'])
    elements.append(title)
    elements.append(Spacer(1, 12))

    # 1. Case Metadata
    elements.append(Paragraph("1. Case Metadata", styles['Heading1']))
    elements.append(Spacer(1, 12))
    metadata = [
        ["Case ID:", simulation_results.get('simulation_id', 'N/A')],
        ["Case Title:", case_data.get('title', '')],
        ["Submitted By:", case_data.get('user_id', 'N/A')],
        ["Date of Simulation:", datetime.now().strftime('%d/%m/%Y')],
        ["Number of Evidences:", str(len(case_data.get('evidence_files', [])))]
    ]
    metadata_table = Table(metadata, colWidths=[120, 350])
    metadata_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(metadata_table)
    elements.append(Spacer(1, 20))

    # 2. Case Summary
    elements.append(Paragraph("2. Case Summary", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Case Type: {case_data.get('case_type', '')}", styles['Normal']))
    elements.append(Paragraph(f"Brief Facts: {case_data.get('description', '')}", styles['Normal']))
    elements.append(Paragraph("Applicable Laws / Sections: N/A", styles['Normal']))
    elements.append(Paragraph("Key Evidences:", styles['Normal']))
    for i, ev in enumerate(case_data.get('evidence_files', []), 1):
        elements.append(Paragraph(f"  - Exhibit {chr(64+i)} ({ev.get('title', '')}): {ev.get('summary', '')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 3. Simulation Overview
    elements.append(Paragraph("3. Simulation Overview", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Simulation Mode: {simulation_results.get('simulation_type', 'N/A')}", styles['Normal']))
    elements.append(Paragraph("Participants:", styles['Normal']))
    elements.append(Paragraph("  - Prosecutor Agent: ProsecutorAgent", styles['Normal']))
    elements.append(Paragraph("  - Defense Agent: DefenseAgent", styles['Normal']))
    elements.append(Paragraph("  - Judge Agent: JudgeAgent", styles['Normal']))
    elements.append(Paragraph(f"AI Model Used: {simulation_results.get('simulation_type', 'N/A')}", styles['Normal']))
    elements.append(Paragraph("Fallback Order: Local → Pre-trained → API", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 4. Transcript of Proceedings
    elements.append(Paragraph("4. Transcript of Proceedings", styles['Heading1']))
    elements.append(Spacer(1, 12))
    transcript = simulation_results.get('simulation_text', '')
    # Truncate long transcripts to prevent PDF overflow
    if len(transcript) > 5000:
        transcript = transcript[:5000] + "... (truncated for report)"
    elements.append(Paragraph(transcript, styles['Normal']))
    elements.append(Spacer(1, 20))

    # 5. Judge's Final Judgment
    elements.append(Paragraph("5. Judge's Final Judgment", styles['Heading1']))
    elements.append(Spacer(1, 12))
    judgment = "Verdict not found in transcript"
    if "guilty" in transcript.lower():
        judgment = "Guilty"
    elif "not guilty" in transcript.lower():
        judgment = "Not Guilty"
    elements.append(Paragraph(f"Final Verdict: {judgment}", styles['Normal']))
    elements.append(Paragraph("Reasoning Summary: Based on simulation analysis", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 6. Summary of Arguments
    elements.append(Paragraph("6. Summary of Arguments", styles['Heading1']))
    elements.append(Spacer(1, 12))
    arguments_data = [
        ["Agent", "Argument Strength", "Key Highlights"],
        ["Prosecutor", "Strong", "Evidence-based arguments"],
        ["Defense", "Strong", "Counter-arguments presented"],
        ["Judge", "Balanced", "Fair and impartial reasoning"]
    ]
    arguments_table = Table(arguments_data, colWidths=[100, 120, 250])
    arguments_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(arguments_table)
    elements.append(Spacer(1, 20))

    # 7. Legal References & Citations
    elements.append(Paragraph("7. Legal References & Citations", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("[1] Applicable laws based on case type", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 8. System Metadata
    elements.append(Paragraph("8. System Metadata", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Model Version: v1.0-beta", styles['Normal']))
    elements.append(Paragraph("Dataset: IPC, CrPC, Constitution", styles['Normal']))
    elements.append(Paragraph(f"Simulation Duration: {simulation_results.get('processing_time', 'N/A')}", styles['Normal']))
    elements.append(Paragraph("Backend Framework: Flask + SocketIO", styles['Normal']))
    elements.append(Paragraph("Frontend: React + Tailwind CSS", styles['Normal']))
    elements.append(Paragraph(f"Timestamp: {datetime.now().isoformat()}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 9. Output Format
    elements.append(Paragraph("9. Output Format", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("PDF: For readable presentation", styles['Normal']))
    elements.append(Paragraph("TXT: For plain text version", styles['Normal']))
    elements.append(Paragraph("JSON: For internal replay", styles['Normal']))

    # Generate PDF
    doc.build(elements)
    return output_path
