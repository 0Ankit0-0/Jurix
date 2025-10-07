"""
Test Script for Phase 2: Vision Service with BLIP-2
Tests image captioning and scene analysis functionality
"""

import os
import sys
import time
import logging

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.ai_services.vision_service import VisionService
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def create_test_image(filename="test_image.jpg", size=(800, 600)):
    """Create a simple test image if no real images available"""
    try:
        # Create a gradient image with text
        img_array = np.zeros((size[1], size[0], 3), dtype=np.uint8)
        
        # Add gradient
        for i in range(size[1]):
            img_array[i, :] = [int(255 * i / size[1]), 100, 200]
        
        # Save image
        img = Image.fromarray(img_array)
        img.save(filename)
        logging.info(f"✅ Created test image: {filename}")
        return filename
    except Exception as e:
        logging.error(f"❌ Failed to create test image: {e}")
        return None

def test_vision_service_initialization():
    """Test 1: Vision Service Initialization"""
    print("\n" + "="*60)
    print("TEST 1: Vision Service Initialization")
    print("="*60)
    
    try:
        vision = VisionService(use_low_res=True, max_image_size=512)
        print("✅ VisionService initialized successfully")
        print(f"   - Low resolution mode: {vision.use_low_res}")
        print(f"   - Max image size: {vision.max_image_size}")
        return True
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return False

def test_caption_generation(image_path):
    """Test 2: Basic Caption Generation"""
    print("\n" + "="*60)
    print("TEST 2: Basic Caption Generation")
    print("="*60)
    
    try:
        vision = VisionService(use_low_res=True, max_image_size=512)
        
        print(f"📸 Processing image: {image_path}")
        start_time = time.time()
        
        result = vision.generate_caption(image_path)
        
        elapsed = time.time() - start_time
        
        if result.get('success'):
            print(f"✅ Caption generated successfully!")
            print(f"   - Caption: {result['caption']}")
            print(f"   - Processing time: {result['processing_time']:.2f}s")
            print(f"   - Total time: {elapsed:.2f}s")
            print(f"   - Model: {result['model']}")
            
            if result.get('metadata'):
                print(f"   - Metadata: {result['metadata']}")
            
            # Check if within target time
            if result['processing_time'] <= 30:
                print(f"   ✅ Within 20-30s target!")
            else:
                print(f"   ⚠️ Exceeded 30s target (acceptable for first run)")
            
            return True
        else:
            print(f"❌ Caption generation failed")
            if 'error' in result:
                print(f"   Error: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_caption_with_prompt(image_path):
    """Test 3: Caption Generation with Custom Prompt"""
    print("\n" + "="*60)
    print("TEST 3: Caption Generation with Custom Prompt")
    print("="*60)
    
    try:
        vision = VisionService(use_low_res=True, max_image_size=512)
        
        prompt = "Describe this image in detail, focusing on any text or documents visible"
        print(f"📝 Using prompt: '{prompt}'")
        
        result = vision.generate_caption(image_path, prompt=prompt)
        
        if result.get('success'):
            print(f"✅ Caption with prompt generated!")
            print(f"   - Caption: {result['caption']}")
            print(f"   - Processing time: {result['processing_time']:.2f}s")
            return True
        else:
            print(f"❌ Caption generation with prompt failed")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_complete_processing(image_path):
    """Test 4: Complete Image Processing with Scene Analysis"""
    print("\n" + "="*60)
    print("TEST 4: Complete Image Processing with Scene Analysis")
    print("="*60)
    
    try:
        vision = VisionService(use_low_res=True, max_image_size=512)
        
        result = vision.process_image_with_caption(
            image_path,
            include_scene_analysis=True
        )
        
        if result.get('success'):
            print(f"✅ Complete processing successful!")
            print(f"   - Total time: {result['total_processing_time']:.2f}s")
            
            if 'caption' in result:
                print(f"   - Caption: {result['caption']['caption']}")
            
            if 'scene_analysis' in result:
                scene = result['scene_analysis']
                print(f"   - Scene Analysis:")
                print(f"     • Brightness: {scene.get('brightness', 'N/A')}")
                print(f"     • Blur score: {scene.get('blur_detection', 'N/A')}")
                if scene.get('color_analysis'):
                    colors = scene['color_analysis']
                    print(f"     • Colors: R={colors.get('red_mean', 0):.1f}, "
                          f"G={colors.get('green_mean', 0):.1f}, "
                          f"B={colors.get('blue_mean', 0):.1f}")
            
            return True
        else:
            print(f"❌ Complete processing failed")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_performance_different_sizes():
    """Test 5: Performance with Different Image Sizes"""
    print("\n" + "="*60)
    print("TEST 5: Performance with Different Image Sizes")
    print("="*60)
    
    sizes = [
        (256, 256, "Small"),
        (512, 512, "Medium"),
        (1024, 1024, "Large")
    ]
    
    results = []
    
    for width, height, label in sizes:
        try:
            # Create test image
            test_file = f"test_{label.lower()}.jpg"
            img_path = create_test_image(test_file, (width, height))
            
            if not img_path:
                continue
            
            vision = VisionService(use_low_res=True, max_image_size=512)
            result = vision.generate_caption(img_path)
            
            if result.get('success'):
                results.append({
                    'size': label,
                    'dimensions': f"{width}x{height}",
                    'time': result['processing_time']
                })
                print(f"✅ {label} ({width}x{height}): {result['processing_time']:.2f}s")
            
            # Cleanup
            if os.path.exists(test_file):
                os.remove(test_file)
                
        except Exception as e:
            print(f"❌ {label} test failed: {e}")
    
    if results:
        print(f"\n📊 Performance Summary:")
        for r in results:
            print(f"   {r['size']:8} {r['dimensions']:12} - {r['time']:.2f}s")
        return True
    return False

def run_all_tests():
    """Run all Phase 2 tests"""
    print("\n" + "="*60)
    print("🧪 PHASE 2 VISION SERVICE TEST SUITE")
    print("="*60)
    print("Testing BLIP-2 Image Captioning Implementation")
    print()
    
    # Check for test images
    test_images = []
    
    # Look for uploaded evidence images
    evidence_dir = os.path.join(os.path.dirname(__file__), '..', 'uploaded_evidence')
    if os.path.exists(evidence_dir):
        for file in os.listdir(evidence_dir):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                test_images.append(os.path.join(evidence_dir, file))
                break  # Use first image found
    
    # If no real images, create a test image
    if not test_images:
        print("⚠️ No test images found, creating synthetic test image...")
        test_img = create_test_image("test_synthetic.jpg")
        if test_img:
            test_images.append(test_img)
    
    if not test_images:
        print("❌ No test images available. Please add an image to test with.")
        return
    
    test_image = test_images[0]
    print(f"📸 Using test image: {test_image}\n")
    
    # Run tests
    results = []
    
    results.append(("Initialization", test_vision_service_initialization()))
    results.append(("Basic Caption", test_caption_generation(test_image)))
    results.append(("Caption with Prompt", test_caption_with_prompt(test_image)))
    results.append(("Complete Processing", test_complete_processing(test_image)))
    results.append(("Performance Test", test_performance_different_sizes()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("🎉 All tests passed! Phase 2 implementation is working correctly.")
    elif passed > 0:
        print("⚠️ Some tests passed. Review failures above.")
    else:
        print("❌ All tests failed. Check installation and dependencies.")
    
    # Cleanup synthetic test image
    if os.path.exists("test_synthetic.jpg"):
        os.remove("test_synthetic.jpg")

if __name__ == "__main__":
    run_all_tests()
