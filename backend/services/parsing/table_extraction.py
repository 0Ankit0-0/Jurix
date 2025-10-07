"""
Phase 4: Table Extraction Service
Implements Camelot and Tabula for extracting tables from PDFs and images
"""

import os
import logging
from typing import Dict, Any, Optional, List
import pandas as pd
from PIL import Image
import io

# Lazy imports for table extraction libraries
try:
    import camelot
    CAMELOT_AVAILABLE = True
except ImportError:
    CAMELOT_AVAILABLE = False
    logging.warning("⚠️ Camelot not available. Install with: pip install camelot-py[cv]")

try:
    import tabula
    TABULA_AVAILABLE = True
except ImportError:
    TABULA_AVAILABLE = False
    logging.warning("⚠️ Tabula not available. Install with: pip install tabula-py")

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logging.warning("⚠️ OpenCV not available for image-based table detection")


class TableExtractionService:
    """
    Advanced table extraction from PDFs and images
    Supports: Camelot (digital PDFs), Tabula (complex tables), OpenCV (scanned documents)
    """
    
    def __init__(self, primary_method="camelot"):
        """
        Initialize Table Extraction Service
        
        Args:
            primary_method: Primary extraction method ("camelot", "tabula", "opencv")
        """
        self.primary_method = primary_method
        logging.info(f"📊 TableExtractionService initialized (primary={primary_method})")
    
    def extract_tables_from_pdf(self, pdf_path: str, pages: str = "all") -> Dict[str, Any]:
        """
        Extract tables from PDF document
        
        Args:
            pdf_path: Path to PDF file
            pages: Pages to extract from ("all", "1", "1-3", etc.)
            
        Returns:
            Dictionary with extracted tables and metadata
        """
        result = {
            "tables": [],
            "table_count": 0,
            "method_used": self.primary_method,
            "success": False,
            "pages_processed": pages
        }
        
        try:
            # Try primary method first
            if self.primary_method == "camelot" and CAMELOT_AVAILABLE:
                result = self._extract_with_camelot(pdf_path, pages)
            elif self.primary_method == "tabula" and TABULA_AVAILABLE:
                result = self._extract_with_tabula(pdf_path, pages)
            
            # Fallback chain if primary fails
            if not result.get("success") or result.get("table_count", 0) == 0:
                logging.warning(f"⚠️ Primary method {self.primary_method} failed or found no tables, trying fallback...")
                
                # Try Tabula as fallback
                if self.primary_method != "tabula" and TABULA_AVAILABLE:
                    fallback_result = self._extract_with_tabula(pdf_path, pages)
                    if fallback_result.get("success") and fallback_result.get("table_count", 0) > 0:
                        result = fallback_result
                        result["method_used"] = "tabula (fallback)"
                
                # Try Camelot as fallback
                if (not result.get("success") or result.get("table_count", 0) == 0) and \
                   self.primary_method != "camelot" and CAMELOT_AVAILABLE:
                    fallback_result = self._extract_with_camelot(pdf_path, pages)
                    if fallback_result.get("success") and fallback_result.get("table_count", 0) > 0:
                        result = fallback_result
                        result["method_used"] = "camelot (fallback)"
            
        except Exception as e:
            result["error"] = str(e)
            logging.error(f"❌ Table extraction from PDF failed: {e}")
        
        return result
    
    def _extract_with_camelot(self, pdf_path: str, pages: str) -> Dict[str, Any]:
        """Extract tables using Camelot (best for digital PDFs)"""
        if not CAMELOT_AVAILABLE:
            return {"success": False, "error": "Camelot not available"}
        
        try:
            logging.info(f"🔄 Extracting tables with Camelot from pages: {pages}")
            
            # Try lattice method first (for tables with lines)
            tables = camelot.read_pdf(pdf_path, pages=pages, flavor='lattice')
            
            # If no tables found, try stream method (for tables without lines)
            if len(tables) == 0:
                logging.info("⚠️ No tables found with lattice, trying stream method...")
                tables = camelot.read_pdf(pdf_path, pages=pages, flavor='stream')
            
            extracted_tables = []
            for i, table in enumerate(tables):
                table_data = {
                    "table_number": i + 1,
                    "page": table.page,
                    "accuracy": table.accuracy,
                    "data": table.df.to_dict('records'),
                    "shape": table.df.shape,
                    "csv": table.df.to_csv(index=False),
                    "html": table.df.to_html(index=False)
                }
                extracted_tables.append(table_data)
            
            logging.info(f"✅ Camelot extracted {len(extracted_tables)} tables")
            
            return {
                "success": True,
                "tables": extracted_tables,
                "table_count": len(extracted_tables),
                "method_used": "camelot"
            }
            
        except Exception as e:
            logging.error(f"❌ Camelot extraction failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_with_tabula(self, pdf_path: str, pages: str) -> Dict[str, Any]:
        """Extract tables using Tabula (good for complex tables)"""
        if not TABULA_AVAILABLE:
            return {"success": False, "error": "Tabula not available"}
        
        try:
            logging.info(f"🔄 Extracting tables with Tabula from pages: {pages}")
            
            # Convert pages parameter
            pages_param = pages if pages != "all" else None
            
            # Extract tables
            tables = tabula.read_pdf(
                pdf_path,
                pages=pages_param,
                multiple_tables=True,
                pandas_options={'header': None}
            )
            
            extracted_tables = []
            for i, df in enumerate(tables):
                if not df.empty:
                    table_data = {
                        "table_number": i + 1,
                        "data": df.to_dict('records'),
                        "shape": df.shape,
                        "csv": df.to_csv(index=False),
                        "html": df.to_html(index=False)
                    }
                    extracted_tables.append(table_data)
            
            logging.info(f"✅ Tabula extracted {len(extracted_tables)} tables")
            
            return {
                "success": True,
                "tables": extracted_tables,
                "table_count": len(extracted_tables),
                "method_used": "tabula"
            }
            
        except Exception as e:
            logging.error(f"❌ Tabula extraction failed: {e}")
            return {"success": False, "error": str(e)}
    
    def detect_tables_in_image(self, image_path: str) -> Dict[str, Any]:
        """
        Detect table regions in scanned document images using OpenCV
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with detected table regions
        """
        if not CV2_AVAILABLE:
            return {"success": False, "error": "OpenCV not available"}
        
        result = {
            "tables_detected": False,
            "table_regions": [],
            "table_count": 0,
            "success": False
        }
        
        try:
            logging.info(f"🔍 Detecting tables in image: {image_path}")
            
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                return {"success": False, "error": "Failed to read image"}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
            
            # Detect horizontal and vertical lines
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
            vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
            
            horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
            vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
            
            # Combine lines
            table_mask = cv2.addWeighted(horizontal_lines, 0.5, vertical_lines, 0.5, 0.0)
            
            # Find contours
            contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter and extract table regions
            table_regions = []
            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filter by size (must be reasonably large)
                if w > 100 and h > 100:
                    table_regions.append({
                        "table_number": i + 1,
                        "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                        "area": int(w * h)
                    })
            
            result["tables_detected"] = len(table_regions) > 0
            result["table_regions"] = table_regions
            result["table_count"] = len(table_regions)
            result["success"] = True
            
            logging.info(f"✅ Detected {len(table_regions)} table regions in image")
            
        except Exception as e:
            result["error"] = str(e)
            logging.error(f"❌ Table detection in image failed: {e}")
        
        return result
    
    def extract_table_from_region(self, image_path: str, bbox: Dict[str, int]) -> Dict[str, Any]:
        """
        Extract table data from specific region in image
        
        Args:
            image_path: Path to image file
            bbox: Bounding box {"x": int, "y": int, "width": int, "height": int}
            
        Returns:
            Dictionary with extracted table data
        """
        result = {
            "success": False,
            "data": [],
            "text": ""
        }
        
        try:
            # Crop image to table region
            image = Image.open(image_path)
            x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
            table_image = image.crop((x, y, x + w, y + h))
            
            # Save cropped image temporarily
            temp_path = "temp_table_region.png"
            table_image.save(temp_path)
            
            # Use OCR or other methods to extract text from table region
            # This is a placeholder - integrate with OCR service
            result["success"] = True
            result["text"] = "Table region extracted (OCR integration needed)"
            
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
        except Exception as e:
            result["error"] = str(e)
            logging.error(f"❌ Table extraction from region failed: {e}")
        
        return result
    
    def convert_table_to_formats(self, table_data: pd.DataFrame) -> Dict[str, str]:
        """
        Convert table data to various formats
        
        Args:
            table_data: Pandas DataFrame with table data
            
        Returns:
            Dictionary with different format representations
        """
        formats = {}
        
        try:
            # CSV format
            formats["csv"] = table_data.to_csv(index=False)
            
            # JSON format
            formats["json"] = table_data.to_json(orient='records')
            
            # HTML format
            formats["html"] = table_data.to_html(index=False)
            
            # Markdown format
            formats["markdown"] = table_data.to_markdown(index=False)
            
            # Plain text
            formats["text"] = table_data.to_string(index=False)
            
        except Exception as e:
            logging.error(f"❌ Format conversion failed: {e}")
        
        return formats
    
    def merge_tables(self, tables: List[pd.DataFrame], merge_type: str = "vertical") -> pd.DataFrame:
        """
        Merge multiple tables
        
        Args:
            tables: List of DataFrames to merge
            merge_type: "vertical" (stack) or "horizontal" (side by side)
            
        Returns:
            Merged DataFrame
        """
        try:
            if merge_type == "vertical":
                return pd.concat(tables, axis=0, ignore_index=True)
            elif merge_type == "horizontal":
                return pd.concat(tables, axis=1)
            else:
                logging.warning(f"⚠️ Unknown merge type: {merge_type}, using vertical")
                return pd.concat(tables, axis=0, ignore_index=True)
        except Exception as e:
            logging.error(f"❌ Table merge failed: {e}")
            return pd.DataFrame()


# Convenience functions
def extract_pdf_tables(pdf_path: str, pages: str = "all", method: str = "camelot") -> Dict[str, Any]:
    """
    Extract tables from PDF
    
    Args:
        pdf_path: Path to PDF file
        pages: Pages to extract from
        method: Extraction method ("camelot" or "tabula")
        
    Returns:
        Extracted tables
    """
    service = TableExtractionService(primary_method=method)
    return service.extract_tables_from_pdf(pdf_path, pages)


def detect_image_tables(image_path: str) -> Dict[str, Any]:
    """
    Detect tables in image
    
    Args:
        image_path: Path to image file
        
    Returns:
        Detected table regions
    """
    service = TableExtractionService()
    return service.detect_tables_in_image(image_path)
