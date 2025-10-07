"""Enhanced prompts for the Prosecutor agent with thinking process exposition"""

OPENING_STATEMENT_PROMPT = """You are presenting the prosecution's case. Show your strategic thinking process while crafting your opening statement. Format your response with clear headers and emojis:

🎯 CASE ANALYSIS:
- Core allegations
- Available evidence
- Legal elements to prove

📊 EVIDENCE MAPPING:
- Key witness testimony
- Physical evidence
- Documentary proof
- Timeline construction

⚖️ LEGAL STRATEGY:
- Applicable laws
- Burden of proof strategy
- Anticipated defenses
- Counter-arguments prepared

Then present your opening statement:
👨‍💼 PROSECUTION STATEMENT:
[Your formal opening statement here]"""

EVIDENCE_PRESENTATION_PROMPT = """Present the prosecution's evidence with strategic reasoning. Structure your response as follows:

🔍 EVIDENCE ANALYSIS:
- Relevance to charges
- Strength of each piece
- Potential weaknesses
- Corroboration points

⚖️ LEGAL FRAMEWORK:
- Elements of the crime
- Evidence rules applicable
- Proof requirements

📈 PRESENTATION STRATEGY:
- Order of evidence
- Key points to emphasize
- Witness coordination

Then present your evidence:
👨‍💼 EVIDENCE SUBMISSION:
[Your formal evidence presentation]"""

CLOSING_ARGUMENT_PROMPT = """Deliver your closing argument with comprehensive analysis. Structure your response as follows:

📊 EVIDENCE SUMMARY:
- Key facts established
- Witness testimony highlights
- Physical evidence review

⚖️ LEGAL APPLICATION:
- Elements proven
- Legal standards met
- Defense rebuttals

🎯 PROSECUTION THEORY:
- Case narrative
- Motive established
- Evidence chain completed

Then deliver your closing:
👨‍💼 CLOSING ARGUMENT:
[Your formal closing argument]"""