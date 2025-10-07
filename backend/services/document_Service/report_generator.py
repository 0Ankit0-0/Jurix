from datetime import datetime
import json
from typing import Dict, Any, List
import uuid
import os

class EnhancedReportGenerator:
    """Generate comprehensive case reports with your requested format"""
    
    def __init__(self):
        self.report_template = self._load_enhanced_template()
    
    def _load_enhanced_template(self):
        """Load enhanced report template matching your specifications"""
        return {
            'header': {
                'title': 'Jurix Courtroom Simulation Report',
                'logo': '⚖️',
            },
            'sections': [
                'case_details',
                'evidence_overview', 
                'court_proceedings',
                'legal_reasoning',
                'simulation_outcome',
                'performance_metrics',
                'learning_feedback'
            ]
        }
    
    def generate_case_id(self, case_data: Dict) -> str:
        """Generate formatted case ID"""
        case_type = case_data.get('case_type', 'MISC')
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        
        return f"CASE-{case_type.upper()[:4]}-{timestamp}-{unique_id}"
    
    def format_evidence_table(self, evidence_list: List[Dict]) -> List[Dict]:
        """Format evidence into structured table format"""
        formatted_evidence = []
        
        for idx, evidence in enumerate(evidence_list, 1):
            formatted_evidence.append({
                'evidence_id': f'E{idx}',
                'description': evidence.get('title', f'Evidence {idx}'),
                'type': evidence.get('type', 'Document'),
                'file_name': evidence.get('file_name', 'N/A'),
                'status': 'Analyzed',
                'link': f"#evidence-{idx}",
                'relevance_score': self._calculate_relevance(evidence),
                'admissibility': 'Admitted'
            })
        
        return formatted_evidence
    
    def _calculate_relevance(self, evidence: Dict) -> float:
        """Calculate evidence relevance score (0-10)"""
        # Simple scoring based on content length and type
        content = evidence.get('content', '')
        evidence_type = evidence.get('type', '').lower()
        
        base_score = 5.0
        
        # Adjust based on content length
        if len(content) > 1000:
            base_score += 1.0
        elif len(content) < 100:
            base_score -= 1.0
        
        # Adjust based on evidence type
        type_weights = {
            'document': 0.5,
            'image': 0.3,
            'video': 0.8,
            'audio': 0.6,
            'witness': 1.0
        }
        
        base_score += type_weights.get(evidence_type, 0.0)
        
        return min(10.0, max(0.0, base_score))
    
    def extract_transcript_highlights(self, simulation_text: str) -> List[Dict]:
        """Extract key highlights from simulation transcript"""
        if not simulation_text:
            return []
        
        highlights = []
        sections = simulation_text.split('\n')
        
        for section in sections:
            section = section.strip()
            if not section:
                continue
                
            # Identify key moments
            if any(keyword in section.lower() for keyword in ['judge:', 'judgment', 'verdict', 'decision']):
                highlights.append({
                    'type': 'Judicial Decision',
                    'speaker': 'Judge',
                    'content': section,
                    'timestamp': 'N/A',
                    'importance': 'High'
                })
            elif 'prosecutor:' in section.lower() or 'prosecution:' in section.lower():
                highlights.append({
                    'type': 'Prosecution Argument',
                    'speaker': 'Prosecutor',
                    'content': section,
                    'timestamp': 'N/A',
                    'importance': 'Medium'
                })
            elif 'defense:' in section.lower():
                highlights.append({
                    'type': 'Defense Argument',
                    'speaker': 'Defense',
                    'content': section,
                    'timestamp': 'N/A',
                    'importance': 'Medium'
                })
        
        return highlights[:10]  # Return top 10 highlights
    
    def calculate_performance_metrics(self, case_data: Dict, simulation_results: Dict) -> Dict:
        """Calculate performance metrics for the simulation"""
        simulation_text = simulation_results.get('simulation_text', '')
        evidence_count = len(case_data.get('evidence_files', []))
        
        metrics = {
            'case_complexity': self._assess_complexity(case_data),
            'evidence_utilization': self._calculate_evidence_usage(evidence_count, simulation_text),
            'legal_accuracy': self._assess_legal_accuracy(simulation_text),
            'procedural_compliance': self._assess_procedure(simulation_text),
            'argument_quality': self._assess_arguments(simulation_text),
            'overall_score': 0.0,
            'processing_time': simulation_results.get('processing_time', 'Unknown'),
            'simulation_length': len(simulation_text.split()) if simulation_text else 0,
            'ai_confidence': self._calculate_ai_confidence(simulation_results)
        }
        
        # Calculate overall score
        scores = [
            metrics['case_complexity'],
            metrics['evidence_utilization'],
            metrics['legal_accuracy'],
            metrics['procedural_compliance'],
            metrics['argument_quality']
        ]
        metrics['overall_score'] = sum(scores) / len(scores)
        
        return metrics
    
    def _assess_complexity(self, case_data: Dict) -> float:
        """Assess case complexity (0-10)"""
        complexity_score = 5.0
        
        # Case type complexity
        complex_types = ['constitutional', 'corporate', 'criminal']
        if case_data.get('case_type', '').lower() in complex_types:
            complexity_score += 1.5
        
        # Evidence count
        evidence_count = len(case_data.get('evidence_files', []))
        if evidence_count > 5:
            complexity_score += 1.0
        elif evidence_count < 2:
            complexity_score -= 1.0
        
        # Description length (more detailed = more complex)
        description = case_data.get('description', '')
        if len(description) > 500:
            complexity_score += 0.5
        
        return min(10.0, max(1.0, complexity_score))
    
    def _calculate_evidence_usage(self, evidence_count: int, simulation_text: str) -> float:
        """Calculate how well evidence was utilized (0-10)"""
        if evidence_count == 0:
            return 0.0
        
        # Count evidence mentions in simulation
        evidence_mentions = simulation_text.lower().count('evidence')
        utilization_score = min(10.0, (evidence_mentions / evidence_count) * 2)
        
        return utilization_score
    
    def _assess_legal_accuracy(self, simulation_text: str) -> float:
        """Assess legal accuracy based on legal terminology (0-10)"""
        legal_terms = [
            'objection', 'sustained', 'overruled', 'evidence', 'witness', 
            'testimony', 'cross-examination', 'verdict', 'judgment', 'ruling',
            'motion', 'procedure', 'law', 'statute', 'precedent'
        ]
        
        term_count = sum(1 for term in legal_terms if term in simulation_text.lower())
        accuracy_score = min(10.0, (term_count / len(legal_terms)) * 10)
        
        return accuracy_score
    
    def _assess_procedure(self, simulation_text: str) -> float:
        """Assess procedural compliance (0-10)"""
        required_procedures = [
            'opening', 'evidence', 'closing', 'judgment'
        ]
        
        procedure_score = 0
        for proc in required_procedures:
            if proc in simulation_text.lower():
                procedure_score += 2.5
        
        return min(10.0, procedure_score)
    
    def _assess_arguments(self, simulation_text: str) -> float:
        """Assess argument quality (0-10)"""
        argument_indicators = [
            'because', 'therefore', 'however', 'furthermore', 'nevertheless',
            'consequently', 'moreover', 'thus', 'hence', 'whereas'
        ]
        
        indicator_count = sum(1 for indicator in argument_indicators if indicator in simulation_text.lower())
        argument_score = min(10.0, (indicator_count / 5) * 10)
        
        return argument_score
    
    def _calculate_ai_confidence(self, simulation_results: Dict) -> float:
        """Calculate AI confidence in simulation (0-10)"""
        # Base confidence
        confidence = 7.0
        
        # Adjust based on simulation type
        sim_type = simulation_results.get('simulation_type', '')
        if sim_type == 'local_agents':
            confidence = 8.5
        elif sim_type == 'openai':
            confidence = 9.0
        elif sim_type == 'static_fallback':
            confidence = 5.0
        
        return confidence
    
    def generate_learning_feedback(self, case_data: Dict, performance_metrics: Dict) -> Dict:
        """Generate learning feedback and suggestions"""
        feedback = {
            'strengths': [],
            'areas_for_improvement': [],
            'recommendations': [],
            'learning_objectives': [],
            'next_steps': []
        }
        
        # Analyze performance and generate feedback
        overall_score = performance_metrics['overall_score']
        
        if overall_score >= 8.0:
            feedback['strengths'].extend([
                'Excellent case preparation and presentation',
                'Strong understanding of legal procedures',
                'Effective use of evidence'
            ])
        elif overall_score >= 6.0:
            feedback['strengths'].extend([
                'Good grasp of basic legal concepts',
                'Adequate evidence utilization'
            ])
            feedback['areas_for_improvement'].extend([
                'Enhance legal argumentation skills',
                'Improve procedural knowledge'
            ])
        else:
            feedback['areas_for_improvement'].extend([
                'Strengthen fundamental legal knowledge',
                'Improve case preparation',
                'Better evidence organization'
            ])
        
        # Generate recommendations based on case type
        case_type = case_data.get('case_type', '').lower()
        feedback['recommendations'].extend([
            f'Study more {case_type} law cases',
            'Practice courtroom procedures',
            'Review evidence presentation techniques'
        ])
        
        feedback['learning_objectives'] = [
            'Master legal terminology and procedures',
            'Develop strong analytical skills',
            'Improve oral argumentation',
            'Understand evidence rules and admissibility'
        ]
        
        feedback['next_steps'] = [
            'Try a more complex case scenario',
            'Focus on cross-examination techniques',
            'Study relevant case law and precedents',
            'Practice with different case types'
        ]
        
        return feedback
    
    def generate_comprehensive_report(self, case_data: Dict, simulation_results: Dict = None) -> Dict:
        """Generate comprehensive report matching your requested format"""
        
        # Generate case ID
        case_id = self.generate_case_id(case_data)
        current_date = datetime.utcnow().strftime('%d/%m/%Y')
        
        # Initialize report structure
        report = {
            'report_id': f"RPT_{case_id}_{int(datetime.utcnow().timestamp())}",
            'generated_at': datetime.utcnow().isoformat(),
            'format_version': '2.0',
            
            # Header Information
            'header': {
                'title': 'Jurix Courtroom Simulation Report',
                'case_id': case_id,
                'date_of_simulation': current_date,
                'case_title': case_data.get('title', 'Untitled Case'),
                'simulation_mode': self._determine_simulation_mode(case_data)
            },
            
            # 1. Case Details
            'case_details': {
                'charges_sections': case_data.get('charges', 'Not specified'),
                'parties_involved': {
                    'prosecution': case_data.get('parties', {}).get('plaintiff', 'State Prosecutor'),
                    'defense': case_data.get('parties', {}).get('defendant', 'Defense Attorney'),
                    'judge': case_data.get('parties', {}).get('judge', 'AI Judge')
                },
                'case_summary': case_data.get('description', 'No description provided'),
                'case_type': case_data.get('case_type', 'General'),
                'jurisdiction': 'AI Simulation Court',
                'case_status': case_data.get('status', 'Completed')
            },
            
            # 2. Evidence Overview
            'evidence_overview': {
                'evidence_table': self.format_evidence_table(case_data.get('evidence_files', [])),
                'total_evidence_count': len(case_data.get('evidence_files', [])),
                'evidence_summary': f"{len(case_data.get('evidence_files', []))} pieces of evidence analyzed and processed"
            },
            
            # 3. Court Proceedings
            'court_proceedings': {
                'full_transcript': simulation_results.get('simulation_text', 'No simulation conducted') if simulation_results else 'No simulation conducted',
                'transcript_highlights': self.extract_transcript_highlights(simulation_results.get('simulation_text', '')) if simulation_results else [],
                'key_moments': [],
                'objections_raised': 0,  # Would need to parse from transcript
                'evidence_presented': len(case_data.get('evidence_files', []))
            }
        }
        
        # Add simulation-specific sections if simulation was conducted
        if simulation_results:
            performance_metrics = self.calculate_performance_metrics(case_data, simulation_results)
            learning_feedback = self.generate_learning_feedback(case_data, performance_metrics)
            
            report.update({
                # 4. Legal Reasoning Applied
                'legal_reasoning': {
                    'applicable_laws': self._extract_legal_references(simulation_results.get('simulation_text', '')),
                    'precedents_cited': [],  # Would need legal database integration
                    'legal_principles': self._identify_legal_principles(case_data),
                    'reasoning_analysis': 'Based on AI simulation analysis'
                },
                
                # 5. Simulation Outcome
                'simulation_outcome': {
                    'verdict': self._extract_verdict(simulation_results.get('simulation_text', '')),
                    'reasoning': self._extract_reasoning(simulation_results.get('simulation_text', '')),
                    'sentence_orders': 'As determined by AI simulation',
                    'simulation_accuracy': f"{performance_metrics['legal_accuracy']:.1f}/10",
                    'ai_confidence': f"{performance_metrics['ai_confidence']:.1f}/10"
                },
                
                # 6. Performance Metrics
                'performance_metrics': {
                    'overall_score': f"{performance_metrics['overall_score']:.1f}/10",
                    'case_complexity': f"{performance_metrics['case_complexity']:.1f}/10",
                    'evidence_utilization': f"{performance_metrics['evidence_utilization']:.1f}/10",
                    'legal_accuracy': f"{performance_metrics['legal_accuracy']:.1f}/10",
                    'procedural_compliance': f"{performance_metrics['procedural_compliance']:.1f}/10",
                    'argument_quality': f"{performance_metrics['argument_quality']:.1f}/10",
                    'processing_time': performance_metrics['processing_time'],
                    'simulation_length_words': performance_metrics['simulation_length'],
                    'ai_model_used': simulation_results.get('simulation_type', 'Unknown')
                },
                
                # 7. Learning & Feedback Section
                'learning_feedback': learning_feedback
            })
        else:
            # Add placeholder sections for cases without simulation
            report.update({
                'legal_reasoning': {'note': 'Simulation not conducted'},
                'simulation_outcome': {'note': 'Simulation not conducted'},
                'performance_metrics': {'note': 'Simulation not conducted'},
                'learning_feedback': {'note': 'Complete simulation to receive feedback'}
            })
        
        return report
    
    def _determine_simulation_mode(self, case_data: Dict) -> str:
        """Determine simulation mode based on case data"""
        case_type = case_data.get('case_type', '').lower()
        
        mode_mapping = {
            'criminal': 'Trial',
            'civil': 'Hearing',
            'corporate': 'Hearing',
            'family': 'Hearing',
            'constitutional': 'Constitutional Review'
        }
        
        return mode_mapping.get(case_type, 'General Proceeding')
    
    def _extract_legal_references(self, simulation_text: str) -> List[str]:
        """Extract legal references from simulation text"""
        # Simple extraction - in real implementation, use legal NLP
        legal_refs = []
        
        # Look for common legal reference patterns
        import re
        
        # Section references
        sections = re.findall(r'Section \d+', simulation_text)
        legal_refs.extend(sections)
        
        # Article references
        articles = re.findall(r'Article \d+', simulation_text)
        legal_refs.extend(articles)
        
        # Act references
        acts = re.findall(r'\w+ Act', simulation_text)
        legal_refs.extend(acts)
        
        return list(set(legal_refs))[:10]  # Return unique references, max 10
    
    def _identify_legal_principles(self, case_data: Dict) -> List[str]:
        """Identify applicable legal principles based on case type"""
        case_type = case_data.get('case_type', '').lower()
        
        principles_map = {
            'criminal': [
                'Presumption of innocence',
                'Burden of proof beyond reasonable doubt',
                'Right to fair trial'
            ],
            'civil': [
                'Preponderance of evidence',
                'Due process',
                'Right to legal representation'
            ],
            'corporate': [
                'Corporate responsibility',
                'Fiduciary duty',
                'Business judgment rule'
            ],
            'constitutional': [
                'Constitutional supremacy',
                'Fundamental rights',
                'Separation of powers'
            ]
        }
        
        return principles_map.get(case_type, ['General legal principles'])
    
    def _extract_verdict(self, simulation_text: str) -> str:
        """Extract verdict from simulation text"""
        text_lower = simulation_text.lower()
        
        if 'guilty' in text_lower:
            return 'Guilty'
        elif 'not guilty' in text_lower:
            return 'Not Guilty'
        elif 'liable' in text_lower:
            return 'Liable'
        elif 'not liable' in text_lower:
            return 'Not Liable'
        elif 'judgment' in text_lower and 'favor' in text_lower:
            return 'Judgment rendered'
        else:
            return 'Verdict not clearly determined'
    
    def _extract_reasoning(self, simulation_text: str) -> str:
        """Extract key reasoning from simulation"""
        # Look for judge's reasoning
        lines = simulation_text.split('\n')
        reasoning_lines = []
        
        in_reasoning = False
        for line in lines:
            line = line.strip()
            if 'judge:' in line.lower() and any(word in line.lower() for word in ['decision', 'judgment', 'ruling']):
                in_reasoning = True
                reasoning_lines.append(line)
            elif in_reasoning and line:
                reasoning_lines.append(line)
                if len(reasoning_lines) >= 3:  # Limit reasoning extract
                    break
        
        return ' '.join(reasoning_lines) if reasoning_lines else 'Reasoning analysis available in full transcript'
    
    def export_as_formatted_text(self, report: Dict) -> str:
        """Export report as formatted text matching your template"""
        
        lines = []
        
        # Header
        lines.extend([
            "=" * 80,
            "⚖️  JURIX COURTROOM SIMULATION REPORT  ⚖️",
            "=" * 80,
            "",
            f"**Case ID:** {report['header']['case_id']}",
            f"**Date of Simulation:** {report['header']['date_of_simulation']}",
            f"**Case Title:** {report['header']['case_title']}",
            f"**Simulation Mode:** {report['header']['simulation_mode']}",
            "",
            "=" * 80
        ])
        
        # 1. Case Details
        lines.extend([
            "1. CASE DETAILS",
            "-" * 40,
            f"• **Charges/Sections Applied:** {report['case_details']['charges_sections']}",
            f"• **Parties Involved:**",
            f"  - Prosecution: {report['case_details']['parties_involved']['prosecution']}",
            f"  - Defense: {report['case_details']['parties_involved']['defense']}",
            f"  - Judge: {report['case_details']['parties_involved']['judge']}",
            f"• **Summary of Case:** {report['case_details']['case_summary']}",
            ""
        ])
        
        # 2. Evidence Overview
        lines.extend([
            "2. EVIDENCE OVERVIEW",
            "-" * 40
        ])
        
        # Evidence Table
        evidence_table = report['evidence_overview']['evidence_table']
        if evidence_table:
            lines.append("| Evidence ID | Description | Type | Status |")
            lines.append("|-------------|-------------|------|--------|")
            for evidence in evidence_table:
                lines.append(f"| {evidence['evidence_id']} | {evidence['description'][:30]}... | {evidence['type']} | {evidence['status']} |")
        else:
            lines.append("No evidence files uploaded.")
        
        lines.append("")
        
        # 3. Court Proceedings
        lines.extend([
            "3. COURT PROCEEDINGS (TRANSCRIPT HIGHLIGHTS)",
            "-" * 40
        ])
        
        highlights = report['court_proceedings']['transcript_highlights']
        if highlights:
            for i, highlight in enumerate(highlights[:5], 1):
                lines.extend([
                    f"{i}. **{highlight['type']}** ({highlight['speaker']})",
                    f"   {highlight['content'][:100]}...",
                    ""
                ])
        else:
            lines.append("No transcript highlights available.")
        
        lines.append("")
        
        # Add other sections if available
        if 'legal_reasoning' in report and 'note' not in report['legal_reasoning']:
            lines.extend([
                "4. LEGAL REASONING APPLIED",
                "-" * 40,
                f"• **Applicable Laws:** {', '.join(report['legal_reasoning']['applicable_laws'])}",
                f"• **Legal Principles:** {', '.join(report['legal_reasoning']['legal_principles'])}",
                ""
            ])
        
        if 'simulation_outcome' in report and 'note' not in report['simulation_outcome']:
            lines.extend([
                "5. SIMULATION OUTCOME",
                "-" * 40,
                f"• **Verdict:** {report['simulation_outcome']['verdict']}",
                f"• **Reasoning:** {report['simulation_outcome']['reasoning']}",
                f"• **AI Confidence:** {report['simulation_outcome']['ai_confidence']}",
                ""
            ])
        
        if 'performance_metrics' in report and 'note' not in report['performance_metrics']:
            lines.extend([
                "6. PERFORMANCE METRICS",
                "-" * 40,
                f"• **Overall Score:** {report['performance_metrics']['overall_score']}",
                f"• **Case Complexity:** {report['performance_metrics']['case_complexity']}",
                f"• **Evidence Utilization:** {report['performance_metrics']['evidence_utilization']}",
                f"• **Legal Accuracy:** {report['performance_metrics']['legal_accuracy']}",
                f"• **Procedural Compliance:** {report['performance_metrics']['procedural_compliance']}",
                ""
            ])
        
        if 'learning_feedback' in report and 'note' not in report['learning_feedback']:
            lines.extend([
                "7. LEARNING & FEEDBACK SECTION",
                "-" * 40,
                "**Strengths:**"
            ])
            
            for strength in report['learning_feedback']['strengths']:
                lines.append(f"• {strength}")
            
            lines.extend([
                "",
                "**Areas for Improvement:**"
            ])
            
            for improvement in report['learning_feedback']['areas_for_improvement']:
                lines.append(f"• {improvement}")
            
            lines.extend([
                "",
                "**Recommendations:**"
            ])
            
            for rec in report['learning_feedback']['recommendations']:
                lines.append(f"• {rec}")
            
            lines.extend([
                "",
                "**Next Steps:**"
            ])
            
            for step in report['learning_feedback']['next_steps']:
                lines.append(f"• {step}")
        
        # Footer
        lines.extend([
            "",
            "=" * 80,
            f"Report generated by Jurix AI System",
            f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
            f"Report ID: {report['report_id']}",
            "=" * 80
        ])
        
        return "\n".join(lines)
    
    def export_as_html(self, report: Dict) -> str:
        """Export report as HTML with styling"""
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Jurix Court Report - {report['header']['case_id']}</title>
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }}
                .report-container {{
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    border-bottom: 3px solid #2c3e50;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    color: #2c3e50;
                    margin: 0;
                    font-size: 28px;
                }}
                .case-info {{
                    background: #ecf0f1;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .section {{
                    margin: 30px 0;
                }}
                .section h2 {{
                    color: #34495e;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }}
                .evidence-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }}
                .evidence-table th, .evidence-table td {{
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }}
                .evidence-table th {{
                    background-color: #3498db;
                    color: white;
                }}
                .evidence-table tr:nth-child(even) {{
                    background-color: #f2f2f2;
                }}
                .highlight {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 10px 0;
                }}
                .metric {{
                    display: inline-block;
                    background: #e8f4fd;
                    padding: 10px 15px;
                    margin: 5px;
                    border-radius: 5px;
                    border-left: 4px solid #3498db;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #7f8c8d;
                }}
                ul {{
                    list-style-type: none;
                    padding: 0;
                }}
                ul li {{
                    background: #f8f9fa;
                    margin: 5px 0;
                    padding: 8px;
                    border-left: 3px solid #28a745;
                }}
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <h1>⚖️ Jurix Courtroom Simulation Report</h1>
                </div>
                
                <div class="case-info">
                    <p><strong>Case ID:</strong> {report['header']['case_id']}</p>
                    <p><strong>Date of Simulation:</strong> {report['header']['date_of_simulation']}</p>
                    <p><strong>Case Title:</strong> {report['header']['case_title']}</p>
                    <p><strong>Simulation Mode:</strong> {report['header']['simulation_mode']}</p>
                </div>
        """
        
        # Add sections
        sections = [
            ('Case Details', 'case_details'),
            ('Evidence Overview', 'evidence_overview'),
            ('Court Proceedings', 'court_proceedings'),
            ('Legal Reasoning', 'legal_reasoning'),
            ('Simulation Outcome', 'simulation_outcome'),
            ('Performance Metrics', 'performance_metrics'),
            ('Learning & Feedback', 'learning_feedback')
        ]
        
        for section_title, section_key in sections:
            if section_key in report:
                html += f'<div class="section"><h2>{section_title}</h2>'
                
                if section_key == 'evidence_overview':
                    html += self._generate_html_evidence_table(report[section_key])
                elif section_key == 'court_proceedings':
                    html += self._generate_html_proceedings(report[section_key])
                elif section_key == 'performance_metrics':
                    html += self._generate_html_metrics(report[section_key])
                else:
                    html += f'<p>Section content available in full report.</p>'
                
                html += '</div>'
        
        html += f"""
                <div class="footer">
                    <p>Report generated by Jurix AI System</p>
                    <p>Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                    <p>Report ID: {report['report_id']}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _generate_html_evidence_table(self, evidence_data):
        """Generate HTML evidence table"""
        if not evidence_data['evidence_table']:
            return '<p>No evidence files uploaded.</p>'
        
        html = '<table class="evidence-table">'
        html += '<tr><th>Evidence ID</th><th>Description</th><th>Type</th><th>Status</th><th>Relevance</th></tr>'
        
        for evidence in evidence_data['evidence_table']:
            html += f"""
            <tr>
                <td>{evidence['evidence_id']}</td>
                <td>{evidence['description']}</td>
                <td>{evidence['type']}</td>
                <td>{evidence['status']}</td>
                <td>{evidence['relevance_score']:.1f}/10</td>
            </tr>
            """
        
        html += '</table>'
        return html
    
    def _generate_html_proceedings(self, proceedings_data):
        """Generate HTML court proceedings section"""
        html = '<h3>Transcript Highlights:</h3>'
        
        for highlight in proceedings_data['transcript_highlights'][:5]:
            html += f"""
            <div class="highlight">
                <strong>{highlight['type']} ({highlight['speaker']}):</strong><br>
                {highlight['content'][:200]}...
            </div>
            """
        
        return html
    
    def _generate_html_metrics(self, metrics_data):
        """Generate HTML performance metrics"""
        html = '<div class="metrics-container">'
        
        metrics = [
            ('Overall Score', metrics_data.get('overall_score', 'N/A')),
            ('Case Complexity', metrics_data.get('case_complexity', 'N/A')),
            ('Evidence Utilization', metrics_data.get('evidence_utilization', 'N/A')),
            ('Legal Accuracy', metrics_data.get('legal_accuracy', 'N/A')),
            ('Procedural Compliance', metrics_data.get('procedural_compliance', 'N/A'))
        ]
        
        for metric_name, metric_value in metrics:
            html += f'<div class="metric"><strong>{metric_name}:</strong> {metric_value}</div>'
        
        html += '</div>'
        return html

