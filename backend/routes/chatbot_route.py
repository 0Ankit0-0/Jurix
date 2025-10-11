"""
Chatbot Route - Legal AI Assistant API
Provides conversational AI interface for legal questions and case-specific guidance
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Dict, Any, Optional
import os
import json

# Import AI services
from services.ai_services.gemini_service import GeminiService
from services.ai_services.ai_agents.ollama_service import ollama_service
from model.case_model import get_case_by_id
from model.evidence_model import list_evidences

chatbot_bp = Blueprint("chatbot", __name__)

# Initialize AI services
gemini_service = None
try:
    gemini_service = GeminiService()
    print("✅ Gemini service initialized for chatbot")
except Exception as e:
    print(f"⚠️ Gemini service not available: {e}")


# -------------------------
# Helper Functions
# -------------------------


def get_legal_system_prompt(mode: str = "general") -> str:
    """Get system prompt based on chatbot mode"""

    base_prompt = """You are an expert AI Legal Assistant specializing in Indian law, 
    including IPC (Indian Penal Code), CrPC (Criminal Procedure Code), and the Indian Constitution.
    
    Your role is to:
    1. Provide accurate legal information and guidance
    2. Explain complex legal concepts in simple terms
    3. Help users understand legal procedures and requirements
    4. Suggest relevant legal strategies and considerations
    5. Reference specific legal sections when applicable
    
    Important guidelines:
    - Always clarify that you provide information, not legal advice
    - Encourage users to consult qualified lawyers for specific cases
    - Be educational, professional, and accessible
    - Use examples to illustrate legal concepts
    - Cite relevant laws and precedents when possible
    """

    if mode == "case_specific":
        base_prompt += """
        
        CASE-SPECIFIC MODE:
        You are now analyzing a specific case. Use the case details and evidence 
        provided to give targeted guidance. Consider:
        - Case type and applicable laws
        - Evidence strength and relevance
        - Potential legal strategies
        - Procedural requirements
        - Possible outcomes and precedents
        """

    return base_prompt


def build_case_context(case_id: str) -> Optional[Dict[str, Any]]:
    """Build context from case data and evidence"""
    try:
        case = get_case_by_id(case_id)
        if not case:
            return None

        # Get evidence
        evidence_list = list_evidences({"case_id": case_id})

        # Parse parties field if it's a JSON string
        parties = case.get("parties", {})
        if isinstance(parties, str):
            try:
                parties = json.loads(parties)
            except json.JSONDecodeError:
                parties = {}

        context = {
            "case_title": case.get("title", "Unknown"),
            "case_type": case.get("case_type", "Unknown"),
            "description": case.get("description", ""),
            "parties": parties,
            "evidence_count": len(evidence_list),
            "evidence_summary": [],
        }

        # Add evidence summaries (limit to 5 for context)
        for ev in evidence_list[:5]:
            context["evidence_summary"].append(
                {
                    "title": ev.get("title", "Untitled"),
                    "type": ev.get("evidence_type", "unknown"),
                    "description": ev.get("description", ""),
                }
            )

        return context

    except Exception as e:
        print(f"❌ Error building case context: {e}")
        return None


def format_case_context_for_prompt(context: Dict[str, Any]) -> str:
    """Format case context into a readable prompt section"""

    prompt = f"""
    CASE INFORMATION:
    Title: {context['case_title']}
    Type: {context['case_type']}
    Description: {context['description']}
    
    Parties:
    - Plaintiff: {context['parties'].get('plaintiff', {}).get('name', 'Not specified')}
    - Defendant: {context['parties'].get('defendant', {}).get('name', 'Not specified')}
    
    Evidence ({context['evidence_count']} items):
    """

    for i, ev in enumerate(context["evidence_summary"], 1):
        prompt += f"\n{i}. {ev['title']} ({ev['type']}): {ev['description']}"

    return prompt


def generate_response_with_fallback(
    prompt: str, system_prompt: str, max_tokens: int = 800
) -> Dict[str, Any]:
    """
    Generate response with multi-tier fallback:
    1. Gemini API
    2. Ollama (local)
    3. Static educational response
    """

    # Tier 1: Try Gemini
    if gemini_service:
        try:
            full_prompt = f"{system_prompt}\n\nUser Question: {prompt}"
            response = gemini_service.generate_response(
                full_prompt, max_tokens=max_tokens
            )

            if response and len(response.strip()) > 20:
                return {"response": response, "provider": "gemini", "success": True}
        except Exception as e:
            print(f"⚠️ Gemini failed: {e}")

    # Tier 2: Try Ollama
    if ollama_service.is_available():
        try:
            # Use Indian law model for legal queries, reasoning for others
            model_type = "indian_law" if any(word in prompt.lower() for word in ["law", "legal", "court", "case", "ipc", "crpc", "constitution", "contract", "criminal", "civil"]) else "reasoning"

            response = ollama_service.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                model_type=model_type,
                temperature=0.7,
                max_tokens=max_tokens,
            )

            if response and len(response.strip()) > 20:
                return {"response": response, "provider": f"ollama_{model_type}", "success": True}
        except Exception as e:
            print(f"⚠️ Ollama failed: {e}")

    # Tier 3: Static educational response
    return {
        "response": generate_static_response(prompt),
        "provider": "static",
        "success": True,
    }


def generate_static_response(query: str) -> str:
    """Generate educational static response based on query keywords"""

    query_lower = query.lower()

    # Legal concept responses
    if any(word in query_lower for word in ["contract", "agreement", "terms"]):
        return """A valid contract in Indian law requires three essential elements:

