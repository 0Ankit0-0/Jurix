from .base_agent import BaseAgent
from ..prompts.judge_prompts import OPENING_PROMPT, EVIDENCE_EVALUATION_PROMPT, FINAL_JUDGMENT_PROMPT
from typing import Dict, List, Any
import random

class JudgeAgent(BaseAgent):
    """Enhanced Judge Agent with sophisticated judicial reasoning and fairness"""
    
    def __init__(self):
        super().__init__(
            role="judge", 
            personality="fair and impartial", 
            expertise_level="highly experienced"
        )
        self.judicial_decisions = []
        self.evidence_rulings = {}
        self.case_management_notes = []
        self.legal_precedents = self._initialize_precedents()
        
    def _initialize_precedents(self) -> Dict[str, List[str]]:
        """Initialize common legal precedents for reference"""
        return {
            'evidence': [
                "Federal Rules of Evidence apply",
                "Evidence must be relevant and not unduly prejudicial",
                "Hearsay is generally inadmissible unless exception applies",
                "Chain of custody must be established for physical evidence"
            ],
            'criminal': [
                "Defendant is presumed innocent until proven guilty",
                "Prosecution must prove guilt beyond reasonable doubt",
                "Defendant has right to confront witnesses",
                "Miranda rights must be observed"
            ],
            'civil': [
                "Plaintiff must prove case by preponderance of evidence",
                "Damages must be reasonably certain and proven",
                "Comparative negligence may apply"
            ],
            'constitutional': [
                "Constitutional rights are fundamental",
                "Due process must be observed",
                "Equal protection under law applies"
            ]
        }
    
    def _develop_strategy_notes(self, case_data: Dict[str, Any], case_type: str) -> List[str]:
        """Develop judicial case management strategy"""
        strategy = [
            "Ensure fair proceedings for all parties",
            "Apply law impartially and consistently",
            "Manage courtroom with dignity and respect",
            "Protect constitutional rights of all parties",
            "Make evidence rulings based on legal standards"
        ]
        
        self.case_management_notes = [
            f"Case type: {case_type} - applying appropriate legal standards",
            f"Parties: {case_data.get('parties', {}).get('plaintiff', 'Plaintiff')} v. {case_data.get('parties', {}).get('defendant', 'Defendant')}",
            "Ensuring due process and fair trial rights"
        ]
        
        return strategy
    
    def open_court(self, case_data: Dict[str, Any]) -> str:
        """Formally open court session with appropriate ceremony"""
        self.analyze_case(case_data)
        self.think("Opening court session with proper judicial authority", "court_management")
        
        case_title = case_data.get('title', 'Unknown Case')
        plaintiff = case_data.get('parties', {}).get('plaintiff', 'Plaintiff')
        defendant = case_data.get('parties', {}).get('defendant', 'Defendant')
        victim = case_data.get('parties', {}).get('victim', 'Not specified')
        witnesses = case_data.get('parties', {}).get('witnesses', [])
        case_type = case_data.get('case_type', 'legal matter')
        
        prompt = f"""
        Case: {case_title}
        Type: {case_type}
        Parties: {plaintiff} v. {defendant}
        Victim: {victim}
        Witnesses: {', '.join(witnesses) if witnesses else 'None'}
        """ + OPENING_PROMPT
        
        return self.respond(prompt, "opening court session")
    
    def rule_on_evidence(self, evidence_description: str, objection: str = None) -> str:
        """Make judicial ruling on evidence admissibility"""
        self.think(f"Ruling on evidence admissibility: {objection or 'No objection'}", "evidence_ruling")
        
        # Analyze the objection and evidence
        ruling_factors = self._analyze_evidence_admissibility(evidence_description, objection)
        
        prompt = f"""
        Rule on this evidence as a judge:
        
        Evidence: {evidence_description}
        Objection: {objection or 'No objection raised'}
        
        Legal Considerations:
        - Relevance to the case
        - Potential prejudicial effect
        - Reliability and authenticity
        - Compliance with rules of evidence
        
        Your ruling should:
        1. State your decision clearly (Sustained/Overruled/Admitted/Excluded)
        2. Provide brief legal reasoning
        3. Cite relevant rule or precedent if applicable
        4. Give any limiting instructions if needed
        5. Maintain judicial authority and fairness
        
        Be decisive and explain your legal reasoning briefly.
        """
        
        ruling = self.respond(prompt, "evidence ruling")
        
        # Record the ruling
        self.evidence_rulings[evidence_description[:50]] = {
            'ruling': ruling,
            'objection': objection,
            'reasoning': ruling_factors
        }
        
        return ruling
    
    def _analyze_evidence_admissibility(self, evidence: str, objection: str) -> Dict[str, Any]:
        """Analyze factors for evidence admissibility"""
        factors = {
            'relevance': 'presumed relevant unless shown otherwise',
            'prejudicial_effect': 'minimal unless inflammatory',
            'reliability': 'presumed reliable unless challenged',
            'legal_basis': 'follows standard evidence rules'
        }
        
        if objection:
            objection_lower = objection.lower()
            if 'hearsay' in objection_lower:
                factors['hearsay_analysis'] = 'must determine if exception applies'
            elif 'relevance' in objection_lower:
                factors['relevance'] = 'must establish connection to case'
            elif 'prejudicial' in objection_lower:
                factors['prejudicial_effect'] = 'must weigh probative value vs prejudice'
        
        return factors
    
    def manage_objection(self, objection_type: str, context: str) -> str:
        """Rule on attorney objections during trial"""
        self.think(f"Ruling on {objection_type} objection", "objection_ruling")
        
        rulings = {
            'hearsay': self._rule_on_hearsay_objection(context),
            'relevance': self._rule_on_relevance_objection(context),
            'leading': self._rule_on_leading_objection(context),
            'foundation': self._rule_on_foundation_objection(context),
            'speculation': self._rule_on_speculation_objection(context),
            'argumentative': self._rule_on_argumentative_objection(context)
        }
        
        ruling = rulings.get(objection_type.lower(), self._make_general_ruling(objection_type, context))
        
        # Record judicial decision
        self.judicial_decisions.append({
            'type': 'objection_ruling',
            'objection': objection_type,
            'ruling': ruling,
            'context': context
        })
        
        return ruling
    
    def _rule_on_hearsay_objection(self, context: str) -> str:
        """Rule on hearsay objection"""
        responses = [
            "Sustained. The statement is hearsay and no exception has been established.",
            "Overruled. This falls under the present sense impression exception to hearsay.",
            "Sustained. Counsel, please establish foundation or find another way to present this evidence."
        ]
        return random.choice(responses)
    
    def _rule_on_relevance_objection(self, context: str) -> str:
        """Rule on relevance objection"""
        responses = [
            "Sustained. I fail to see the relevance of this line of questioning.",
            "Overruled. The evidence appears relevant to the issues in this case.",
            "Counsel, please establish the relevance of this evidence before proceeding."
        ]
        return random.choice(responses)
    
    def _rule_on_leading_objection(self, context: str) -> str:
        """Rule on leading question objection"""
        responses = [
            "Sustained. Please rephrase your question in a non-leading manner.",
            "Overruled. Leading questions are permitted on cross-examination.",
            "Sustained. Let the witness answer in their own words."
        ]
        return random.choice(responses)
    
    def _rule_on_foundation_objection(self, context: str) -> str:
        """Rule on foundation objection"""
        responses = [
            "Sustained. Please establish proper foundation before presenting this evidence.",
            "Overruled. Sufficient foundation has been laid.",
            "Counsel, please establish how this witness has knowledge of these facts."
        ]
        return random.choice(responses)
    
    def _rule_on_speculation_objection(self, context: str) -> str:
        """Rule on speculation objection"""
        responses = [
            "Sustained. The witness should testify only to facts within their personal knowledge.",
            "Overruled. The witness may give their opinion based on their observations.",
            "Sustained. Please limit your testimony to what you actually observed."
        ]
        return random.choice(responses)
    
    def _rule_on_argumentative_objection(self, context: str) -> str:
        """Rule on argumentative objection"""
        responses = [
            "Sustained. Counsel, please ask questions rather than argue with the witness.",
            "Overruled. The question is proper cross-examination.",
            "Sustained. Save your arguments for closing, counsel."
        ]
        return random.choice(responses)
    
    def _make_general_ruling(self, objection_type: str, context: str) -> str:
        """Make general ruling on objection"""
        return f"I'll allow it, but counsel, please be mindful of the {objection_type} concern raised."
    
    def make_final_judgment(self, case_summary: str, evidence_summary: str) -> str:
        """Render final judgment with detailed legal reasoning"""
        self.think("Deliberating on final judgment based on all evidence and law", "final_judgment")
        
        case_type = self.case_memory.get('case_type', 'unknown')
        legal_standard = self._get_legal_standard(case_type)
        
        prompt = f"""
        Render final judgment as a judge in this case:
        
        Case Title: {self.case_memory.get('title', 'N/A')}
        Case Type: {case_type}
        Case Description: {self.case_memory.get('description', 'N/A')}
        Plaintiff: {self.case_memory.get('parties', {}).get('plaintiff', 'N/A')}
        Defendant: {self.case_memory.get('parties', {}).get('defendant', 'N/A')}
        
        Legal Standard: {legal_standard}
        Applicable Law: {', '.join(self.case_memory.get('applicable_law', ['general legal principles']))}
        
        Evidence Summary: 
        {evidence_summary}
        
        Evidence Rulings Made: {len(self.evidence_rulings)} rulings on admissibility
        
        Your judgment should:
        1. Summarize the key facts established by the evidence.
        2. Apply the appropriate legal standard ({legal_standard}) to the facts.
        3. Analyze how the evidence presented meets or fails to meet the burden of proof.
        4. Address the key legal arguments from both the prosecution and defense.
        5. Explain your legal reasoning clearly and logically.
        6. Render a specific verdict or judgment (e.g., "guilty," "not guilty," "liable," "not liable").
        7. If applicable, include any appropriate sentencing, remedies, or orders.
        8. Maintain judicial dignity and impartiality throughout.
        
        Be thorough in your legal analysis and fair to all parties. Your decision must be based solely on the law and the evidence presented in this simulation.
        """
        
        judgment = self.respond(prompt, "final judgment")
        
        # Record final decision
        self.judicial_decisions.append({
            'type': 'final_judgment',
            'judgment': judgment,
            'legal_standard': legal_standard,
            'evidence_considered': len(self.evidence_rulings)
        })
        
        return judgment
    
    def _get_legal_standard(self, case_type: str) -> str:
        """Get appropriate legal standard for case type"""
        standards = {
            'criminal': 'beyond a reasonable doubt',
            'civil': 'preponderance of the evidence',
            'constitutional': 'strict scrutiny',
            'administrative': 'substantial evidence'
        }
        return standards.get(case_type.lower(), 'applicable legal standard')
    
    def provide_jury_instructions(self, case_type: str) -> str:
        """Provide appropriate jury instructions"""
        self.think("Providing jury instructions on law and procedure", "jury_instructions")
        
        prompt = f"""
        Provide jury instructions as a judge for a {case_type} case:
        
        Case Type: {case_type}
        Legal Standard: {self._get_legal_standard(case_type)}
        
        Your instructions should cover:
        1. Jury's role and responsibilities
        2. Burden of proof and legal standard
        3. How to evaluate evidence and witness credibility
        4. Presumption of innocence (if criminal)
        5. Definition of key legal terms
        6. Deliberation process
        7. Verdict requirements
        
        Be clear, educational, and impartial in explaining the law.
        """
        
        return self.respond(prompt, "jury instructions")
    
    def maintain_courtroom_order(self, disruption_type: str) -> str:
        """Maintain order and decorum in courtroom"""
        self.think(f"Addressing courtroom disruption: {disruption_type}", "courtroom_management")
        
        responses = {
            'outburst': "Order in the court! The gallery will remain silent during proceedings or be removed.",
            'attorney_misconduct': "Counsel, your behavior is inappropriate. Please conduct yourself professionally or face sanctions.",
            'witness_evasion': "The witness will answer the question directly or be held in contempt.",
            'disruption': "This court will maintain proper decorum. Any further disruptions will result in removal from the courtroom."
        }
        
        return responses.get(disruption_type.lower(), 
                           "Order in the court! All parties will conduct themselves with appropriate respect for these proceedings.")
    
    def _get_opening_response(self) -> str:
        """Enhanced court opening fallback"""
        openings = [
            "Court is now in session. We will proceed with this matter in an orderly fashion, ensuring all parties receive due process under the law.",
            "This court is called to order. We are here today to ensure justice is served fairly and impartially according to the law.",
            "Good morning. Court is in session. We will conduct these proceedings with the dignity and respect that our legal system demands."
        ]
        return random.choice(openings)
    
    def _get_evidence_response(self) -> str:
        """Enhanced evidence ruling fallback"""
        responses = [
            "The court will consider this evidence carefully in accordance with the rules of evidence and applicable law.",
            "This evidence is admitted. The jury may consider its weight and credibility in their deliberations.",
            "The court finds this evidence relevant and admissible under the applicable rules."
        ]
        return random.choice(responses)
    
    def _get_closing_response(self) -> str:
        """Enhanced final judgment fallback"""
        closings = [
            "After careful consideration of all evidence and applicable law, this court renders its decision based on the legal standards that govern this case.",
            "Having weighed all evidence presented and applied the appropriate legal standards, the court finds as follows.",
            "Based on the evidence presented and the applicable law, this court makes the following findings and renders judgment accordingly."
        ]
        return random.choice(closings)
    
    def get_judicial_record(self) -> Dict[str, Any]:
        """Get complete record of judicial decisions"""
        return {
            'decisions': self.judicial_decisions,
            'evidence_rulings': self.evidence_rulings,
            'case_management': self.case_management_notes,
            'total_rulings': len(self.judicial_decisions)
        }