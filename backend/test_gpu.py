import torch
import easyocr

print("PyTorch CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("CUDA version:", torch.version.cuda)
    print("GPU name:", torch.cuda.get_device_name(0))

# Test EasyOCR with GPU
try:
    reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())
    print("EasyOCR initialized with GPU:", torch.cuda.is_available())
except Exception as e:
    print("EasyOCR error:", e)

# Test BLIP if available
try:
    from transformers import Blip2Processor, Blip2ForConditionalGeneration
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("BLIP-2 device:", device)
    if torch.cuda.is_available():
        model = Blip2ForConditionalGeneration.from_pretrained("Salesforce/blip2-opt-2.7b")
        print("BLIP-2 model loaded on GPU")
except Exception as e:
    print("BLIP-2 error:", e)