# Usage example and testing functions
def create_sample_report():
    """Create a sample report for testing"""
    generator = EnhancedReportGenerator()
    
    # Sample case data
    sample_case = {
        'case_id': 'TEST-001',
        'title': 'State vs. Sample Defendant',
        'description': 'A sample criminal case for testing the report generation system.',
        'case_type': 'criminal',
        'status': 'completed',
        'parties': {
            'plaintiff': 'State Prosecutor',
            'defendant': 'Defense Attorney',
            'judge': 'AI Judge'
        },
        'evidence_files': [
            {
                'title': 'Witness Statement',
                'type': 'document',
                'file_name': 'witness_statement.pdf'
            },
            {
                'title': 'CCTV Footage',
                'type': 'video',
                'file_name': 'cctv_footage.mp4'
            }
        ]
    }
    
    # Sample simulation results
    sample_simulation = {
        'simulation_id': 'SIM-001',
        'simulation_text': '''
        JUDGE: Court is now in session for State vs. Sample Defendant.
        PROSECUTOR: Your honor, we will prove the defendant's guilt beyond reasonable doubt.
        DEFENSE: Your honor, the evidence is circumstantial at best.
        JUDGE: Both sides may present their evidence.
        PROSECUTOR: I present the witness statement as evidence.
        DEFENSE: Objection, hearsay.
        JUDGE: Sustained. Evidence is admissible.
        JUDGE: After reviewing all evidence, I find the defendant guilty as charged.
        ''',
        'simulation_type': 'local_agents',
        'generated_at': datetime.utcnow(),
        'processing_time': '2.3 seconds'
    }
    
    # Generate report
    report = generator.generate_comprehensive_report(sample_case, sample_simulation)
    
    return report

# Test function
def test_report_generator():
    """Test the enhanced report generator"""
    print("🧪 Testing Enhanced Report Generator...")
    
    # Create sample report
    report = create_sample_report()
    
    # Test text export
    text_report = EnhancedReportGenerator().export_as_formatted_text(report)
    print("✅ Text report generated successfully")
    print(f"📄 Report length: {len(text_report)} characters")
    
    # Test HTML export
    html_report = EnhancedReportGenerator().export_as_html(report)
    print("✅ HTML report generated successfully")
    print(f"📄 HTML length: {len(html_report)} characters")
    
    return report, text_report, html_report

if __name__ == "__main__":
    # Run tests
    test_report_generator()