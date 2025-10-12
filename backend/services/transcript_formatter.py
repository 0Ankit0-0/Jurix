"""
Transcript Formatter for Courtroom Simulation Reports

This module provides comprehensive cleaning and structuring of messy AI-generated transcripts
using regex preprocessing and LLM enhancement for professional PDF-ready formatting.
"""

import re
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from functools import lru_cache

# Import Gemini service for LLM structuring
try:
    from .ai_services.gemini_service import GeminiService
except ImportError:
    GeminiService = None
    logging.warning("GeminiService not available for transcript structuring")


class TranscriptFormattingError(Exception):
    """Raised when transcript formatting fails"""
    pass


class LLMServiceError(Exception):
    """Raised when LLM service encounters an error"""
    pass


class Speaker(Enum):
    """Enumeration of courtroom speakers"""
    JUDGE = "JUDGE"
    PROSECUTOR = "PROSECUTOR"
    DEFENSE = "DEFENSE"
    WITNESS = "WITNESS"


@dataclass
class TranscriptConfig:
    """Configuration for transcript formatting"""
    use_emojis: bool = True
    max_llm_tokens: int = 2000
    temperature: float = 0.3
    date_format: str = '%Y-%m-%d'
    time_format: str = '%H:%M:%S'
    max_input_length: int = 100000  # 100KB limit
    add_timestamps: bool = False
    start_time: str = "09:00:00"
    speaker_increment_seconds: int = 30


class SpeakerEmojis:
    """Emoji representations for speakers"""
    JUDGE = '👩‍⚖️'
    PROSECUTOR = '⚖️'
    DEFENSE = '🛡️'
    WITNESS = '👤'


class SectionMarkers:
    """Section markers used in transcripts"""
    CASE_ANALYSIS = 'CASE ANALYSIS:'
    LEGAL_STRATEGY = 'LEGAL STRATEGY:'
    COURT_STATEMENT = 'COURT STATEMENT:'
    FINAL_JUDGMENT = 'FINAL JUDGMENT'
    VERDICT = 'VERDICT'
    OPENING_STATEMENT = 'OPENING STATEMENT'
    CROSS_EXAMINATION = 'CROSS EXAMINATION'


