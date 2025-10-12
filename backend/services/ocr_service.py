"""
Dedicated OCR Service for Evidence Images
Processes evidence images using GPU-accelerated EasyOCR
"""

import os
import logging
from typing import List, Dict, Any
import torch
from PIL import Image

# Lazy import for easyocr
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logging.warning("⚠️ EasyOCR not available")

from config import Config

class EvidenceOCRService:
    """
    Service for OCR processing of evidence images with GPU support
    """

    def __init__(self):
        self.ocr_reader = None
        self.gpu_available = torch.cuda.is_available()
        self.evidence_dir = os.path.join(os.path.dirname(__file__), '..', 'uploaded_evidence')
        self.supported_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}

        logging.info(f"🎯 EvidenceOCRService initialized (GPU: {self.gpu_available})")

    def _init_ocr(self):
        """Initialize EasyOCR with GPU support if available"""
        if not self.ocr_reader and EASYOCR_AVAILABLE:
            try:
                self.ocr_reader = easyocr.Reader(['en'], gpu=self.gpu_available)
                logging.info(f"✅ EasyOCR initialized for evidence OCR with GPU: {self.gpu_available}")
            except Exception as e:
                logging.error(f"❌ EasyOCR initialization failed: {e}")
                self.ocr_reader = None

    def get_evidence_images(self) -> List[str]:
        """Get list of image files in evidence directory"""
        if not os.path.exists(self.evidence_dir):
            logging.warning(f"Evidence directory not found: {self.evidence_dir}")
            return []

        image_files = []
        for filename in os.listdir(self.evidence_dir):
            if os.path.splitext(filename)[1].lower() in self.supported_extensions:
                image_files.append(os.path.join(self.evidence_dir, filename))

        logging.info(f"📁 Found {len(image_files)} evidence images")
        return image_files

    def process_image_ocr(self, image_path: str) -> Dict[str, Any]:
        """Process a single image with OCR"""
        if not self.ocr_reader:
            self._init_ocr()
            if not self.ocr_reader:
                return {'error': 'OCR reader not available'}

        try:
            # Run OCR
            results = self.ocr_reader.readtext(image_path)

            # Extract text and confidence
            extracted_text = []
            total_confidence = 0
            text_count = 0

            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter low confidence
                    extracted_text.append(text)
                    total_confidence += confidence
                    text_count += 1

            combined_text = ' '.join(extracted_text)
            avg_confidence = total_confidence / text_count if text_count > 0 else 0

            result = {
                'filename': os.path.basename(image_path),
                'text': combined_text,
                'word_count': len(combined_text.split()),
                'char_count': len(combined_text),
                'confidence': avg_confidence,
                'text_blocks': len(extracted_text),
                'extraction_method': 'easyocr_gpu' if self.gpu_available else 'easyocr_cpu'
            }

            logging.info(f"✅ OCR processed: {os.path.basename(image_path)} - {len(combined_text)} chars, conf: {avg_confidence:.2f}")
            return result

        except Exception as e:
            logging.error(f"❌ OCR failed for {image_path}: {e}")
            return {'error': str(e), 'filename': os.path.basename(image_path)}

    def process_all_evidence_images(self) -> List[Dict[str, Any]]:
        """Process all evidence images with OCR"""
        image_files = self.get_evidence_images()
        results = []

        for image_path in image_files:
            result = self.process_image_ocr(image_path)
            results.append(result)

        logging.info(f"🎯 Processed {len(results)} evidence images with OCR")
        return results

    def process_single_evidence(self, filename: str) -> Dict[str, Any]:
        """Process a specific evidence image by filename"""
        image_path = os.path.join(self.evidence_dir, filename)
        if not os.path.exists(image_path):
            return {'error': f'File not found: {filename}'}

        return self.process_image_ocr(image_path)


# Standalone functions for easy use
def ocr_evidence_images() -> List[Dict[str, Any]]:
    """Convenience function to OCR all evidence images"""
    service = EvidenceOCRService()
    return service.process_all_evidence_images()

def ocr_single_evidence(filename: str) -> Dict[str, Any]:
    """Convenience function to OCR a single evidence image"""
    service = EvidenceOCRService()
    return service.process_single_evidence(filename)


if __name__ == "__main__":
    # Example usage
    print("🔍 Starting Evidence OCR Processing...")
    results = ocr_evidence_images()

    for result in results:
        if 'error' in result:
            print(f"❌ {result['filename']}: {result['error']}")
        else:
            print(f"✅ {result['filename']}: {result['word_count']} words, {result['char_count']} chars")
            print(f"   Text: {result['text'][:100]}...")
            print()
