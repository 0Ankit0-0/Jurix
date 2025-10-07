import google.generativeai as genai
import os
import json
from datetime import datetime
import time
import logging
import base64

class GeminiService:
    def __init__(self):
        """Initialize Gemini service with proper model detection and API testing"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.model_name = None
        
        if not self.api_key:
            print("❌ GEMINI_API_KEY not found in environment variables")
            print("💡 Please set your Gemini API key in the .env file")
            return
        
        # Configure Gemini API
        try:
            genai.configure(api_key=self.api_key)
            print("🔧 Gemini API configured")
        except Exception as e:
            print(f"❌ Failed to configure Gemini API: {e}")
            return
        
        # Test API key and find working model
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize and test Gemini model with fallbacks"""
        # Updated model names for 2024
        model_candidates = [
            "gemini-2.5-pro",           # Latest Pro (reasoning heavy)
            "gemini-2.5-flash",         # Latest Flash (fast + balanced)
            "gemini-2.5-flash-lite",    # Lightweight, cheapest for scale
            "gemini-2.0-flash-lite",    # Lightweight, cheapest for scale
            "gemini-2.0-flash",         # Previous stable Flash
            "gemini-1.5-pro",           # 1.5 Pro model
            "gemini-1.5-flash",         # 1.5 Flash model
            "gemini-1.0-pro",           # Legacy 1.0 Pro
            "gemini-pro",               # Legacy generic Pro alias
            "gemini-flash",             # Legacy generic Flash alias
            "text-bison-001",           # PaLM 2 fallback
        ]

        
        print("🔍 Testing Gemini API connection and models...")
        
        for model_name in model_candidates:
            try:
                print(f"   Testing model: {model_name}")
                
                # Try to create model instance
                test_model = genai.GenerativeModel(model_name)
                
                # Test with a simple prompt
                test_response = test_model.generate_content(
                    "Say 'Hello, Gemini is working!' in exactly 5 words.",
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=20,
                        temperature=0.1,
                    )
                )
                
                # Handle both simple and multi-part responses
                try:
                    if test_response.candidates:
                        parts = test_response.candidates[0].content.parts
                        result = ""
                        for part in parts:
                            if hasattr(part, 'text'):
                                result += part.text
                        if result:
                            print(f"   ✅ Model {model_name} is working!")
                            print(f"   🤖 Test response: {result.strip()}")
                            self.model = test_model
                            self.model_name = model_name
                            return True
                    else:
                        print(f"   ⚠️ Model {model_name} returned no candidates")
                        continue
                except AttributeError:
                    # Fallback for simple responses
                    if test_response.text:
                        print(f"   ✅ Model {model_name} is working!")
                        print(f"   🤖 Test response: {test_response.text.strip()}")
                        self.model = test_model
                        self.model_name = model_name
                        return True
                    
            except Exception as e:
                print(f"   ❌ Model {model_name} failed: {e}")
                continue
        
        print("❌ No working Gemini model found!")
        print("💡 Possible issues:")
        print("   • API key is invalid or expired")
        print("   • Billing is not set up on your Google Cloud account")
        print("   • API is not enabled in Google Cloud Console")
        print("   • Network connectivity issues")
        
        return False
    
    def is_available(self):
        """Check if Gemini service is available"""
        return self.model is not None
    
    def test_connection(self):
        """Comprehensive API connection test"""
        print("🧪 Running Gemini API Connection Test...")
        print("=" * 50)
        
        # Test 1: API Key
        if not self.api_key:
            print("❌ Test 1: API Key - FAILED (not found)")
            return False
        
        print(f"✅ Test 1: API Key - PASSED ({self.api_key[:10]}...)")
        
        # Test 2: API Configuration
        try:
            genai.configure(api_key=self.api_key)
            print("✅ Test 2: API Configuration - PASSED")
        except Exception as e:
            print(f"❌ Test 2: API Configuration - FAILED ({e})")
            return False
        
        # Test 3: List Available Models
        try:
            print("🔍 Test 3: Listing available models...")
            models = list(genai.list_models())
            
            if models:
                print("✅ Test 3: Model Listing - PASSED")
                print("📋 Available models:")
                for model in models[:5]:  # Show first 5
                    print(f"   • {model.name}")
                if len(models) > 5:
                    print(f"   ... and {len(models) - 5} more")
            else:
                print("⚠️ Test 3: Model Listing - No models found")
                
        except Exception as e:
            print(f"❌ Test 3: Model Listing - FAILED ({e})")
        
        # Test 4: Model Initialization
        if not self.model:
            print("❌ Test 4: Model Initialization - FAILED")
            return False
        
        print(f"✅ Test 4: Model Initialization - PASSED ({self.model_name})")
        
        # Test 5: Content Generation
        try:
            test_prompt = "Explain what a legal contract is in one sentence."
            response = self.generate_response(test_prompt, max_tokens=50)
            
            if response and len(response.strip()) > 10:
                print("✅ Test 5: Content Generation - PASSED")
                print(f"   📝 Sample response: {response.strip()[:100]}...")
            else:
                print("❌ Test 5: Content Generation - FAILED (empty response)")
                return False
                
        except Exception as e:
            print(f"❌ Test 5: Content Generation - FAILED ({e})")
            return False
        
        print("\n🎉 All Gemini API tests passed! Service is ready.")
        return True
    
    def generate_response(self, prompt, max_tokens=1000, temperature=0.7):
        """Generate response using Gemini with enhanced error handling"""
        if not self.is_available():
            print("❌ Gemini service not available")
            return None
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.8,
                    top_k=40,
                )
            )
            
            # Handle both simple and multi-part responses
            try:
                if response.candidates:
                    # Get the first candidate's parts
                    parts = response.candidates[0].content.parts
                    # Combine all text parts
                    result = ""
                    for part in parts:
                        if hasattr(part, 'text'):
                            result += part.text
                    return result.strip()
                else:
                    print("⚠️ Gemini returned no candidates")
                    return None
            except AttributeError:
                # Fallback for simple responses
                try:
                    return response.text.strip()
                except:
                    print("⚠️ Gemini returned unhandled response format")
                    return None
                
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            
            # Provide specific error guidance
            error_str = str(e).lower()
            if 'quota' in error_str or 'limit' in error_str:
                print("💡 Suggestion: You've hit API quota limits. Check your billing or wait.")
            elif 'auth' in error_str or 'key' in error_str:
                print("💡 Suggestion: Check your API key is valid and has proper permissions.")
            elif 'model' in error_str:
                print("💡 Suggestion: The model might not be available. Try reinitializing.")
            elif 'network' in error_str or 'connection' in error_str:
                print("💡 Suggestion: Check your internet connection.")
            
            return None
    
    def analyze_evidence(self, evidence_text, case_context):
        """Analyze evidence using AI with better prompting"""
        if not self.is_available():
            return "Gemini service not available. Using fallback analysis."
        
        prompt = f"""
        As a legal expert, analyze this evidence for a court case.
        
        **CASE CONTEXT:**
        {case_context}
        
        **EVIDENCE TO ANALYZE:**
        {evidence_text[:2000]}  # Limit evidence text
        
        **ANALYSIS REQUIRED:**
        Please provide a structured analysis:
        
        1. **Key Facts**: What are the main factual points?
        2. **Legal Relevance**: How does this relate to the case?
        3. **Evidence Strength** (1-10 scale): Rate the strength
        4. **Potential Issues**: Any admissibility or credibility concerns?
        5. **Strategic Value**: How useful is this for the case?
        
        Keep your response concise and professional. Focus on the most important aspects.
        """
        
        return self.generate_response(prompt, max_tokens=800, temperature=0.3)
    
    def generate_legal_argument(self, role, case_data, evidence_summary):
        """Generate legal argument based on role with enhanced prompts"""
        if not self.is_available():
            return f"Gemini service not available. {role.title()} argument would be generated here."
        
        # Enhanced prompts for each role
        role_prompts = {
            'prosecutor': f"""
            You are an experienced prosecutor presenting a case in court.
            
            **CASE:** {case_data.get('title', 'Criminal Case')}
            **CASE TYPE:** {case_data.get('case_type', 'criminal')}
            **EVIDENCE AVAILABLE:** {evidence_summary}
            
            Present a strong, professional opening statement that:
            1. Clearly states the charges
            2. Outlines what you will prove
            3. References the key evidence
            4. Maintains ethical standards
            
            Be persuasive but fair. Keep it under 200 words.
            """,
            
            'defense': f"""
            You are a skilled defense attorney protecting your client's rights.
            
            **CASE:** {case_data.get('title', 'Legal Case')}
            **CLIENT:** {case_data.get('parties', {}).get('defendant', 'Defendant')}
            **PROSECUTION EVIDENCE:** {evidence_summary}
            
            Present a strong defense opening that:
            1. Challenges the prosecution's burden of proof
            2. Points out weaknesses in the evidence
            3. Creates reasonable doubt where appropriate
            4. Protects your client's constitutional rights
            
            Be vigorous but professional. Keep it under 200 words.
            """,
            
            'judge': f"""
            You are an impartial judge overseeing a court proceeding.
            
            **CASE:** {case_data.get('title', 'Court Case')}
            **CASE TYPE:** {case_data.get('case_type', 'legal matter')}
            **EVIDENCE PRESENTED:** {evidence_summary}
            
            Provide a judicial analysis that:
            1. Reviews the evidence objectively
            2. Applies relevant legal standards
            3. Considers both sides fairly
            4. Explains your reasoning clearly
            
            Be impartial and thorough. Follow proper judicial procedure.
            """
        }
        
        prompt = role_prompts.get(role, f"Analyze this case from a legal perspective: {case_data}")
        
        return self.generate_response(prompt, max_tokens=1200, temperature=0.4)
    
    def extract_text_from_image(self, image_path, task_type="text_extraction"):
        """Extract text and visual information from an image using Gemini Vision
        
        Args:
            image_path: Path to the image file
            task_type: Type of analysis - "text_extraction", "scene_description", or "evidence_analysis"
        """
        prompts = {
            "text_extraction": """Analyze this image and extract:
1. All visible text (including handwritten)
2. Any numbers, dates, or identifiers
3. Text from forms, documents, or signs
Return only the extracted text, maintaining its original structure.""",
            
            "scene_description": """Describe this image in detail, focusing on:
1. Physical scene and environment
2. People and their activities
3. Objects and their relationships
4. Any visible text or signage
5. Time of day and lighting conditions
Provide a clear, factual description for legal evidence purposes.""",
            
            "evidence_analysis": """Analyze this image as legal evidence:
1. Document visible text and markings
2. Describe physical characteristics and condition
3. Note any timestamps or identifying features
4. Identify potential evidence value
5. Flag any signs of tampering or alteration
Maintain objectivity and detail for court admissibility."""
        }
        
        prompt = prompts.get(task_type, prompts["text_extraction"])
        if not self.is_available():
            return None

        try:
            # Read and encode image
            with open(image_path, 'rb') as img_file:
                image_data = img_file.read()

            # Create image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",  # Assume JPEG, could detect
                "data": base64.b64encode(image_data).decode('utf-8')
            }

            # Generate content with image
            response = self.model.generate_content(
                [prompt, image_part],
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=1000,
                    temperature=0.1,
                )
            )

            if response and response.text:
                return response.text.strip()
            else:
                logging.warning("Gemini vision returned empty response")
                return None

        except Exception as e:
            logging.error(f"Gemini vision text extraction error: {e}")
            return None

    def extract_text_from_pdf_page(self, page_image_data, prompt="Extract all visible text from this document page. Return only the text content without any additional commentary."):
        """Extract text from PDF page image using Gemini Vision"""
        if not self.is_available():
            return None

        try:
            # Create image part for Gemini
            image_part = {
                "mime_type": "image/png",  # PDF pages as PNG
                "data": base64.b64encode(page_image_data).decode('utf-8')
            }

            # Generate content with image
            response = self.model.generate_content(
                [prompt, image_part],
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=1500,
                    temperature=0.1,
                )
            )

            if response and response.text:
                return response.text.strip()
            else:
                logging.warning("Gemini vision returned empty response for PDF page")
                return None

        except Exception as e:
            logging.error(f"Gemini vision PDF text extraction error: {e}")
            return None

    def get_service_info(self):
        """Get information about the current service status"""
        return {
            'service_name': 'Gemini AI Service',
            'api_key_configured': bool(self.api_key),
            'model_available': self.is_available(),
            'current_model': self.model_name,
            'status': 'Ready' if self.is_available() else 'Not Available',
            'last_tested': datetime.utcnow().isoformat()
        }