1. **Offer and Acceptance**: One party makes a clear offer, and the other accepts it unconditionally.
2. **Consideration**: Something of value must be exchanged between parties.
3. **Intention to Create Legal Relations**: Both parties must intend the agreement to be legally binding.

Additional requirements include:
- Parties must be competent to contract (of legal age and sound mind)
- The object must be lawful
- The agreement must not be expressly declared void

Relevant law: Indian Contract Act, 1872

For specific contract disputes, consult a qualified lawyer to review your agreement."""

    elif any(word in query_lower for word in ["criminal", "ipc", "offense", "crime"]):
        return """Criminal law in India is primarily governed by the Indian Penal Code (IPC), 1860.

Key principles:
1. **Mens Rea**: Criminal intent or guilty mind
2. **Actus Reus**: The criminal act itself
3. **Burden of Proof**: Prosecution must prove guilt beyond reasonable doubt

Common criminal offenses include:
- Theft (IPC Section 378)
- Assault (IPC Section 351)
- Fraud (IPC Section 420)
- Criminal breach of trust (IPC Section 405)

Criminal procedure is governed by CrPC (Criminal Procedure Code), 1973.

If you're facing criminal charges, immediately consult a criminal defense lawyer."""

    elif any(word in query_lower for word in ["evidence", "proof", "admissible"]):
        return """Evidence law in India is governed by the Indian Evidence Act, 1872.

Key principles:
1. **Relevance**: Evidence must be relevant to the facts in issue
2. **Admissibility**: Evidence must be legally admissible
3. **Weight**: The court determines how much weight to give evidence

Types of evidence:
- **Documentary**: Written documents, contracts, records
- **Oral**: Witness testimony
- **Real**: Physical objects, forensic evidence
- **Electronic**: Digital records, emails, CCTV footage

Important rules:
- Hearsay is generally not admissible
- Best evidence rule: Original documents preferred
- Chain of custody must be maintained

For evidence-related matters, work with a lawyer to ensure proper presentation."""

    elif any(
        word in query_lower for word in ["court", "procedure", "filing", "lawsuit"]
    ):
        return """Court procedures in India vary by case type:

**Civil Cases** (governed by CPC - Civil Procedure Code, 1908):
1. File plaint with court
2. Court issues summons to defendant
3. Defendant files written statement
4. Evidence presentation
5. Arguments
6. Judgment

**Criminal Cases** (governed by CrPC):
1. FIR (First Information Report) filed
2. Police investigation
3. Chargesheet filed
4. Trial begins
5. Evidence and arguments
6. Verdict

**Court Hierarchy**:
- Supreme Court (highest)
- High Courts (state level)
- District Courts
- Magistrate Courts

Always engage a lawyer to handle court procedures properly."""

    elif any(word in query_lower for word in ["bail", "custody", "arrest"]):
        return """Bail in India is governed by CrPC Sections 436-450.

**Types of Bail**:
1. **Regular Bail**: Applied for after arrest
2. **Anticipatory Bail**: Applied before arrest (Section 438)
3. **Interim Bail**: Temporary bail pending regular bail decision

**Bail Considerations**:
- Nature and gravity of offense
- Character of accused
- Risk of fleeing
- Risk of tampering with evidence
- Previous criminal record

**Bailable vs Non-Bailable Offenses**:
- Bailable: Bail is a right (minor offenses)
- Non-Bailable: Bail is at court's discretion (serious offenses)

If arrested or anticipating arrest, immediately contact a criminal lawyer."""

    else:
        # Generic legal guidance
        return """I'm here to help with legal questions about Indian law.

I can assist with:
- Contract law and agreements
- Criminal law (IPC, CrPC)
- Evidence and proof requirements
- Court procedures and filing
- Constitutional rights
- Civil disputes
- Legal terminology and concepts

**Important Disclaimer**: I provide legal information, not legal advice. For specific legal matters, always consult a qualified lawyer who can review your case details.

Please ask your specific legal question, and I'll provide relevant information and guidance."""


