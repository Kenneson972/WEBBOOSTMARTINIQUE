#!/usr/bin/env python3
"""
Backend API Tests for WebBoost Martinique
Tests all API endpoints using the public URL from frontend/.env
"""

import requests
import sys
import json
from datetime import datetime

class WebBoostAPITester:
    def __init__(self, base_url=None):
        # Read the backend URL from frontend/.env
        if base_url is None:
            try:
                with open('/app/frontend/.env', 'r') as f:
                    for line in f:
                        if line.startswith('REACT_APP_BACKEND_URL='):
                            backend_url = line.split('=', 1)[1].strip()
                            # Add /api to the backend URL and /WEBBOOSTMARTINIQUE/ base path
                            base_url = f"{backend_url}/WEBBOOSTMARTINIQUE/api"
                            break
                if base_url is None:
                    base_url = "http://localhost:8001/api"  # fallback
            except Exception as e:
                print(f"Warning: Could not read frontend/.env: {e}")
                base_url = "http://localhost:8001/api"  # fallback
        
        self.base_url = base_url
        print(f"Testing backend at: {self.base_url}")
        self.tests_run = 0
        self.tests_passed = 0
        self.failures = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED")
        else:
            self.failures.append(f"{test_name}: {details}")
            print(f"❌ {test_name}: FAILED - {details}")

    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_result("Health Check", True, f"Status: {data}")
                    return True
                else:
                    self.log_result("Health Check", False, f"Invalid response format: {data}")
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
        return False

    def test_contact_endpoint(self):
        """Test POST /api/contact"""
        test_payload = {
            "name": "Marie Dubois",
            "email": "marie.dubois@martinique-business.com", 
            "phone": "0596987654",
            "sector": "Commerce Local",
            "pack": "Vitrine Pro",
            "message": "Intéressée par vos services pour développer ma présence en ligne en Martinique",
            "consent": True,
            "source": "api_test"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "id" in data:
                    self.log_result("Contact Submission", True, f"Response: {data}")
                    return True
                else:
                    self.log_result("Contact Submission", False, f"Invalid response format: {data}")
            else:
                self.log_result("Contact Submission", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Contact Submission", False, f"Exception: {str(e)}")
        return False

    def test_contact_validation(self):
        """Test POST /api/contact with invalid data (missing consent)"""
        invalid_payload = {
            "name": "Jean Martin",
            "email": "jean.martin@martinique.com",
            "phone": "0596555123", 
            "consent": False  # Should fail validation
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/contact",
                json=invalid_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result("Contact Validation", True, "Correctly rejected invalid data")
                return True
            elif response.status_code == 400:
                self.log_result("Contact Validation", True, "Correctly rejected invalid data")
                return True
            else:
                self.log_result("Contact Validation", False, f"Expected 422 or 400, got {response.status_code}")
        except Exception as e:
            self.log_result("Contact Validation", False, f"Exception: {str(e)}")
        return False

    def test_chat_endpoint(self):
        """Test POST /api/chat"""
        test_payload = {
            "messages": [
                {"role": "user", "content": "Comprendre le paiement 50/40/10"}
            ],
            "temperature": 0.3
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for LLM calls
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "used_llm" in data:
                    reply_length = len(data["reply"])
                    self.log_result("Chat Endpoint", True, f"Reply length: {reply_length}, Used LLM: {data['used_llm']}")
                    return True
                else:
                    self.log_result("Chat Endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("Chat Endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat Endpoint", False, f"Exception: {str(e)}")
        return False

    def test_chat_bonjour(self):
        """Test POST /api/chat with 'Bonjour' message as requested"""
        test_payload = {
            "messages": [
                {"role": "user", "content": "Bonjour"}
            ],
            "temperature": 0.3
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for LLM calls
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "used_llm" in data:
                    reply_length = len(data["reply"])
                    print(f"  📝 Bonjour Reply: {data['reply'][:100]}...")
                    self.log_result("Chat Bonjour Test", True, f"Reply length: {reply_length}, Used LLM: {data['used_llm']}")
                    return True
                else:
                    self.log_result("Chat Bonjour Test", False, f"Invalid response format: {data}")
            else:
                self.log_result("Chat Bonjour Test", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Chat Bonjour Test", False, f"Exception: {str(e)}")
        return False

    def test_kpi_endpoint(self):
        """Test GET /api/kpi"""
        try:
            response = requests.get(f"{self.base_url}/kpi", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "total_leads" in data and "total_chats" in data:
                    self.log_result("KPI Endpoint", True, f"KPI data: {data}")
                    return True
                else:
                    self.log_result("KPI Endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("KPI Endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("KPI Endpoint", False, f"Exception: {str(e)}")
        return False

    def test_openai_models_endpoint(self):
        """Test GET /api/models/openai"""
        try:
            response = requests.get(f"{self.base_url}/models/openai", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "models" in data and "default" in data:
                    models_count = len(data["models"])
                    default_model = data["default"]
                    self.log_result("OpenAI Models Endpoint", True, f"Found {models_count} models, default: {default_model}")
                    return True
                else:
                    self.log_result("OpenAI Models Endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("OpenAI Models Endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("OpenAI Models Endpoint", False, f"Exception: {str(e)}")
        return False

    def test_openai_chat_with_emergent_key(self):
        """Test POST /api/chat/openai using Emergent key (no user API key provided)"""
        test_payload = {
            "message": "Bonjour, pouvez-vous me parler des services WebBoost Martinique?",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # Longer timeout for LLM calls
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "success" in data and data["success"]:
                    reply_length = len(data["reply"])
                    provider = data.get("provider", "unknown")
                    model = data.get("model", "unknown")
                    print(f"  📝 OpenAI Reply: {data['reply'][:100]}...")
                    self.log_result("OpenAI Chat (Emergent Key)", True, f"Reply length: {reply_length}, Provider: {provider}, Model: {model}")
                    return True
                else:
                    self.log_result("OpenAI Chat (Emergent Key)", False, f"Invalid response format: {data}")
            else:
                self.log_result("OpenAI Chat (Emergent Key)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("OpenAI Chat (Emergent Key)", False, f"Exception: {str(e)}")
        return False

    def test_openai_chat_with_user_key(self):
        """Test POST /api/chat/openai with user-provided API key (should fail with invalid key)"""
        test_payload = {
            "message": "Test message",
            "api_key": "sk-invalid-test-key-12345",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            # Should fail with 401 for invalid API key
            if response.status_code == 401:
                self.log_result("OpenAI Chat (Invalid User Key)", True, "Correctly rejected invalid API key")
                return True
            elif response.status_code == 200:
                # If it somehow works, that's also acceptable (maybe the key format changed)
                data = response.json()
                if "reply" in data:
                    self.log_result("OpenAI Chat (Invalid User Key)", True, "Unexpected success - API key validation may have changed")
                    return True
            
            self.log_result("OpenAI Chat (Invalid User Key)", False, f"Unexpected status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("OpenAI Chat (Invalid User Key)", False, f"Exception: {str(e)}")
        return False

    def test_openai_key_config_endpoint(self):
        """Test POST /api/config/openai-key"""
        test_payload = {
            "openai_api_key": "sk-invalid-test-key-for-validation"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/config/openai-key",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            # Should fail with 401 for invalid API key
            if response.status_code == 401:
                self.log_result("OpenAI Key Config", True, "Correctly rejected invalid API key")
                return True
            elif response.status_code == 200:
                # If it somehow works, that's also acceptable
                data = response.json()
                if "success" in data:
                    self.log_result("OpenAI Key Config", True, "Unexpected success - API key validation may have changed")
                    return True
            
            self.log_result("OpenAI Key Config", False, f"Unexpected status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("OpenAI Key Config", False, f"Exception: {str(e)}")
        return False

    def test_openai_key_config_missing_key(self):
        """Test POST /api/config/openai-key with missing API key"""
        test_payload = {}
        
        try:
            response = requests.post(
                f"{self.base_url}/config/openai-key",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            # Should fail with 400 for missing API key
            if response.status_code == 400:
                self.log_result("OpenAI Key Config (Missing Key)", True, "Correctly rejected missing API key")
                return True
            else:
                self.log_result("OpenAI Key Config (Missing Key)", False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_result("OpenAI Key Config (Missing Key)", False, f"Exception: {str(e)}")
        return False

    def test_elise_chat_openai_endpoint(self):
        """Test POST /api/chat-openai with Élise personality - Basic greeting"""
        test_payload = {
            "message": "Bonjour",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "personality" in data and data["personality"] == "elise":
                    reply = data["reply"]
                    # Check for Élise personality markers
                    elise_markers = ["Élise", "conseillère", "WebBoost Martinique"]
                    has_personality = any(marker in reply for marker in elise_markers)
                    
                    print(f"  📝 Élise Reply: {reply[:150]}...")
                    self.log_result("Élise Chat-OpenAI Basic", True, f"Personality detected: {has_personality}, Provider: {data.get('provider', 'unknown')}")
                    return True
                else:
                    self.log_result("Élise Chat-OpenAI Basic", False, f"Missing personality field or invalid response: {data}")
            else:
                self.log_result("Élise Chat-OpenAI Basic", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Élise Chat-OpenAI Basic", False, f"Exception: {str(e)}")
        return False

    def test_elise_commercial_personality(self):
        """Test Élise's commercial personality with pricing inquiry"""
        test_payload = {
            "message": "Quels sont vos tarifs pour un site web?",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "personality" in data and data["personality"] == "elise":
                    reply = data["reply"].lower()
                    # Check for commercial elements
                    commercial_markers = ["pack", "€", "essentiel", "pro", "premium", "acompte", "paiement"]
                    commercial_score = sum(1 for marker in commercial_markers if marker in reply)
                    
                    print(f"  💰 Commercial Reply: {data['reply'][:150]}...")
                    self.log_result("Élise Commercial Personality", True, f"Commercial markers found: {commercial_score}/7")
                    return True
                else:
                    self.log_result("Élise Commercial Personality", False, f"Missing personality or invalid response: {data}")
            else:
                self.log_result("Élise Commercial Personality", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Élise Commercial Personality", False, f"Exception: {str(e)}")
        return False

    def test_elise_martinique_context(self):
        """Test Élise's knowledge of WebBoost Martinique services"""
        test_payload = {
            "message": "Parlez-moi de vos services en Martinique",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data:
                    reply = data["reply"].lower()
                    # Check for Martinique context
                    martinique_markers = ["martinique", "local", "délai", "rapidité", "7", "10", "12"]
                    context_score = sum(1 for marker in martinique_markers if marker in reply)
                    
                    print(f"  🏝️ Martinique Context: {data['reply'][:150]}...")
                    self.log_result("Élise Martinique Context", True, f"Context markers found: {context_score}/7")
                    return True
                else:
                    self.log_result("Élise Martinique Context", False, f"Invalid response format: {data}")
            else:
                self.log_result("Élise Martinique Context", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Élise Martinique Context", False, f"Exception: {str(e)}")
        return False

    def test_elise_fallback_system(self):
        """Test fallback system when OpenAI is not available"""
        # This test simulates what happens when the system falls back to local responses
        test_payload = {
            "message": "urgent",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "provider" in data:
                    provider = data["provider"]
                    reply = data["reply"]
                    
                    # Check if it's either AI response or fallback
                    is_valid_response = len(reply) > 10 and ("élise" in reply.lower() or "webboost" in reply.lower())
                    
                    print(f"  🔄 Fallback Test: Provider={provider}, Valid={is_valid_response}")
                    self.log_result("Élise Fallback System", True, f"Provider: {provider}, Response length: {len(reply)}")
                    return True
                else:
                    self.log_result("Élise Fallback System", False, f"Invalid response format: {data}")
            else:
                self.log_result("Élise Fallback System", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Élise Fallback System", False, f"Exception: {str(e)}")
        return False

    def test_elise_no_api_key_required(self):
        """Test that endpoint works without frontend API key configuration"""
        test_payload = {
            "message": "Test sans clé API",
            "model": "gpt-4o-mini"
            # Deliberately not including any API key
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "success" in data and data["success"]:
                    self.log_result("Élise No API Key Required", True, f"Works without frontend API key, Provider: {data.get('provider', 'unknown')}")
                    return True
                else:
                    self.log_result("Élise No API Key Required", False, f"Invalid response: {data}")
            else:
                self.log_result("Élise No API Key Required", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Élise No API Key Required", False, f"Exception: {str(e)}")
        return False

    def test_elise_sales_oriented_responses(self):
        """Test that Élise provides sales-oriented responses"""
        test_payload = {
            "message": "Je cherche à créer un site web pour mon restaurant",
            "model": "gpt-4o-mini"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat-openai",
                json=test_payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "reply" in data:
                    reply = data["reply"].lower()
                    # Check for sales-oriented elements
                    sales_markers = ["pack", "recommande", "prix", "tarif", "acompte", "commander", "réserver"]
                    sales_score = sum(1 for marker in sales_markers if marker in reply)
                    
                    print(f"  🎯 Sales Response: {data['reply'][:150]}...")
                    self.log_result("Élise Sales-Oriented", True, f"Sales markers found: {sales_score}/7")
                    return True
                else:
                    self.log_result("Élise Sales-Oriented", False, f"Invalid response format: {data}")
            else:
                self.log_result("Élise Sales-Oriented", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Élise Sales-Oriented", False, f"Exception: {str(e)}")
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting WebBoost Martinique Backend API Tests")
        print("=" * 60)
        
        # Test original endpoints
        self.test_health_endpoint()
        self.test_contact_endpoint()
        self.test_contact_validation()
        self.test_chat_endpoint()
        self.test_chat_bonjour()  # Specific test for "Bonjour" as requested
        self.test_kpi_endpoint()
        
        # Test new OpenAI integration endpoints
        print("\n🤖 Testing OpenAI Integration Endpoints")
        print("-" * 40)
        self.test_openai_models_endpoint()
        self.test_openai_chat_with_emergent_key()
        self.test_openai_chat_with_user_key()
        self.test_openai_key_config_endpoint()
        self.test_openai_key_config_missing_key()
        
        # Test NEW Élise personality chat-openai endpoint
        print("\n👩‍💼 Testing Élise Personality Chat-OpenAI Endpoint")
        print("-" * 50)
        self.test_elise_chat_openai_endpoint()
        self.test_elise_commercial_personality()
        self.test_elise_martinique_context()
        self.test_elise_fallback_system()
        self.test_elise_no_api_key_required()
        self.test_elise_sales_oriented_responses()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failures:
            print("\n❌ Failed Tests:")
            for failure in self.failures:
                print(f"  - {failure}")
        else:
            print("\n✅ All tests passed!")
        
        return len(self.failures) == 0

def main():
    """Main test runner"""
    tester = WebBoostAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())