import sys
import os
sys.path.insert(0, '.')

from services.ai_services.vision_service import VisionService

# Test BLIP initialization
print("Initializing VisionService...")
vision = VisionService(use_blip2=True)
print("VisionService initialized successfully")

# Try to init BLIP
print("Loading BLIP-2 model...")
if vision._init_blip2_model():
    print("✅ BLIP-2 model loaded successfully")
else:
    print("❌ BLIP-2 model failed to load")
