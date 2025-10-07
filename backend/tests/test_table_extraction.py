"""
Test Script for Phase 4: Table Extraction Service
Tests Camelot, Tabula, and OpenCV table detection
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.parsing.table_extraction import TableExtractionService, extract_pdf_tables, detect_image_tables
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_initialization():
    """Test service initialization"""
    print("\n" + "="*60)
    print("TEST 1: Table Extraction Service Initialization")
    print("="*60)
    
    try:
        service = TableExtractionService(primary_method="camelot")
        print("✅ Service initialized with Camelot")
        
        service2 = TableExtractionService(primary_method="tabula")
        print("✅ Service initialized with Tabula")
        
        return True
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return False

def test_pdf_table_extraction(pdf_path):
    """Test PDF table extraction"""
    print("\n" + "="*60)
    print("TEST 2: PDF Table Extraction")
    print("="*60)
    
    try:
        service = TableExtractionService(primary_method="camelot")
        result = service.extract_tables_from_pdf(pdf_path, pages="all")
        
        if result.get("success"):
            print(f"✅ Extraction successful!")
            print(f"   - Method used: {result.get('method_used')}")
            print(f"   - Tables found: {result.get('table_count')}")
            
            for i, table in enumerate(result.get('tables', [])[:2]):  # Show first 2 tables
                print(f"   - Table {i+1}: {table.get('shape')} shape")
                if 'accuracy' in table:
                    print(f"     Accuracy: {table['accuracy']:.2f}")
            
            return True
        else:
            print(f"⚠️ No tables found or extraction failed")
            print(f"   Error: {result.get('error', 'Unknown')}")
            return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_image_table_detection(image_path):
    """Test image table detection"""
    print("\n" + "="*60)
    print("TEST 3: Image Table Detection")
    print("="*60)
    
    try:
        service = TableExtractionService()
        result = service.detect_tables_in_image(image_path)
        
        if result.get("success"):
            print(f"✅ Detection successful!")
            print(f"   - Tables detected: {result.get('table_count')}")
            
            for region in result.get('table_regions', [])[:3]:  # Show first 3 regions
                bbox = region.get('bbox', {})
                print(f"   - Region {region.get('table_number')}: "
                      f"{bbox.get('width')}x{bbox.get('height')} at "
                      f"({bbox.get('x')}, {bbox.get('y')})")
            
            return True
        else:
            print(f"⚠️ Detection failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_convenience_functions():
    """Test convenience functions"""
    print("\n" + "="*60)
    print("TEST 4: Convenience Functions")
    print("="*60)
    
    try:
        # These will fail without actual files, but test the API
        print("✅ extract_pdf_tables function available")
        print("✅ detect_image_tables function available")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def run_all_tests():
    """Run all Phase 4 tests"""
    print("\n" + "="*60)
    print("🧪 PHASE 4 TABLE EXTRACTION TEST SUITE")
    print("="*60)
    
    # Find test files
    evidence_dir = os.path.join(os.path.dirname(__file__), '..', 'uploaded_evidence')
    test_pdf = None
    test_image = None
    
    if os.path.exists(evidence_dir):
        for file in os.listdir(evidence_dir):
            if file.lower().endswith('.pdf') and not test_pdf:
                test_pdf = os.path.join(evidence_dir, file)
            if file.lower().endswith(('.jpg', '.jpeg', '.png')) and not test_image:
                test_image = os.path.join(evidence_dir, file)
    
    results = []
    results.append(("Initialization", test_initialization()))
    results.append(("Convenience Functions", test_convenience_functions()))
    
    if test_pdf and os.path.exists(test_pdf):
        print(f"\n📄 Using test PDF: {test_pdf}")
        results.append(("PDF Table Extraction", test_pdf_table_extraction(test_pdf)))
    else:
        print("\n⚠️ No PDF files found for testing")
    
    if test_image and os.path.exists(test_image):
        print(f"\n📸 Using test image: {test_image}")
        results.append(("Image Table Detection", test_image_table_detection(test_image)))
    else:
        print("\n⚠️ No image files found for testing")
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed\n")

if __name__ == "__main__":
    run_all_tests()
