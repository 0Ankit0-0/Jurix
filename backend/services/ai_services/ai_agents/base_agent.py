import os
import random
from typing import Dict, List, Any, Optional
from services.ai_services.gemini_service import GeminiService

class BaseAgent:
    """Enhanced base class for all courtroom agents with improved AI and fallback responses"""
    
    def __init__(self, role: str, personality: str = "professional", expertise_level: str = "experienced"):
        self.role = role
        self.personality = personality
        self.expertise_level = expertise_level
        self.thinking_process = []
        self.case_memory = {}  # Store case-specific information
        self.evidence_analysis = {}  # Store evidence analysis
        
        # Initialize AI services with fallback chain
        # Tier 1: Gemini API
        try:
            self.gemini = GeminiService()
            self.gemini_available = True
            print(f"✅ {role}: Gemini service initialized")
        except Exception as e:
            print(f"⚠️ {role}: Gemini service not available: {e}")
            self.gemini = None
            self.gemini_available = False
        
        # Tier 2: Ollama (local models)
        try:
            from services.ai_services.ai_agents.ollama_service import ollama_service
            self.ollama = ollama_service
            self.ollama_available = self.ollama.is_available()
            if self.ollama_available:
                print(f"✅ {role}: Ollama service available")
            else:
                print(f"⚠️ {role}: Ollama service not running")
        except Exception as e:
            print(f"⚠️ {role}: Ollama service not available: {e}")
            self.ollama = None
            self.ollama_available = False
        
        # Set overall AI availability
        self.ai_available = self.gemini_available or self.ollama_available
        
        # Legal knowledge base for fallbacks
        self.legal_knowledge = self._initialize_legal_knowledge()
        
    def _initialize_legal_knowledge(self) -> Dict[str, Any]:
        """Initialize legal knowledge base for realistic fallbacks"""
        return {
            'legal_principles': [
                "burden of proof",
                "reasonable doubt",
                "preponderance of evidence",
                "due process",
                "presumption of innocence",
                "chain of custody",
                "hearsay rule",
                "best evidence rule"
            ],
            'case_types': {
                'criminal': {
                    'standard': 'beyond a reasonable doubt',
                    'key_elements': ['mens rea', 'actus reus', 'causation'],
                    'common_defenses': ['alibi', 'self-defense', 'insanity', 'duress']
                },
                'civil': {
                    'standard': 'preponderance of evidence',
                    'key_elements': ['duty', 'breach', 'causation', 'damages'],
                    'common_defenses': ['comparative negligence', 'assumption of risk']
                },
                'constitutional': {
                    'standard': 'strict scrutiny',
                    'key_elements': ['fundamental rights', 'equal protection', 'due process'],
                    'common_issues': ['first amendment', 'fourth amendment', 'fourteenth amendment']
                }
            },
            'evidence_types': {
                'documentary': 'Written evidence including contracts, letters, records',
                'testimonial': 'Witness statements and expert testimony',
                'physical': 'Tangible objects and forensic evidence',
                'digital': 'Electronic records, communications, and data'
            }
        }
    
    def think(self, situation: str, category: str = "general") -> str:
        """Enhanced thinking process with categorization"""
        timestamp = self._get_timestamp()
        thought = f"[{self.role.upper()} - {category.upper()}] {timestamp}: {situation}"
        self.thinking_process.append({
            'timestamp': timestamp,
            'category': category,
            'thought': situation,
            'role': self.role
        })
        if os.getenv('DEBUG', 'false').lower() == 'true':
            print(thought)
        return thought
    
    def _get_timestamp(self) -> str:
        """Get current timestamp for thinking process"""
        from datetime import datetime
        return datetime.now().strftime("%H:%M:%S")
    
    def analyze_case(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze case data and store relevant information"""
        self.think(f"Analyzing case: {case_data.get('title', 'Unknown')}", "analysis")
        
        case_type = case_data.get('case_type', 'unknown').lower()
        analysis = {
            'case_type': case_type,
            'complexity': self._assess_complexity(case_data),
            'key_issues': self._identify_key_issues(case_data, case_type),
            'applicable_law': self._get_applicable_law(case_type),
            'strategy_notes': self._develop_strategy_notes(case_data, case_type)
        }
        
        self.case_memory.update(analysis)
        return analysis
    
    def _assess_complexity(self, case_data: Dict[str, Any]) -> str:
        """Assess case complexity based on available information"""
        factors = 0
        if len(case_data.get('description', '')) > 500:
            factors += 1
        if case_data.get('parties', {}).get('multiple_parties'):
            factors += 1
        if case_data.get('case_type') in ['constitutional', 'corporate']:
            factors += 1
        
        if factors >= 2:
            return "high"
        elif factors == 1:
            return "medium"
        else:
            return "low"
    
    def _identify_key_issues(self, case_data: Dict[str, Any], case_type: str) -> List[str]:
        """Identify key legal issues based on case type and description"""
        description = case_data.get('description', '').lower()
        issues = []
        
        if case_type == 'criminal':
            if any(word in description for word in ['theft', 'steal', 'robbery']):
                issues.extend(['intent to steal', 'ownership of property', 'value of stolen goods'])
            if any(word in description for word in ['assault', 'battery', 'violence']):
                issues.extend(['intent to harm', 'self-defense', 'provocation'])
            if any(word in description for word in ['fraud', 'deception']):
                issues.extend(['intent to defraud', 'materiality of misrepresentation'])
        
        elif case_type == 'civil':
            if any(word in description for word in ['contract', 'agreement', 'breach']):
                issues.extend(['contract formation', 'performance', 'damages'])
            if any(word in description for word in ['negligence', 'accident', 'injury']):
                issues.extend(['duty of care', 'breach of duty', 'causation', 'damages'])
        
        return issues or ['liability', 'damages', 'causation']
    
    def _get_applicable_law(self, case_type: str) -> List[str]:
        """Get applicable legal principles for case type"""
        return self.legal_knowledge['case_types'].get(case_type, {}).get('key_elements', ['general legal principles'])
    
    def _develop_strategy_notes(self, case_data: Dict[str, Any], case_type: str) -> List[str]:
        """Develop role-specific strategy notes"""
        # This will be overridden by specific agent classes
        return [f"Develop {self.role} strategy for {case_type} case"]
    
    def respond(self, prompt: str, context: str = "", use_case_knowledge: bool = True) -> str:
        """Enhanced response generation with multi-tier AI fallback"""
        self.think(f"Generating response for: {context[:50]}...", "response")
        
        # Enhance prompt with case knowledge if available
        enhanced_prompt = self._enhance_prompt_with_knowledge(prompt, context, use_case_knowledge)
        
        # Tier 1: Try Gemini first
        if self.gemini_available and self.gemini:
            try:
                response = self.gemini.generate_response(enhanced_prompt, max_tokens=400)
                if response and len(response.strip()) > 10:
                    self.think(f"Generated Gemini response: {len(response)} characters", "gemini_success")
                    return self._post_process_response(response)
            except Exception as e:
                self.think(f"Gemini response failed: {str(e)}", "gemini_error")
        
        # Tier 2: Try Ollama fallback
        if self.ollama_available and self.ollama:
            try:
                self.think("Attempting Ollama fallback", "ollama_attempt")
                
                # Build system prompt for Ollama
                system_prompt = f"""You are an {self.expertise_level} {self.role} with a {self.personality} personality.
                Provide a professional legal response in under 300 words."""
                
                response = self.ollama.generate_response(
                    prompt=enhanced_prompt,
                    system_prompt=system_prompt,
                    model_type="reasoning",
                    temperature=0.7,
                    max_tokens=400
                )
                
                if response and len(response.strip()) > 10:
                    self.think(f"Generated Ollama response: {len(response)} characters", "ollama_success")
                    return self._post_process_response(response)
            except Exception as e:
                self.think(f"Ollama response failed: {str(e)}", "ollama_error")
        
        # Tier 3: Enhanced static fallback
        fallback = self._generate_enhanced_fallback(prompt, context)
        self.think("Used enhanced static fallback response", "static_fallback")
        return fallback
    
    def _enhance_prompt_with_knowledge(self, prompt: str, context: str, use_case_knowledge: bool) -> str:
        """Enhance prompt with legal knowledge and case context"""
        enhanced_prompt = f"""
        You are an {self.expertise_level} {self.role} with a {self.personality} personality in a legal simulation.
        
        Role Context: {self.role}
        Personality: {self.personality}
        Expertise Level: {self.expertise_level}
        
        Current Situation: {context}
        Request: {prompt}
        """
        
        if use_case_knowledge and self.case_memory:
            enhanced_prompt += f"""
            
            Case Knowledge:
            - Case Type: {self.case_memory.get('case_type', 'unknown')}
            - Complexity: {self.case_memory.get('complexity', 'unknown')}
            - Key Issues: {', '.join(self.case_memory.get('key_issues', []))}
            - Applicable Law: {', '.join(self.case_memory.get('applicable_law', []))}
            """
        
        enhanced_prompt += """
        
        Instructions:
        1. Respond authentically as this legal professional would
        2. Use appropriate legal terminology
        3. Be educational and realistic
        4. Keep response under 300 words
        5. Show legal reasoning where appropriate
        """
        
        return enhanced_prompt
    
    def _post_process_response(self, response: str) -> str:
        """Post-process AI response for consistency and quality"""
        # Remove any unwanted prefixes
        response = response.strip()
        
        # Ensure response doesn't start with role identification if it's redundant
        role_prefixes = [f"As a {self.role}", f"As the {self.role}", f"I am a {self.role}"]
        for prefix in role_prefixes:
            if response.startswith(prefix):
                # Keep it if it's part of a longer sentence, remove if standalone
                if len(response.split('.')[0]) < 50:
                    response = '. '.join(response.split('.')[1:]).strip()
        
        return response
    
    def _generate_enhanced_fallback(self, prompt: str, context: str) -> str:
        """Generate sophisticated fallback responses based on role and context"""
        context_lower = context.lower()
        prompt_lower = prompt.lower()
        
        # Determine response category
        if any(word in context_lower for word in ['opening', 'statement', 'begin']):
            return self._get_opening_response()
        elif any(word in context_lower for word in ['evidence', 'present', 'exhibit']):
            return self._get_evidence_response()
        elif any(word in context_lower for word in ['closing', 'final', 'argument']):
            return self._get_closing_response()
        elif any(word in context_lower for word in ['objection', 'rule', 'sustain']):
            return self._get_objection_response()
        elif any(word in context_lower for word in ['cross', 'examine', 'question']):
            return self._get_cross_examination_response()
        else:
            return self._get_general_response()
    
    def _get_opening_response(self) -> str:
        """Get role-specific opening response"""
        return f"As the {self.role}, I will present my case according to legal standards and professional ethics."
    
    def _get_evidence_response(self) -> str:
        """Get role-specific evidence response"""
        return f"I will address this evidence according to the rules of evidence and my professional obligations as {self.role}."
    
    def _get_closing_response(self) -> str:
        """Get role-specific closing response"""
        return f"In conclusion, based on the evidence and legal principles presented, I maintain my position as {self.role}."
    
    def _get_objection_response(self) -> str:
        """Get role-specific objection response"""
        return f"I will consider this matter according to legal precedent and procedural rules."
    
    def _get_cross_examination_response(self) -> str:
        """Get role-specific cross-examination response"""
        return f"I will conduct this examination according to professional standards and legal ethics."
    
    def _get_general_response(self) -> str:
        """Get general role-specific response"""
        return f"As {self.role}, I will proceed according to legal protocol and professional standards."
    
    def get_thinking_process(self) -> List[Dict[str, Any]]:
        """Return structured thinking process"""
        return self.thinking_process
    
    def get_case_analysis(self) -> Dict[str, Any]:
        """Return case analysis"""
        return self.case_memory
    
    def clear_memory(self):
        """Clear case memory and thinking process"""
        self.thinking_process = []
        self.case_memory = {}
        self.evidence_analysis = {}
    
    def add_evidence_analysis(self, evidence_id: str, analysis: Dict[str, Any]):
        """Add evidence analysis to memory"""
        self.evidence_analysis[evidence_id] = analysis
        self.think(f"Added analysis for evidence: {evidence_id}", "evidence_analysis")