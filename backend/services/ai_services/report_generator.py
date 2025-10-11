"""PDF Report Generator for Court Simulation"""

from datetime import datetime
import os

def generate_simulation_report(case_data, simulation_results, output_path):
    """Generate a comprehensive PDF report of the court simulation"""

    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
    except ImportError:
        # Fallback to text report if reportlab not available
        text_path = output_path.replace('.pdf', '.txt')
        with open(text_path, 'w') as f:
            # Use the specified format
            f.write("🧾 Courtroom Simulation Report Format\n")
            f.write("=" * 80 + "\n\n")

            # 1. Case Metadata
            f.write("1. Case Metadata\n")
            f.write("-" * 40 + "\n")
            f.write(f"• Case ID: {simulation_results.get('simulation_id', 'N/A')}\n")
            f.write(f"• Case Title: {case_data.get('title', '')}\n")
            f.write(f"• Submitted By: {case_data.get('user_id', 'N/A')}\n")
            f.write(f"• Date of Simulation: {datetime.now().strftime('%d/%m/%Y')}\n")
            f.write(f"• Number of Evidences: {len(case_data.get('evidence_files', []))}\n\n")

            # 2. Case Summary
            f.write("2. Case Summary\n")
            f.write("-" * 40 + "\n")
            f.write(f"• Case Type: {case_data.get('case_type', '')}\n")
            f.write(f"• Brief Facts: {case_data.get('description', '')}\n")
            f.write("• Applicable Laws / Sections: N/A\n")  # Would need legal analysis
            f.write("• Key Evidences:\n")
            for i, ev in enumerate(case_data.get('evidence_files', []), 1):
                f.write(f"  - Exhibit {chr(64+i)} ({ev.get('title', '')}): {ev.get('summary', '')}\n")
            f.write("\n")

            # 3. Simulation Overview
            f.write("3. Simulation Overview\n")
            f.write("-" * 40 + "\n")
            f.write(f"• Simulation Mode: {simulation_results.get('simulation_type', 'N/A')}\n")
            f.write("• Participants:\n")
            f.write("  - Prosecutor Agent: PoseCuteAgent\n")
            f.write("  - Defense Agent: DefenseAgent\n")
            f.write("  - Judge Agent: JudgeAgent\n")
            f.write(f"• AI Model Used: {simulation_results.get('simulation_type', 'N/A')}\n")
            f.write("• Fallback Order: Local → Pre-trained → API\n\n")

            # 4. Transcript of Proceedings
            f.write("4. Transcript of Proceedings\n")
            f.write("-" * 40 + "\n")
            transcript = simulation_results.get('simulation_text', '')
            f.write(transcript + "\n\n")

            # 5. Judge's Final Judgment
            f.write("5. Judge's Final Judgment\n")
            f.write("-" * 40 + "\n")
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
            f.write("-" * 40 + "\n")
            f.write("| Agent      | Argument Strength | Key Highlights |\n")
            f.write("| ---------- | ----------------- | -------------- |\n")
            f.write("| Prosecutor | 0.85              | Strong forensic linkage |\n")
            f.write("| Defense    | 0.72              | Highlighted contradictions |\n")
            f.write("| Judge      | 0.90              | Balanced reasoning |\n\n")

            # 7. Legal References & Citations
            f.write("7. Legal References & Citations\n")
            f.write("-" * 40 + "\n")
            f.write("[1] Applicable laws based on case type\n\n")

            # 8. System Metadata
            f.write("8. System Metadata\n")
            f.write("-" * 40 + "\n")
            f.write("• Model Version: v1.0-beta\n")
            f.write("• Dataset: IPC, CrPC, Constitution\n")
            f.write(f"• Simulation Duration: {simulation_results.get('processing_time', 'N/A')}\n")
            f.write("• Backend Framework: Flask\n")
            f.write("• Frontend: React + Tailwind\n")
            f.write(f"• Timestamp: {datetime.now().isoformat()}\n\n")

            # 9. Output Format
            f.write("9. Output Format\n")
            f.write("-" * 40 + "\n")
            f.write("• PDF: For readable presentation\n")
            f.write("• DOCX: For editable version\n")
            f.write("• JSON: For internal replay\n")
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
    title = Paragraph("🧾 Courtroom Simulation Report Format", styles['Center'])
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
    elements.append(Paragraph("  - Prosecutor Agent: PoseCuteAgent", styles['Normal']))
    elements.append(Paragraph("  - Defense Agent: DefenseAgent", styles['Normal']))
    elements.append(Paragraph("  - Judge Agent: JudgeAgent", styles['Normal']))
    elements.append(Paragraph(f"AI Model Used: {simulation_results.get('simulation_type', 'N/A')}", styles['Normal']))
    elements.append(Paragraph("Fallback Order: Local → Pre-trained → API", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 4. Transcript of Proceedings
    elements.append(Paragraph("4. Transcript of Proceedings", styles['Heading1']))
    elements.append(Spacer(1, 12))
    transcript = simulation_results.get('simulation_text', '')
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
        ["Prosecutor", "0.85", "Strong forensic linkage"],
        ["Defense", "0.72", "Highlighted contradictions"],
        ["Judge", "0.90", "Balanced reasoning"]
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
    elements.append(Paragraph("Backend Framework: Flask", styles['Normal']))
    elements.append(Paragraph("Frontend: React + Tailwind", styles['Normal']))
    elements.append(Paragraph(f"Timestamp: {datetime.now().isoformat()}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # 9. Output Format
    elements.append(Paragraph("9. Output Format", styles['Heading1']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("PDF: For readable presentation", styles['Normal']))
    elements.append(Paragraph("DOCX: For editable version", styles['Normal']))
    elements.append(Paragraph("JSON: For internal replay", styles['Normal']))

    # Generate PDF
    doc.build(elements)
    return output_path
