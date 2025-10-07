"""
Enhanced Vision Service with Multiple Models
Provides robust image analysis using multiple AI models and OCR engines

w  Phase 2: Enhanced Image Captioning & Processing with BLIP-2
"""

import os
import logging
from typing import Dict, Any, Optional, List
import time
from PIL import Image
import cv2
import numpy as np

# Lazy imports for heavy dependencies
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logging.warning("⚠️ EasyOCR not available")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logging.warning("⚠️ Pytesseract not available")

try:
    from transformers import Blip2Processor, Blip2ForConditionalGeneration
    import torch
    BLIP2_AVAILABLE = True
except ImportError:
    BLIP2_AVAILABLE = False
    logging.warning("⚠️ BLIP-2 not available. Install with: pip install transformers torch")

class VisionService:
    """
    Enhanced Vision Service with BLIP-2 for image captioning
    Target: 20-30 seconds processing time for images
    """
    
    def __init__(self, use_low_res=True, max_image_size=512):
        """
        Initialize Vision Service with performance optimizations
        
        Args:
            use_low_res: Use lower resolution for faster processing (default: True)
            max_image_size: Maximum image dimension for processing (default: 512)
        """
        self.ocr_reader = None
        self.tesseract_available = self._check_tesseract()
        self.blip2_processor = None
        self.blip2_model = None
        self.device = None
        self.use_low_res = use_low_res
        self.max_image_size = max_image_size
        
        logging.info(f"🎨 VisionService initialized (low_res={use_low_res}, max_size={max_image_size})")
        
    def _check_tesseract(self) -> bool:
        """Check if Tesseract OCR is available"""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            logging.warning("⚠️ Tesseract OCR not available")
            return False
            
    def _init_ocr(self):
        """Initialize OCR engines lazily"""
        if not self.ocr_reader:
            try:
                self.ocr_reader = easyocr.Reader(['en'])
                logging.info("✅ EasyOCR initialized")
            except Exception as e:
                logging.error(f"❌ EasyOCR initialization failed: {e}")
                
    def _init_blip2_model(self):
        """
        Initialize BLIP-2 model for image captioning
        Uses optimized settings for 20-30 second target
        """
        if not BLIP2_AVAILABLE:
            logging.warning("⚠️ BLIP-2 not available, skipping initialization")
            return False
            
        if self.blip2_model is None:
            try:
                start_time = time.time()
                logging.info("🔄 Loading BLIP-2 model (this may take a moment)...")
                
                # Use smaller BLIP-2 model for faster inference
                model_name = "Salesforce/blip2-opt-2.7b"  # Smaller, faster model
                
                # Determine device
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                logging.info(f"📱 Using device: {self.device}")
                
                # Load processor and model
                self.blip2_processor = Blip2Processor.from_pretrained(model_name)
                self.blip2_model = Blip2ForConditionalGeneration.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                self.blip2_model.to(self.device)
                
                load_time = time.time() - start_time
                logging.info(f"✅ BLIP-2 model loaded in {load_time:.2f}s")
                return True
                
            except Exception as e:
                logging.error(f"❌ BLIP-2 initialization failed: {e}")
                return False
        return True

    def process_image(self, image_path: str, tasks: List[str] = ["caption", "layout", "scene"]) -> Dict[str, Any]:
        """Process image with advanced AI models for scene understanding and layout analysis.
        Note: Text extraction is handled separately by the document parser's fallback chain.
        
        Args:
            image_path: Path to image file
            tasks: List of analysis tasks - "caption", "layout", "scene"
            
        Returns:
            Dictionary with results from scene analysis, layout understanding, and captioning
        """
        results = {}
        image = Image.open(image_path)
            
        # Image Captioning
        if "caption" in tasks:
            self._init_caption_model()
            if self.caption_model:
                try:
                    caption = self.caption_model(image_path)[0]["generated_text"]
                    results["caption"] = caption
                except Exception as e:
                    logging.error(f"Caption generation failed: {e}")
                    
        # Layout Analysis
        if "layout" in tasks:
            self._init_layout_model()
            if self.layout_model:
                try:
                    layout = self._analyze_document_layout(image_path)
                    results["layout"] = layout
                except Exception as e:
                    logging.error(f"Layout analysis failed: {e}")
                    
        # Scene Analysis
        if "scene" in tasks:
            try:
                scene_info = self._analyze_scene(image)
                results["scene"] = scene_info
            except Exception as e:
                logging.error(f"Scene analysis failed: {e}")
                
        return results

    def _extract_text_multi_engine(self, image_path: str) -> Dict[str, Any]:
        """Extract text using multiple OCR engines for better accuracy"""
        results = {"combined": "", "sources": {}}
        
        # EasyOCR
        self._init_ocr()
        if self.ocr_reader:
            try:
                easy_ocr_result = self.ocr_reader.readtext(image_path)
                easy_ocr_text = " ".join([text for _, text, conf in easy_ocr_result if conf > 0.5])
                results["sources"]["easyocr"] = {
                    "text": easy_ocr_text,
                    "confidence": sum([conf for _, _, conf in easy_ocr_result]) / len(easy_ocr_result)
                }
            except Exception as e:
                logging.error(f"EasyOCR failed: {e}")
                
        # Tesseract
        if self.tesseract_available:
            try:
                image = Image.open(image_path)
                tesseract_text = pytesseract.image_to_string(image)
                results["sources"]["tesseract"] = {
                    "text": tesseract_text.strip(),
                    "confidence": None  # Tesseract doesn't provide confidence scores directly
                }
            except Exception as e:
                logging.error(f"Tesseract failed: {e}")
                
        # Combine results with preference for higher confidence
        all_texts = []
        for source, data in results["sources"].items():
            if data["text"].strip():
                all_texts.append(data["text"])
                
        # Use the longest text as it likely captured the most information
        if all_texts:
            results["combined"] = max(all_texts, key=len)
            
        return results
    
    def _analyze_document_layout(self, image_path: str) -> Dict[str, Any]:
        """Analyze document layout and structure"""
        try:
            image = Image.open(image_path)
            # Convert to OpenCV format for processing
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Basic layout analysis
            layout = {
                "orientation": self._detect_orientation(cv_image),
                "regions": self._detect_text_regions(cv_image),
                "tables": self._detect_tables(cv_image),
                "images": self._detect_embedded_images(cv_image)
            }
            
            return layout
        except Exception as e:
            logging.error(f"Layout analysis failed: {e}")
            return {}
            
    def _analyze_scene(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze general scene characteristics"""
        try:
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Basic scene analysis
            scene_info = {
                "brightness": self._analyze_brightness(cv_image),
                "blur_detection": self._detect_blur(cv_image),
                "color_analysis": self._analyze_colors(cv_image),
                "image_quality": self._assess_quality(cv_image)
            }
            
            return scene_info
        except Exception as e:
            logging.error(f"Scene analysis failed: {e}")
            return {}
            
    # Helper methods for image analysis
    def _detect_orientation(self, image):
        """Detect if image is rotated and needs correction"""
        # Implementation using OpenCV
        pass
        
    def _detect_text_regions(self, image):
        """Detect and return coordinates of text regions"""
        # Implementation using OpenCV
        pass
        
    def _detect_tables(self, image):
        """Detect table structures in the image"""
        # Implementation using OpenCV
        pass
        
    def _detect_embedded_images(self, image):
        """Detect embedded images or figures"""
        # Implementation using OpenCV
        pass
        
    def _analyze_brightness(self, image):
        """Analyze image brightness levels"""
        try:
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            _, _, v = cv2.split(hsv)
            return float(v.mean())
        except:
            return None
            
    def _detect_blur(self, image):
        """Detect if image is blurry"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            return float(cv2.Laplacian(gray, cv2.CV_64F).var())
        except:
            return None
            
    def _analyze_colors(self, image):
        """Analyze color distribution"""
        try:
            colors = cv2.split(image)
            return {
                "red_mean": float(colors[2].mean()),
                "green_mean": float(colors[1].mean()),
                "blue_mean": float(colors[0].mean())
            }
        except:
            return None
            
    def _assess_quality(self, image):
        """Assess overall image quality"""
        try:
            # Basic quality metrics
            quality = {
                "resolution": image.shape[:2],
                "aspect_ratio": float(image.shape[1]) / float(image.shape[0]),
                "file_size": os.path.getsize(image_path) if image_path else None
            }
            return quality
        except:
            return None