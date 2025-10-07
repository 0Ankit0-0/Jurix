import unittest
import os
from backend.services.parsing.document_parsing_services import DocumentParser

class TestDocumentParsingLLaVA(unittest.TestCase):
    def setUp(self):
        self.parser = DocumentParser()
        # Provide a sample image path for testing
        self.sample_image_path = "backend/uploaded_evidence/577c8275-0cb3-41f1-89b9-ef4be4553d0c_20251002_112513.jpg"
    
    def test_llava_image_processing(self):
        """Test LLaVA vision model image processing integration and error handling"""
        if not os.path.exists(self.sample_image_path):
            self.skipTest(f"Sample image not found: {self.sample_image_path}")
        
        result = self.parser.parse_image(self.sample_image_path)
        
        # Check that result is a dict and has expected keys
        self.assertIsInstance(result, dict)
        self.assertIn('text', result)
        self.assertIn('extraction_method', result)
        
        # Check that extraction method is one of the expected
        self.assertIn(result['extraction_method'], ['llava_vision', 'gemini_vision', 'easyocr_fallback', 'no_text_found'])
        
        # If text is extracted, it should be a non-empty string
        if result['extraction_method'] != 'no_text_found':
            self.assertTrue(len(result['text'].strip()) > 0)
        
        # Print output for manual inspection
        print(f"Extraction method: {result['extraction_method']}")
        print(f"Extracted text (first 200 chars): {result['text'][:200]}")

if __name__ == "__main__":
    unittest.main()
