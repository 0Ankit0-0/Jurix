import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportReportToPDF = (caseData, report) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('⚖️ Jurix Courtroom Simulation Report', 20, 20);
  
  // Case Info
  doc.setFontSize(12);
  doc.text(`Case ID: ${caseData.case_id}`, 20, 35);
  doc.text(`Title: ${caseData.title}`, 20, 42);
  doc.text(`Type: ${caseData.case_type}`, 20, 49);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 60, 190, 60);
  
  let yPosition = 70;
  
  // Case Description
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Case Description', 20, yPosition);
  yPosition += 7;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const descLines = doc.splitTextToSize(caseData.description, 170);
  doc.text(descLines, 20, yPosition);
  yPosition += descLines.length * 5 + 10;
  
  // Parties
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Parties Involved', 20, yPosition);
  yPosition += 7;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Plaintiff: ${caseData.parties?.plaintiff || 'N/A'}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Defendant: ${caseData.parties?.defendant || 'N/A'}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Judge: ${caseData.parties?.judge || 'AI Judge'}`, 20, yPosition);
  yPosition += 15;
  
  // Evidence Table
  if (caseData.evidence_files && caseData.evidence_files.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Evidence Files', 20, yPosition);
    yPosition += 7;
    
    const evidenceData = caseData.evidence_files.map((ev, idx) => [
      `E${idx + 1}`,
      ev.title || ev.file_name || 'Evidence',
      ev.evidence_type || 'Document'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['ID', 'Description', 'Type']],
      body: evidenceData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Add new page for report analysis
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Analysis', 20, yPosition);
  yPosition += 10;
  
  if (report && report.analysis) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const analysisLines = doc.splitTextToSize(report.analysis, 170);
    
    // Handle pagination for long analysis
    for (let i = 0; i < analysisLines.length; i++) {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(analysisLines[i], 20, yPosition);
      yPosition += 5;
    }
  }
  
  // Performance Metrics
  if (report && report.statistics) {
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Performance Metrics', 20, yPosition);
    yPosition += 10;
    
    const metrics = report.statistics.case_metrics || {};
    Object.entries(metrics).forEach(([key, value]) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`${key.replace(/_/g, ' ')}: ${value}`, 20, yPosition);
      yPosition += 6;
    });
  }
  
  // Footer on last page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  doc.save(`case_report_${caseData.case_id}.pdf`);
};
