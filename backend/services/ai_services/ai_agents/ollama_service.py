
import requests
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
import os

class OllamaService:
    """Service for interacting with local Ollama models"""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.models = {
            "fast": "gemma:2b",                    # Fast responses
            "reasoning": "mistral:7b",             # Complex reasoning
            "vision": "llava:7b",                  # Vision model for image processing
            "indian_law": "kartikm7/indian-lawen2-1.5b:latest"  # Indian law specific model
        }
        self.default_model = "reasoning"
    
    def is_available(self) -> bool:
        """Check if Ollama service is running"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
            return []
        except:
            return []
    
    def generate_response(self, 
                         prompt: str, 
                         model_type: str = "reasoning",
                         system_prompt: str = None,
                         temperature: float = 0.7,
                         max_tokens: int = 1000) -> Optional[str]:
        """Generate response using specified model"""
        
        model_name = self.models.get(model_type, self.models[self.default_model])
        
        # Build the full prompt
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"
        
        try:
            payload = {
                "model": model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "top_p": 0.9,
                    "top_k": 40
                }
            }
            
            print(f"🤖 Using {model_name} for generation...")
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120  # 2 minutes timeout for complex reasoning
            )
            
            generation_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "").strip()
                
                print(f"✅ Generated in {generation_time:.2f}s ({len(generated_text)} chars)")
                return generated_text
            else:
                print(f"❌ Ollama error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"⏰ Ollama timeout after 2 minutes")
            return None
        except Exception as e:
            print(f"❌ Ollama generation error: {e}")
            return None
    
    def generate_legal_argument(self, 
                               role: str,
                               case_data: Dict[str, Any],
                               evidence: List[Dict[str, Any]],
                               context: str = "") -> Optional[str]:
        """Generate legal argument for specific role"""
        
        system_prompt = f"""You are an expert {role} in an Indian courtroom simulation. 
        You have deep knowledge of IPC, CrPC, and Indian Constitution.
        Generate realistic, professional legal arguments based on the evidence provided.
        Reference specific legal sections when applicable."""
        
        # Build context
        case_summary = f"Case: {case_data.get('title', 'Unknown Case')}\n"
        case_summary += f"Type: {case_data.get('case_type', 'Criminal')}\n"
        case_summary += f"Description: {case_data.get('description', '')}\n"
        
        evidence_summary = "Evidence:\n"
        for i, ev in enumerate(evidence[:5], 1):  # Limit to 5 pieces for context
            evidence_summary += f"{i}. {ev.get('title', 'Evidence')}: {ev.get('description', '')}\n"
        
        prompt = f"""
        {case_summary}
        
        {evidence_summary}
        
        Context: {context}
        
        As the {role}, provide your argument:
        """
        
        # Use reasoning model for complex legal arguments
        return self.generate_response(
            prompt=prompt,
            model_type="reasoning",
            system_prompt=system_prompt,
            temperature=0.8,
            max_tokens=1500
        )
    
    def analyze_evidence(self, evidence: Dict[str, Any]) -> Optional[str]:
        """Analyze evidence using fast model"""

        system_prompt = """You are a legal evidence analyst.
        Analyze the provided evidence and summarize its key points,
        relevance, and potential legal implications."""

        prompt = f"""
        Evidence Title: {evidence.get('title', 'Unknown')}
        Evidence Type: {evidence.get('type', 'Unknown')}
        Description: {evidence.get('description', '')}
        Content: {evidence.get('content', '')[:1000]}  # Limit content

        Provide a concise analysis of this evidence:
        """

        # Use fast model for evidence analysis
        return self.generate_response(
            prompt=prompt,
            model_type="fast",
            system_prompt=system_prompt,
            temperature=0.6,
            max_tokens=800
        )

    def process_image(self, image_path: str, prompt: str = "Extract all visible text from this image. Return only the text content without any additional commentary.") -> Optional[str]:
        """Process image using LLaVA vision model for OCR or description"""

        try:
            import base64
            from PIL import Image

            # Optimize image size for faster processing
            img = Image.open(image_path)
            max_size = 800  # Reduce from default for faster processing
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                
                # Save optimized image temporarily
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    img.save(temp_file.name, format='PNG', optimize=True)
                    optimized_path = temp_file.name
            else:
                optimized_path = image_path

            # Read and encode image
            with open(optimized_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')

            # Clean up temp file if created
            if optimized_path != image_path:
                os.unlink(optimized_path)

            payload = {
                "model": self.models["vision"],
                "prompt": prompt,
                "images": [image_data],
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for accurate OCR
                    "num_predict": 800,  # Reduced for faster processing
                    "top_p": 0.9,
                    "top_k": 40
                }
            }

            print(f"🖼️ Processing image with LLaVA: {os.path.basename(image_path)}")
            start_time = time.time()

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120  # Increased to 2 minutes for better reliability
            )

            processing_time = time.time() - start_time

            if response.status_code == 200:
                result = response.json()
                extracted_text = result.get("response", "").strip()

                print(f"✅ LLaVA processed in {processing_time:.2f}s ({len(extracted_text)} chars)")
                return extracted_text
            else:
                print(f"❌ LLaVA error: {response.status_code} - {response.text}")
                return None

        except requests.exceptions.Timeout:
            print(f"⏰ LLaVA timeout after 2 minutes for {os.path.basename(image_path)}")
            return None
        except Exception as e:
            print(f"❌ LLaVA image processing error: {e}")
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check"""
        health_status = {
            "service_available": False,
            "models_available": [],
            "models_configured": self.models,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            # Check service
            health_status["service_available"] = self.is_available()
            
            if health_status["service_available"]:
                # Check models
                available_models = self.get_available_models()
                health_status["models_available"] = available_models
                
                # Test each configured model
                for model_type, model_name in self.models.items():
                    if model_name in available_models:
                        test_response = self.generate_response(
                            "Hello", 
                            model_type=model_type,
                            max_tokens=50
                        )
                        health_status[f"{model_type}_working"] = test_response is not None
                    else:
                        health_status[f"{model_type}_working"] = False
            
            return health_status
            
        except Exception as e:
            health_status["error"] = str(e)
            return health_status

# Global instance
ollama_service = OllamaService()
