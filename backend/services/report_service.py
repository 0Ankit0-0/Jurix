
import os
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

class ReportService:
    def __init__(self, db):
        self.db = db
        
    def generate_pdf_report(self, simulation):
        """Generate PDF report for simulation"""
        try:
            # Create temporary file
            temp_dir = tempfile.gettempdir()
            pdf_filename = f"simulation_report_{simulation['_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            pdf_path = os.path.join(temp_dir, pdf_filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(pdf_path, pagesize=A4)
            styles = getSampleStyleSheet()
            story = []
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=1  # Center alignment
            )
            
            story.append(Paragraph("Simulation Report", title_style))
            story.append(Spacer(1, 20))
            
            # Case Information
            story.append(Paragraph("Case Information", styles['Heading2']))
            case_info = [
                ['Case Title:', simulation.get('case_title', 'N/A')],
                ['Simulation Date:', simulation.get('created_at', datetime.now()).strftime('%Y-%m-%d %H:%M:%S')],
                ['Status:', simulation.get('status', 'N/A')]
            ]
            
            case_table = Table(case_info, colWidths=[2*inch, 4*inch])
            case_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.grey),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(case_table)
            story.append(Spacer(1, 20))
            
            # Results Section
            if simulation.get('results'):
                story.append(Paragraph("Simulation Results", styles['Heading2']))
                results = simulation['results']
                
                for key, value in results.items():
                    story.append(Paragraph(f"<b>{key.replace('_', ' ').title()}:</b> {value}", styles['Normal']))
                
                story.append(Spacer(1, 20))
            
            # Analysis Section
            if simulation.get('analysis'):
                story.append(Paragraph("Analysis", styles['Heading2']))
                analysis = simulation['analysis']
                
                if isinstance(analysis, dict):
                    for key, value in analysis.items():
                        story.append(Paragraph(f"<b>{key.replace('_', ' ').title()}:</b>", styles['Heading3']))
                        story.append(Paragraph(str(value), styles['Normal']))
                        story.append(Spacer(1, 10))
            
            # Build PDF
            doc.build(story)
            
            # Return path to generated PDF
            return pdf_path
            
        except Exception as e:
            print(f"Error generating PDF report: {str(e)}")
            raise