class TranscriptFormatter:
    """Handles cleaning and structuring of courtroom simulation transcripts"""

    # Compile regex patterns at class level for performance
    MARKDOWN_PATTERN = re.compile(r'[#*`~>]+')
    WHITESPACE_PATTERN = re.compile(r'\s{2,}')
    NEWLINE_PATTERN = re.compile(r'\n{2,}')
    HTML_TAG_PATTERN = re.compile(r'<(?!/?(?:case_title|evidence))[^>]+>')
    SYMBOLS_PATTERN = re.compile(r'[■#]+')
    SECTION_NUMBER_PATTERN = re.compile(r'^\d+\.\s+')

    def __init__(self, config: Optional[TranscriptConfig] = None):
        """
        Initialize the formatter with optional configuration.
        
        Args:
            config: TranscriptConfig object with formatting options
        """
        self.config = config or TranscriptConfig()
        self.gemini = GeminiService() if GeminiService else None
        self.logger = logging.getLogger(__name__)
        
        # Configure logger if not already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def _validate_input(self, text: str, param_name: str) -> None:
        """
        Validate input text.
        
        Args:
            text: Text to validate
            param_name: Name of parameter for error messages
            
        Raises:
            ValueError: If input is invalid
        """
        if not text or not isinstance(text, str):
            raise ValueError(f"{param_name} must be a non-empty string")
        
        if len(text) > self.config.max_input_length:
            raise ValueError(
                f"{param_name} exceeds maximum length of "
                f"{self.config.max_input_length} characters"
            )

    def clean_text(self, text: str) -> str:
        """
        Remove markdown-like symbols from text using regex.

        Args:
            text: The raw text with markdown symbols

        Returns:
            Cleaned text without markdown symbols
            
        Raises:
            ValueError: If input is invalid
        """
        self._validate_input(text, "text")
        
        # Remove markdown-like symbols (keep _ for IDs)
        text = self.MARKDOWN_PATTERN.sub('', text)
        # Remove extra spaces
        text = self.WHITESPACE_PATTERN.sub(' ', text)
        return text.strip()

    def format_case_report(
        self,
        raw_case_text: str,
        verdict_data: Optional[Dict[str, str]] = None,
        evidence_files: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Clean and format case report text into bullet points with hyperlinks for evidence.

        Args:
            raw_case_text: The raw case report text
            verdict_data: Optional dict with 'winner' and 'verdict' keys
            evidence_files: Optional dict mapping evidence names to file paths
                           e.g., {'Document A': 'evidence_doc_a.pdf'}

        Returns:
            Formatted case report in bullet form
            
        Raises:
            ValueError: If input is invalid
        """
        self._validate_input(raw_case_text, "raw_case_text")
        
        # Initialize defaults
        evidence_files = evidence_files or {}
        verdict_data = verdict_data or {}

        # Remove HTML tags (except allowed ones)
        cleaned = self.HTML_TAG_PATTERN.sub('', raw_case_text)

        # Clean markdown symbols
        cleaned = self.clean_text(cleaned)

        # Split into lines
        lines = cleaned.split('\n')
        formatted_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for section headers
            if self.SECTION_NUMBER_PATTERN.match(line):
                if formatted_lines:
                    formatted_lines.append('')
                formatted_lines.append(f"---\n{line}")
                continue

            # Format key-value pairs as bullets
            if ':' in line and not line.startswith('-'):
                parts = line.split(':', 1)
                if len(parts) == 2:
                    key, value = parts
                    formatted_lines.append(f"- **{key.strip()}**: {value.strip()}")
                    continue

            # Add hyperlinks for evidence mentions
            if evidence_files:
                for evidence_name, file_path in evidence_files.items():
                    pattern = re.compile(re.escape(evidence_name), re.IGNORECASE)
                    line = pattern.sub(f'[{evidence_name}]({file_path})', line)
            
            formatted_lines.append(line)

        # Add final judgment section with actual data
        if verdict_data:
            formatted_lines.append('\n---\n4. Final Judgment')
            formatted_lines.append(f"- **Winner**: {verdict_data.get('winner', 'Not determined')}")
            formatted_lines.append(f"- **Verdict**: {verdict_data.get('verdict', 'Pending')}")
            
            if 'reasoning' in verdict_data:
                formatted_lines.append(f"- **Reasoning**: {verdict_data['reasoning']}")

        return '\n'.join(formatted_lines)

    def clean_transcript(self, raw_text: str) -> str:
        """
        Pre-process transcripts using regex cleaning to remove symbols and normalize formatting.

        Args:
            raw_text: The raw transcript text from simulation

        Returns:
            Cleaned transcript text
            
        Raises:
            ValueError: If input is invalid
        """
        self._validate_input(raw_text, "raw_text")
        
        # Remove extra symbols
        text = self.SYMBOLS_PATTERN.sub('', raw_text)

        # Replace multiple newlines and spaces
        text = self.NEWLINE_PATTERN.sub('\n', text)
        text = self.WHITESPACE_PATTERN.sub(' ', text)

        # Add speaker labels with optional emojis
        speaker_patterns = {
            Speaker.JUDGE: (r'(JUDGE:)', SpeakerEmojis.JUDGE),
            Speaker.PROSECUTOR: (r'(PROSECUTOR[\'S\s]*(?:OPENING)?:?)', SpeakerEmojis.PROSECUTOR),
            Speaker.DEFENSE: (r'(DEFENSE[\'S\s]*(?:OPENING)?:?)', SpeakerEmojis.DEFENSE),
        }

        for speaker, (pattern, emoji) in speaker_patterns.items():
            prefix = f'\n{emoji} ' if self.config.use_emojis else '\n'
            text = re.sub(pattern, f'{prefix}\\1', text, flags=re.IGNORECASE)

        # Add section headings
        section_patterns = [
            (SectionMarkers.CASE_ANALYSIS, '📚' if self.config.use_emojis else ''),
            (SectionMarkers.LEGAL_STRATEGY, '⚖️' if self.config.use_emojis else ''),
            (SectionMarkers.COURT_STATEMENT, '👩‍⚖️' if self.config.use_emojis else ''),
            (SectionMarkers.FINAL_JUDGMENT, '✅' if self.config.use_emojis else ''),
            (SectionMarkers.VERDICT, '✅' if self.config.use_emojis else ''),
        ]

        for marker, emoji in section_patterns:
            pattern = re.compile(f'(?i)({re.escape(marker)})')
            replacement = f'\n---\n{emoji} \\1' if emoji else '\n---\n\\1'
            text = pattern.sub(replacement, text)

        return text.strip()

    def _generate_timestamps(self, speaker_count: int) -> List[str]:
        """
        Generate realistic timestamps for transcript entries.
        
        Args:
            speaker_count: Number of speaker turns
            
        Returns:
            List of timestamp strings
        """
        start = datetime.strptime(self.config.start_time, self.config.time_format)
        timestamps = []
        
        for i in range(speaker_count):
            current_time = start + timedelta(seconds=i * self.config.speaker_increment_seconds)
            timestamps.append(current_time.strftime(self.config.time_format))
        
        return timestamps

    def add_timestamps_to_transcript(self, transcript: str) -> str:
        """
        Add realistic timestamps to speaker turns.

        Args:
            transcript: Formatted transcript

        Returns:
            Transcript with timestamps
        """
        if not self.config.add_timestamps:
            return transcript
        
        # Find all speaker markers
        speaker_pattern = re.compile(r'(?:👩‍⚖️|⚖️|🛡️|👤)?\s*(?:JUDGE|PROSECUTOR|DEFENSE|WITNESS):')
        matches = list(speaker_pattern.finditer(transcript))
        
        if not matches:
            return transcript
        
        # Generate timestamps
        timestamps = self._generate_timestamps(len(matches))
        
        # Insert timestamps in reverse order to maintain position indices
        result = transcript
        for match, timestamp in zip(reversed(matches), reversed(timestamps)):
            insert_pos = match.end()
            result = result[:insert_pos] + f' [{timestamp}]' + result[insert_pos:]
        
        return result

    @lru_cache(maxsize=50)
    def _get_llm_prompt_template(self) -> str:
        """
        Get the LLM prompt template (cached for performance).
        
        Returns:
            Formatted prompt template
        """
        emoji_guide = ""
        if self.config.use_emojis:
            emoji_guide = "5. Use emojis for visual clarity: 👩‍⚖️ Judge, ⚖️ Prosecutor, 🛡️ Defense"
        
        return f"""You are a legal transcript formatter and summarizer for courtroom AI simulations.
Your task is to:
1. Structure the transcript into clear speaker sections (Judge, Prosecutor, Defense).
2. Add headings like "Opening Argument", "Cross Examination", "Final Judgment".
3. Highlight legal issues, evidence references, and verdict reasoning.
4. Keep tone professional, concise, and courtroom-accurate.
{emoji_guide}
6. Format timestamps if available, otherwise omit.

OUTPUT FORMAT:
<case_title>
- Date: {datetime.now().strftime(self.config.date_format)}
- Case Type: {{case_type}}
- Participants: Judge, Prosecutor, Defense

=== Court Transcript ===

[Structured transcript with speaker sections]

---

=== Verdict Summary ===
- Verdict: [Guilty/Not Guilty/etc.]
- Reasoning: [Brief summary of key reasoning points]
"""

    def structure_transcript_with_llm(
        self,
        cleaned_transcript: str,
        case_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Use LLM to structure the cleaned transcript into professional courtroom format.

        Args:
            cleaned_transcript: Pre-cleaned transcript text
            case_context: Optional case information for better structuring

        Returns:
            Structured transcript in professional format
            
        Raises:
            LLMServiceError: If LLM service fails
        """
        if not self.gemini or not self.gemini.is_available():
            self.logger.warning("Gemini service not available, returning cleaned transcript")
            return cleaned_transcript

        # Build case context
        case_context = case_context or {}
        context_str = f"""
Case Title: {case_context.get('title', 'Unknown Case')}
Case Type: {case_context.get('case_type', 'Legal Matter')}
Description: {case_context.get('description', 'No description available')}
"""

        # Get prompt template
        system_prompt = self._get_llm_prompt_template()
        system_prompt = system_prompt.replace('{{case_type}}', case_context.get('case_type', 'N/A'))
        
        # Build full prompt
        full_prompt = f"{system_prompt}\n{context_str}\n\nCLEANED_TRANSCRIPT:\n{cleaned_transcript}"

        # Call LLM with error handling
        try:
            structured_transcript = self.gemini.generate_response(
                full_prompt,
                max_tokens=self.config.max_llm_tokens,
                temperature=self.config.temperature
            )

            if not structured_transcript:
                raise LLMServiceError("LLM returned empty response")
            
            return structured_transcript.strip()

        except Exception as e:
            self.logger.error(f"Error calling LLM for transcript structuring: {e}")
            raise LLMServiceError(f"Failed to structure transcript: {str(e)}")

    def generate_formatted_transcript_text(
        self,
        raw_transcript: str,
        case_context: Optional[Dict[str, Any]] = None,
        use_llm: bool = True
    ) -> str:
        """
        Complete pipeline: clean, structure with LLM, and format for PDF inclusion.

        Args:
            raw_transcript: Raw transcript from simulation
            case_context: Optional case information
            use_llm: Whether to use LLM structuring (default True)

        Returns:
            PDF-ready formatted transcript text
            
        Raises:
            TranscriptFormattingError: If formatting fails
        """
        try:
            # Step 1: Regex cleaning
            cleaned = self.clean_transcript(raw_transcript)

            # Step 2: LLM structuring (optional)
            if use_llm:
                try:
                    structured = self.structure_transcript_with_llm(cleaned, case_context)
                except LLMServiceError as e:
                    self.logger.warning(f"LLM structuring failed, using cleaned version: {e}")
                    structured = cleaned
            else:
                structured = cleaned

            # Step 3: Add timestamps if configured
            if self.config.add_timestamps:
                structured = self.add_timestamps_to_transcript(structured)

            return structured

        except Exception as e:
            self.logger.error(f"Error formatting transcript: {e}")
            raise TranscriptFormattingError(f"Failed to format transcript: {str(e)}")

    def segment_transcript_for_report(self, formatted_transcript: str) -> Dict[str, str]:
        """
        Segment the formatted transcript into report sections using regex.

        Args:
            formatted_transcript: The fully formatted transcript

        Returns:
            Dictionary with segmented sections
        """
        sections = {}

        # Extract case title
        case_match = re.search(r'<(.+?)>', formatted_transcript)
        if case_match:
            sections['case_title'] = case_match.group(1)

        # Extract case metadata
        metadata_match = re.search(
            r'- Date: (.+?)\n- Case Type: (.+?)\n- Participants: (.+?)(?:\n|$)',
            formatted_transcript
        )
        if metadata_match:
            sections['date'] = metadata_match.group(1)
            sections['case_type'] = metadata_match.group(2)
            sections['participants'] = metadata_match.group(3)

        # Extract transcript body
        transcript_match = re.search(
            r'=== Court Transcript ===(.*?)(?====|$)',
            formatted_transcript,
            re.DOTALL
        )
        if transcript_match:
            sections['transcript'] = transcript_match.group(1).strip()

        # Extract verdict summary
        verdict_match = re.search(
            r'=== Verdict Summary ===(.*?)$',
            formatted_transcript,
            re.DOTALL
        )
        if verdict_match:
            sections['verdict'] = verdict_match.group(1).strip()

        return sections


# Standalone functions for easy import
def clean_text(text: str, config: Optional[TranscriptConfig] = None) -> str:
    """Standalone cleaning function for markdown symbols"""
    formatter = TranscriptFormatter(config)
    return formatter.clean_text(text)


def clean_transcript(raw_text: str, config: Optional[TranscriptConfig] = None) -> str:
    """Standalone cleaning function"""
    formatter = TranscriptFormatter(config)
    return formatter.clean_transcript(raw_text)


def format_case_report(
    raw_case_text: str,
    verdict_data: Optional[Dict[str, str]] = None,
    evidence_files: Optional[Dict[str, str]] = None,
    config: Optional[TranscriptConfig] = None
) -> str:
    """Standalone function to format case reports into bullets with hyperlinks"""
    formatter = TranscriptFormatter(config)
    return formatter.format_case_report(raw_case_text, verdict_data, evidence_files)


def format_transcript_for_pdf(
    raw_transcript: str,
    case_context: Optional[Dict[str, Any]] = None,
    config: Optional[TranscriptConfig] = None
) -> str:
    """Complete formatting pipeline for PDF reports"""
    formatter = TranscriptFormatter(config)
    return formatter.generate_formatted_transcript_text(raw_transcript, case_context)


if __name__ == "__main__":
    # Example usage
    sample_transcript = """
■ JUDGE: Court is now in session for the case of ABC Corp vs XYZ Ltd.
### PROSECUTOR'S OPENING: We will prove fraud and misrepresentation.
DEFENSE'S OPENING: No evidence supports the claims.
CASE ANALYSIS: Evidence shows clear liability.
FINAL JUDGMENT: Defendant is guilty.
"""

    config = TranscriptConfig(add_timestamps=True)
    formatter = TranscriptFormatter(config)
    
    print("=== Improved Transcript Formatter ===")
    print("Cleaned and formatted transcript:")
    result = formatter.generate_formatted_transcript_text(
        sample_transcript,
        use_llm=False
    )
    print(result)
