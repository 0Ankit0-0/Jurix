from .base_agent import BaseAgent
from ..prompts.defense_prompts import OPENING_STATEMENT_PROMPT, CROSS_EXAMINATION_PROMPT, CLOSING_ARGUMENT_PROMPT
from typing import Dict, List, Any
import random

class DefenseAgent(BaseAgent):
    """Enhanced Defense Attorney Agent with sophisticated defense strategies"""
    
    def __init__(self):
        super().__init__(
            role="defense attorney", 
            personality="protective and thorough", 
            expertise_level="experienced"
        )
        self.defense_strategy = {}
        self.reasonable_doubt_points = []
        self.client_protection_priority = True
        
    def _develop_strategy_notes(self, case_data: Dict[str, Any], case_type: str) -> List[str]:
        """Develop defense-specific strategy"""
        strategy = []
        
        if case_type == 'criminal':
            strategy.extend([
                "Challenge prosecution's burden of proof",
                "Create reasonable doubt at every opportunity",
                "Protect client's constitutional rights",
                "Present alternative theories of the case",
                "Humanize the defendant"
            ])
        elif case_type == 'civil':
            strategy.extend([
                "Challenge causation and damages",
                "Present comparative fault arguments",
                "Dispute liability through alternative explanations"
            ])
        
        self.defense_strategy = {
            'main_theory': self._develop_defense_theory(case_data),
            'doubt_creation_plan': self._plan_reasonable_doubt_strategy(),
            'key_arguments': strategy
        }
        
        return strategy
    
    def _develop_defense_theory(self, case_data: Dict[str, Any]) -> str:
        """Develop main defense theory"""
        case_type = case_data.get('case_type', '').lower()
        description = case_data.get('description', '').lower()
        
        if case_type == 'criminal':
            if 'theft' in description:
                return "My client had no intent to steal and believed they had permission to take the item"
            elif 'assault' in description:
                return "My client acted in self-defense when faced with imminent threat"
            elif 'fraud' in description:
                return "My client made no intentional misrepresentations and acted in good faith"
        
        return "The evidence does not support the allegations against my client"
    
    def _plan_reasonable_doubt_strategy(self) -> List[str]:
        """Plan strategy to create reasonable doubt"""
        return [
            "Challenge evidence reliability and chain of custody",
            "Question witness credibility and memory",
            "Present alternative explanations for events",
            "Highlight gaps in prosecution's case",
            "Emphasize presumption of innocence"
        ]
    
    def make_opening_statement(self, case_data: Dict[str, Any], evidence: List[Dict[str, Any]]) -> str:
        """Make compelling defense opening statement"""
        self.analyze_case(case_data)
        self.think("Crafting opening to establish reasonable doubt and protect client", "strategy")
        
        client_name = case_data.get('parties', {}).get('defendant', 'my client')
        
        prompt = f"""
        Case: {case_data.get('title', 'Unknown Case')}
        Type: {case_data.get('case_type', 'unknown')}
        Client: {client_name}
        Charges/Claims: Based on {case_data.get('description', 'the allegations')}
        
        Defense Theory: {self.defense_strategy.get('main_theory', 'The evidence does not support guilt')}
        
        Prosecution Evidence to Challenge: {len(evidence)} pieces
        """ + OPENING_STATEMENT_PROMPT
        
        return self.respond(prompt, "defense opening statement")
    
    def cross_examine(self, prosecution_evidence: str) -> str:
        """Cross-examine prosecution evidence to create doubt"""
        self.think("Cross-examining prosecution evidence to create reasonable doubt", "cross_examination")
        
        # Add this to reasonable doubt points
        doubt_point = f"Questioned reliability of: {prosecution_evidence[:50]}..."
        self.reasonable_doubt_points.append(doubt_point)
        
        prompt = f"""
        Prosecution Evidence: {prosecution_evidence}
        """ + CROSS_EXAMINATION_PROMPT
        
        return self.respond(prompt, "cross-examination of prosecution evidence")
    
    def present_defense_evidence(self, evidence_item: Dict[str, Any]) -> str:
        """Present evidence that supports defense theory"""
        evidence_title = evidence_item.get('title', 'Defense Evidence')
        
        self.think(f"Presenting defense evidence: {evidence_title}", "defense_evidence")
        
        prompt = f"""
        Present this defense evidence to support your client's case:
        
        Evidence: {evidence_title}
        Type: {evidence_item.get('type', 'evidence')}
        Description: {evidence_item.get('description', 'Evidence supporting defense')}
        
        Defense Theory: {self.defense_strategy.get('main_theory')}
        
        Your presentation should:
        1. Establish foundation for admissibility
        2. Clearly explain how it supports your defense
        3. Connect it to reasonable doubt creation
        4. Highlight its credibility and reliability
        5. Show how it contradicts prosecution theory
        
        Be confident and emphasize how this evidence proves your client's innocence.
        """
        
        return self.respond(prompt, "defense evidence presentation")
    
    def challenge_witness_credibility(self, witness_info: str) -> str:
        """Challenge prosecution witness credibility"""
        self.think("Challenging witness credibility to protect client", "witness_challenge")
        
        prompt = f"""
        Challenge this prosecution witness's credibility as a defense attorney:
        
        Witness Information: {witness_info}
        
        Your challenge should explore:
        1. Potential bias or motive to lie
        2. Ability to observe and remember accurately
        3. Inconsistencies in their testimony
        4. Prior inconsistent statements
        5. Character for truthfulness
        6. External factors affecting perception
        
        Be thorough but respectful in questioning their reliability.
        Focus on creating reasonable doubt about their testimony.
        """
        
        return self.respond(prompt, "witness credibility challenge")
    
    def make_closing_argument(self, case_summary: str) -> str:
        """Deliver passionate closing argument for acquittal"""
        self.think("Preparing closing argument to secure client's freedom", "closing")
        
        doubt_summary = "; ".join(self.reasonable_doubt_points[-3:]) if self.reasonable_doubt_points else "Multiple points of reasonable doubt raised"
        
        prompt = f"""
        Deliver a passionate closing argument as a defense attorney:
        
        Case Summary: {case_summary}
        
        Defense Theory: {self.defense_strategy.get('main_theory', 'Client is innocent')}
        
        Reasonable Doubt Created: {doubt_summary}
        
        Legal Standard: {self.case_memory.get('applicable_law', ['reasonable doubt', 'presumption of innocence'])}
        
        Your closing should:
        1. Remind jury of presumption of innocence
        2. Emphasize prosecution's burden of proof
        3. Systematically create reasonable doubt
        4. Challenge prosecution's evidence and witnesses
        5. Present your defense theory compellingly
        6. Humanize your client and their situation
        7. End with passionate plea for not guilty verdict
        
        Be emotional but professional. Use "reasonable doubt" frequently.
        Protect your client's freedom and rights.
        """
        
        return self.respond(prompt, "defense closing argument")
    
    def object_to_evidence(self, objection_type: str, reasoning: str) -> str:
        """Make objections to protect client"""
        self.think(f"Objecting on {objection_type} grounds to protect client", "objection")
        
        objections = {
            'relevance': f"Objection, Your Honor. {reasoning} This evidence is not relevant to the charges against my client.",
            'hearsay': f"Objection, hearsay. {reasoning} This statement is being offered for the truth of the matter asserted.",
            'foundation': f"Objection, lack of foundation. {reasoning} The prosecution has not established proper foundation for this evidence.",
            'prejudicial': f"Objection, Your Honor. The prejudicial effect of this evidence substantially outweighs its probative value.",
            'leading': f"Objection, leading the witness. {reasoning} Counsel is putting words in the witness's mouth."
        }
        
        return objections.get(objection_type.lower(), 
                           f"Objection, Your Honor. {reasoning} This is improper and prejudicial to my client.")
    
    def respond_to_prosecution_argument(self, prosecution_argument: str) -> str:
        """Respond to prosecution arguments during trial"""
        self.think("Responding to prosecution argument to protect client", "argument_response")
        
        prompt = f"""
        Respond to this prosecution argument as a defense attorney:
        
        Prosecution Argument: {prosecution_argument}
        
        Your response should:
        1. Challenge the logic and evidence cited
        2. Present alternative interpretations
        3. Emphasize reasonable doubt
        4. Protect your client's interests
        5. Cite relevant legal standards
        
        Be firm in defending your client while remaining professional.
        """
        
        return self.respond(prompt, "response to prosecution argument")
    
    def _get_opening_response(self) -> str:
        """Enhanced opening fallback response"""
        openings = [
            "Ladies and gentlemen of the jury, my client is innocent of these charges. The prosecution's case is built on speculation, not facts.",
            "Members of the jury, the evidence will show that the prosecution has failed to prove their case beyond a reasonable doubt.",
            "Your Honor and members of the jury, my client sits before you clothed in the presumption of innocence, and the prosecution has not met their burden to remove that cloak."
        ]
        return random.choice(openings)
    
    def _get_evidence_response(self) -> str:
        """Enhanced evidence challenge fallback"""
        responses = [
            "This evidence is unreliable and does not prove my client's guilt. There are alternative explanations that create reasonable doubt.",
            "The prosecution wants you to believe this evidence proves guilt, but it actually demonstrates the weakness of their case.",
            "This evidence raises more questions than it answers and fails to establish my client's culpability beyond a reasonable doubt."
        ]
        return random.choice(responses)
    
    def _get_closing_response(self) -> str:
        """Enhanced closing argument fallback"""
        closings = [
            "The prosecution has failed to prove their case beyond a reasonable doubt. My client is innocent, and I ask you to find them not guilty.",
            "Reasonable doubt exists throughout this case. The only just verdict is not guilty.",
            "The evidence does not support conviction. I urge you to uphold the presumption of innocence and find my client not guilty."
        ]
        return random.choice(closings)
    
    def _get_cross_examination_response(self) -> str:
        """Enhanced cross-examination fallback"""
        responses = [
            "This evidence is questionable at best. Can you be certain of its accuracy? Isn't it possible there are other explanations?",
            "The reliability of this evidence is suspect. How can the jury be sure this proves anything about my client's guilt?",
            "This evidence creates more doubt than certainty. Isn't it true that this could be explained in other ways?"
        ]
        return random.choice(responses)