from .base_agent import BaseAgent
from ..prompts.prosecutor_prompts import OPENING_STATEMENT_PROMPT, EVIDENCE_PRESENTATION_PROMPT, CLOSING_ARGUMENT_PROMPT
from typing import Dict, List, Any
import random

class ProsecutorAgent(BaseAgent):
    """Enhanced Prosecutor Agent with sophisticated legal reasoning and strategy"""
    
    def __init__(self):
        super().__init__(
            role="prosecutor", 
            personality="assertive but fair", 
            expertise_level="experienced"
        )
        self.prosecution_strategy = {}
        self.evidence_strength_map = {}
        
    def _develop_strategy_notes(self, case_data: Dict[str, Any], case_type: str) -> List[str]:
        """Develop prosecution-specific strategy"""
        strategy = []
        
        if case_type == 'criminal':
            strategy.extend([
                "Establish elements of the crime beyond reasonable doubt",
                "Present evidence in logical sequence",
                "Anticipate defense arguments and prepare rebuttals",
                "Emphasize victim impact and public safety"
            ])
        elif case_type == 'civil':
            strategy.extend([
                "Prove liability by preponderance of evidence",
                "Establish damages and causation",
                "Present compelling narrative of events"
            ])
        
        self.prosecution_strategy = {
            'main_theory': self._develop_case_theory(case_data),
            'evidence_order': self._plan_evidence_presentation(),
            'key_arguments': strategy
        }
        
        return strategy
    
    def _develop_case_theory(self, case_data: Dict[str, Any]) -> str:
        """Develop main prosecution theory"""
        case_type = case_data.get('case_type', '').lower()
        description = case_data.get('description', '').lower()
        
        if case_type == 'criminal':
            if 'theft' in description or 'steal' in description:
                return "Defendant intentionally and unlawfully took property belonging to another"
            elif 'assault' in description or 'violence' in description:
                return "Defendant intentionally caused harm or threatened imminent harm to the victim"
            elif 'fraud' in description:
                return "Defendant knowingly made false representations to deceive the victim"
        
        return "Defendant is liable for the alleged wrongdoing based on the evidence"
    
    def _plan_evidence_presentation(self) -> List[str]:
        """Plan optimal order for evidence presentation"""
        return [
            "Foundation evidence (scene, timeline)",
            "Direct evidence (eyewitness, physical)",
            "Circumstantial evidence (supporting facts)",
            "Expert testimony (if applicable)",
            "Character evidence (if admissible)"
        ]
    
    def make_opening_statement(self, case_data: Dict[str, Any], evidence: List[Dict[str, Any]]) -> str:
        """Make compelling prosecution opening statement"""
        self.analyze_case(case_data)
        self.think("Crafting opening statement to establish prosecution theory", "strategy")
        
        prompt = f"""
        Case: {case_data.get('title', 'Unknown Case')}
        Type: {case_data.get('case_type', 'unknown')}
        Defendant: {case_data.get('parties', {}).get('defendant', 'the defendant')}
        Plaintiff: {case_data.get('parties', {}).get('plaintiff', 'the people')}

        Case Theory: {self.prosecution_strategy.get('main_theory', 'Defendant is responsible for the alleged wrongdoing')}

        Evidence Available: {len(evidence)} pieces including:
        {self._summarize_evidence(evidence)}
        """ + OPENING_STATEMENT_PROMPT
        
        return self.respond(prompt, "prosecution opening statement")
    
    def _summarize_evidence(self, evidence: List[Dict[str, Any]]) -> str:
        """Create summary of available evidence"""
        if not evidence:
            return "- Case facts and circumstances"
        
        summary = []
        for i, item in enumerate(evidence[:5], 1):  # Limit to first 5 items
            title = item.get('title', f'Evidence {i}')
            evidence_type = item.get('type', item.get('evidence_type', 'evidence'))
            summary.append(f"- {title} ({evidence_type})")
        
        if len(evidence) > 5:
            summary.append(f"- And {len(evidence) - 5} additional pieces of evidence")
        
        return '\n'.join(summary)
    
    def present_evidence(self, evidence_item: Dict[str, Any]) -> str:
        """Present evidence with legal foundation and persuasive impact"""
        evidence_title = evidence_item.get('title', 'Evidence')
        evidence_type = evidence_item.get('type', evidence_item.get('evidence_type', 'document'))
        
        self.think(f"Presenting {evidence_type} evidence: {evidence_title}", "evidence")
        
        # Analyze evidence strength
        strength = self._assess_evidence_strength(evidence_item)
        self.evidence_strength_map[evidence_title] = strength
        
        prompt = f"""
        Present this evidence to the court as a prosecutor:
        
        Evidence: {evidence_title}
        Type: {evidence_type}
        Description: {evidence_item.get('description', 'Key evidence in this case')}
        Content Summary: {evidence_item.get('summary', evidence_item.get('content', 'Evidence content')[:200])}
        
        Evidence Strength Assessment: {strength}
        
        Your presentation should:
        1. Establish proper foundation for admissibility
        2. Explain the evidence clearly to the jury
        3. Connect it to your case theory
        4. Highlight its significance and reliability
        5. Address potential weaknesses proactively
        
        Use phrases like "This evidence shows..." or "The facts demonstrate..."
        Be confident but not overstated.
        """
        
        return self.respond(prompt, "evidence presentation")
    
    def _assess_evidence_strength(self, evidence_item: Dict[str, Any]) -> str:
        """Assess the strength of evidence for strategic purposes"""
        evidence_type = evidence_item.get('type', evidence_item.get('evidence_type', 'unknown')).lower()
        
        strength_map = {
            'video': 'strong',
            'forensic': 'strong',
            'dna': 'very strong',
            'fingerprint': 'strong',
            'document': 'moderate',
            'testimony': 'moderate',
            'witness': 'moderate',
            'circumstantial': 'weak to moderate'
        }
        
        return strength_map.get(evidence_type, 'moderate')
    
    def cross_examine_defense_witness(self, witness_testimony: str) -> str:
        """Cross-examine defense witness to undermine credibility"""
        self.think("Preparing cross-examination to challenge defense witness", "cross_examination")
        
        prompt = f"""
        Cross-examine this defense witness testimony as a prosecutor:
        
        Witness Testimony: {witness_testimony}
        
        Your cross-examination should:
        1. Challenge inconsistencies or contradictions
        2. Question the witness's ability to observe/remember
        3. Explore potential bias or motive to lie
        4. Limit harmful testimony through focused questions
        5. Reinforce prosecution theory where possible
        
        Use leading questions and maintain control.
        Be respectful but firm in challenging the testimony.
        """
        
        return self.respond(prompt, "cross-examination of defense witness")
    
    def make_closing_argument(self, case_summary: str) -> str:
        """Deliver powerful closing argument for conviction"""
        self.think("Preparing closing argument to secure conviction", "closing")
        
        # Analyze evidence presented
        strong_evidence = [k for k, v in self.evidence_strength_map.items() if v in ['strong', 'very strong']]
        
        prompt = f"""
        Deliver a compelling closing argument as a prosecutor:
        
        Case Summary: {case_summary}
        
        Prosecution Theory: {self.prosecution_strategy.get('main_theory', 'Defendant is guilty as charged')}
        
        Strong Evidence Presented: {', '.join(strong_evidence) if strong_evidence else 'Multiple pieces of evidence'}
        
        Key Legal Standard: {self.case_memory.get('applicable_law', ['burden of proof'])}
        
        Your closing should:
        1. Remind jury of your opening promises and how you delivered
        2. Walk through evidence systematically
        3. Address defense arguments and create rebuttals
        4. Emphasize meeting burden of proof
        5. Appeal to justice and community safety
        6. End with clear call for guilty verdict
        
        Be passionate but professional. Use "The evidence shows..." frequently.
        Connect all evidence to your theory of the case.
        """
        
        return self.respond(prompt, "prosecution closing argument")
    
    def respond_to_objection(self, objection_type: str, context: str) -> str:
        """Respond to defense objections professionally"""
        self.think(f"Responding to {objection_type} objection", "objection_response")
        
        responses = {
            'relevance': "Your Honor, this evidence is directly relevant to proving the defendant's guilt and goes to the heart of our case.",
            'hearsay': "Your Honor, this testimony falls under the present sense impression exception to the hearsay rule.",
            'foundation': "Your Honor, we have established proper foundation through the witness's personal knowledge and experience.",
            'leading': "Your Honor, I will rephrase the question to be non-leading.",
            'speculation': "Your Honor, the witness is testifying based on their direct observations, not speculation."
        }
        
        return responses.get(objection_type.lower(), 
                           f"Your Honor, I believe this {context} is proper and admissible under the rules of evidence.")
    
    def _get_opening_response(self) -> str:
        """Enhanced opening fallback response"""
        openings = [
            "Ladies and gentlemen of the jury, the evidence in this case will prove beyond a reasonable doubt that the defendant is guilty of the charges brought against them.",
            "Members of the jury, today we will present compelling evidence that demonstrates the defendant's culpability in this matter.",
            "Your Honor and members of the jury, the facts of this case paint a clear picture of the defendant's guilt, which we will prove through credible evidence."
        ]
        return random.choice(openings)
    
    def _get_evidence_response(self) -> str:
        """Enhanced evidence presentation fallback"""
        responses = [
            "This evidence clearly demonstrates the defendant's involvement in the alleged crime and supports the prosecution's case.",
            "The facts presented in this evidence speak for themselves and establish a clear pattern of the defendant's culpable conduct.",
            "This piece of evidence is crucial to understanding the defendant's actions and intent in this matter."
        ]
        return random.choice(responses)
    
    def make_rebuttal_argument(self, case_summary: str) -> str:
        """Deliver rebuttal argument addressing defense points"""
        self.think("Preparing rebuttal argument to counter defense claims", "rebuttal")

        prompt = f"""
        Deliver a rebuttal argument as a prosecutor addressing the defense's closing argument:

        Case Summary: {case_summary}

        Prosecution Theory: {self.prosecution_strategy.get('main_theory', 'Defendant is guilty as charged')}

        Your rebuttal should:
        1. Address specific defense arguments and weaknesses
        2. Re-emphasize strong evidence that counters defense claims
        3. Reinforce the prosecution's case theory
        4. Remind the jury of the burden of proof
        5. End with a final call for conviction

        Be confident and address any reasonable doubt. Use phrases like "The defense wants you to believe..." but "the evidence shows..."
        Keep it focused and impactful.
        """

        return self.respond(prompt, "prosecution rebuttal argument")

    def _get_closing_response(self) -> str:
        """Enhanced closing argument fallback"""
        closings = [
            "Based on the overwhelming evidence presented, the prosecution has proven its case beyond a reasonable doubt. I urge you to find the defendant guilty.",
            "The evidence in this case is clear and convincing. Justice demands that you hold the defendant accountable for their actions.",
            "We have met our burden of proof. The defendant's guilt has been established beyond any reasonable doubt."
        ]
        return random.choice(closings)
