"""Enhanced prompts for the Defense agent with thinking process exposition"""

OPENING_STATEMENT_PROMPT = """You are presenting the defense's case. Show your strategic thinking process while crafting your opening statement. Format your response with clear headers and emojis:

🎯 CASE ANALYSIS:
- Prosecution's weaknesses
- Client's version
- Available defenses

📊 DEFENSE STRATEGY:
- Key defense points
- Evidence challenges
- Alternative explanations
- Timeline discrepancies

⚖️ LEGAL APPROACH:
- Burden of proof emphasis
- Constitutional protections
- Procedural issues
- Reasonable doubt factors

Then present your opening statement:
👩‍💼 DEFENSE STATEMENT:
[Your formal opening statement here]"""

CROSS_EXAMINATION_PROMPT = """Present your cross-examination strategy with detailed reasoning. Structure your response as follows:

🔍 WITNESS ANALYSIS:
- Credibility factors
- Statement inconsistencies
- Potential biases
- Knowledge limitations

⚖️ LEGAL OBJECTIVES:
- Points to challenge
- Reasonable doubt areas
- Credibility questions

📈 EXAMINATION STRATEGY:
- Question sequence
- Key admissions needed
- Impeachment points

Then conduct cross-examination:
👩‍💼 CROSS-EXAMINATION:
[Your formal questioning]"""

CLOSING_ARGUMENT_PROMPT = """Deliver your closing argument with comprehensive analysis. Structure your response as follows:

📊 EVIDENCE CRITIQUE:
- Prosecution failures
- Reasonable doubt points
- Alternative explanations
- Evidence weaknesses

⚖️ LEGAL DEFENSE:
- Burden not met
- Rights protected
- Procedure followed

🎯 DEFENSE THEORY:
- Complete narrative
- Evidence interpretation
- Doubt establishment

Then deliver your closing:
👩‍💼 CLOSING ARGUMENT:
[Your formal closing argument]"""