# Test function
def test_gemini_service():
    """Test the Gemini service thoroughly"""
    print("🧪 Testing Gemini Service...")
    print("=" * 60)
    
    # Initialize service
    service = GeminiService()
    
    # Run connection test
    if service.test_connection():
        print("\n✅ Gemini service is working correctly!")
        
        # Test evidence analysis
        print("\n🔍 Testing evidence analysis...")
        test_evidence = "The witness saw the defendant at the scene at 9:15 PM on January 15th."
        test_case = "Criminal case involving theft charges"
        
        analysis = service.analyze_evidence(test_evidence, test_case)
        if analysis:
            print(f"📋 Analysis result: {analysis[:200]}...")
        
        # Test legal argument generation  
        print("\n⚖️ Testing legal argument generation...")
        test_case_data = {
            'title': 'Test vs. Defendant',
            'case_type': 'criminal',
            'parties': {'defendant': 'Test Defendant'}
        }
        
        prosecutor_arg = service.generate_legal_argument('prosecutor', test_case_data, test_evidence)
        if prosecutor_arg:
            print(f"👨‍💼 Prosecutor argument: {prosecutor_arg[:150]}...")
        
        return True
    else:
        print("\n❌ Gemini service test failed!")
        print("\n🔧 Troubleshooting steps:")
        print("1. Check your .env file has GEMINI_API_KEY set")
        print("2. Verify your API key at https://makersuite.google.com/app/apikey")
        print("3. Ensure billing is enabled on your Google Cloud project")
        print("4. Check if the Gemini API is enabled in your project")
        
        return False

# Standalone API key tester
def quick_api_test():
    """Quick API key validation"""
    print("⚡ Quick Gemini API Key Test")
    print("=" * 30)
    
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ No API key found in environment")
        return False
    
    print(f"🔑 API Key: {api_key[:10]}..." + ("✅" if len(api_key) > 20 else "❌ Too short"))
    
    try:
        genai.configure(api_key=api_key)
        
        # Try to list models
        models = list(genai.list_models())
        print(f"📋 Available models: {len(models)}")
        
        if models:
            print("✅ API key is working!")
            return True
        else:
            print("❌ No models available - check billing/permissions")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run quick test first
    if quick_api_test():
        print("\n" + "="*60)
        # Run full test
        test_gemini_service()
    else:
        print("\n💡 Fix the API key issue first, then run the full test.")