# -------------------------
# API Routes
# -------------------------


@chatbot_bp.route("/chatbot/query", methods=["POST", "OPTIONS"])
def chatbot_query():
    """
    Main chatbot query endpoint

    Request body:
    {
        "query": "User's question",
        "mode": "general" | "case_specific",
        "case_id": "optional - required for case_specific mode",
        "conversation_history": [] // optional - for context
    }
    """
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()

        if not data or "query" not in data:
            return jsonify({"error": "Query is required"}), 400

        query = data.get("query", "").strip()
        mode = data.get("mode", "general")
        case_id = data.get("case_id")

        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        # Validate mode
        if mode not in ["general", "case_specific"]:
            return jsonify({"error": "Mode must be 'general' or 'case_specific'"}), 400

        # For case-specific mode, case_id is required
        if mode == "case_specific" and not case_id:
            return jsonify({"error": "case_id is required for case_specific mode"}), 400

        print(f"💬 Chatbot query: {query[:100]}... (mode: {mode})")

        # Build system prompt
        system_prompt = get_legal_system_prompt(mode)

        # Add case context if in case-specific mode
        full_query = query
        case_context = None

        if mode == "case_specific":
            case_context = build_case_context(case_id)
            if case_context:
                context_text = format_case_context_for_prompt(case_context)
                full_query = f"{context_text}\n\nUser Question: {query}"
            else:
                return jsonify({"error": "Case not found or inaccessible"}), 404

        # Generate response with fallback
        result = generate_response_with_fallback(full_query, system_prompt)

        response_data = {
            "response": result["response"],
            "provider": result["provider"],
            "mode": mode,
            "timestamp": datetime.utcnow().isoformat(),
            "success": True,
        }

        if case_context:
            response_data["case_context"] = {
                "title": case_context["case_title"],
                "type": case_context["case_type"],
            }

        print(f"✅ Response generated via {result['provider']}")

        return jsonify(response_data), 200

    except Exception as e:
        print(f"❌ Chatbot query error: {e}")
        return jsonify({"error": "Failed to process query", "details": str(e)}), 500


@chatbot_bp.route("/chatbot/health", methods=["GET"])
def chatbot_health():
    """Health check endpoint for chatbot service"""

    health_status = {
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "providers": {
            "gemini": "available" if gemini_service else "unavailable",
            "ollama": "available" if ollama_service.is_available() else "unavailable",
            "static": "available",
        },
    }

    # Check Ollama models if available
    if ollama_service.is_available():
        health_status["ollama_models"] = ollama_service.get_available_models()

    return jsonify(health_status), 200


@chatbot_bp.route("/chatbot/modes", methods=["GET"])
def get_chatbot_modes():
    """Get available chatbot modes and their descriptions"""

    modes = {
        "general": {
            "name": "General Legal Assistant",
            "description": "Ask general legal questions about Indian law, procedures, and concepts",
            "requires_case": False,
            "features": [
                "Legal concept explanations",
                "Procedure guidance",
                "Law references (IPC, CrPC, Constitution)",
                "General legal advice",
            ],
        },
        "case_specific": {
            "name": "Case-Specific Analysis",
            "description": "Get targeted guidance for your specific case with evidence analysis",
            "requires_case": True,
            "features": [
                "Case-specific legal strategy",
                "Evidence analysis",
                "Applicable law identification",
                "Procedural recommendations",
                "Argument suggestions",
            ],
        },
    }

    return jsonify({"modes": modes, "default_mode": "general"}), 200


@chatbot_bp.route("/chatbot/suggestions", methods=["GET"])
def get_suggestions():
    """Get suggested questions for users"""

    suggestions = {
        "general": [
            "What are the key elements of a valid contract?",
            "How do I file a criminal complaint in India?",
            "What is the difference between bailable and non-bailable offenses?",
            "What types of evidence are admissible in court?",
            "How does the bail process work?",
            "What are my constitutional rights during arrest?",
        ],
        "case_specific": [
            "What legal strategy should I consider for this case?",
            "How strong is the evidence in my case?",
            "What are the applicable laws for this case type?",
            "What are the potential outcomes?",
            "What procedural steps should I follow?",
            "How should I structure my arguments?",
        ],
    }

    return jsonify(suggestions), 200
